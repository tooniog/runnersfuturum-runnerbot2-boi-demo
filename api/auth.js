import {createHash} from "node:crypto";
import {neon} from "@neondatabase/serverless";
import {authenticateIdentity,publicAccess} from '../lib/boi-access.mjs';
import {
  SESSION_COOKIE, SESSION_MAX_SECONDS, constantTimePasswordMatch,
  makeSession, verifySession, cookieValue, setSessionCookie,
  secureHeaders, allowedOrigin
} from "../lib/boi-session.mjs";

function body(req) {
  const data=typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  if(!data || typeof data !== "object" || JSON.stringify(data).length>1200) throw Error("INVALID_REQUEST");
  return data;
}
function fingerprint(req,secret) {
  // Vercel-supplied forwarding address; only a hashed fingerprint is retained.
  const ip=String(req.headers["x-vercel-forwarded-for"]||req.headers["x-forwarded-for"]||"unknown").split(",")[0].trim().slice(0,70);
  
  return createHash("sha256").update(secret+"|"+ip).digest("hex");
}

export default async function handler(req,res) {
  secureHeaders(res);
  const secret=process.env.BOI_COOKIE_SECRET;
  if(req.method==="GET") {
    const session=verifySession(cookieValue(req),secret);
    return res.status(200).json({authenticated:!!session,...publicAccess(session),sessionExpiresAt:session?.exp??null});
  }
  if(req.method!=="POST") return res.status(405).json({error:"METHOD_NOT_ALLOWED"});
  if(!allowedOrigin(req)) return res.status(403).json({error:"ORIGIN_NOT_ALLOWED"});
  const action=String(req.query?.action||"login");
  if(action==="logout") {
    setSessionCookie(res,"",0);
    return res.status(200).json({authenticated:false});
  }
  if(action!=="login") return res.status(404).json({error:"UNKNOWN_AUTH_ACTION"});
  if(!secret || secret.length<32 || (!process.env.BOI_EVALUATOR_PASSWORD && !process.env.BOI_TEST_IDENTITIES_JSON) ||
     !process.env.DATABASE_URL) return res.status(503).json({error:"EVALUATOR_ACCESS_NOT_CONFIGURED"});
  const sql=neon(process.env.DATABASE_URL);
  try {
    const {username,password}=body(req);
    if(typeof password!=="string" || password.length>128 || (username!==undefined && (typeof username!=='string'||username.length>64))) return res.status(400).json({error:"INVALID_CREDENTIALS"});
    const fp=fingerprint(req,secret);
    const attempts=await sql`SELECT blocked_until FROM boi_auth_throttle WHERE fingerprint=${fp}`;
    const until=attempts[0]?.blocked_until;
    if(until && new Date(until).getTime()>Date.now()) return res.status(429).json({error:"SIGN_IN_TEMPORARILY_UNAVAILABLE"});
    const identity=username?.trim()?authenticateIdentity(username,password):null;
    const role=username?.trim()?identity?.role:(process.env.BOI_ALLOW_LEGACY_ACCESS==='false'?null:constantTimePasswordMatch(password,process.env.BOI_ADMIN_PASSWORD)
      ? "RUNNERS_ADMIN"
      : constantTimePasswordMatch(password,process.env.BOI_EVALUATOR_PASSWORD)
        ? "EVALUATOR_OBSERVER" : null);
    if(!role) {
      await sql`
        INSERT INTO boi_auth_throttle(fingerprint,failures,window_started,blocked_until)
        VALUES (${fp},1,now(),NULL)
        ON CONFLICT(fingerprint) DO UPDATE SET
          failures=CASE WHEN boi_auth_throttle.window_started<now()-interval '15 minutes'
            THEN 1 ELSE boi_auth_throttle.failures+1 END,
          window_started=CASE WHEN boi_auth_throttle.window_started<now()-interval '15 minutes'
            THEN now() ELSE boi_auth_throttle.window_started END,
          blocked_until=CASE WHEN boi_auth_throttle.window_started>=now()-interval '15 minutes'
            AND boi_auth_throttle.failures>=4
            THEN now()+interval '15 minutes' ELSE NULL END
      `;
      return res.status(401).json({error:"INVALID_CREDENTIALS"});
    }
    await sql`DELETE FROM boi_auth_throttle WHERE fingerprint=${fp}`;
    const token=makeSession(role,secret,Date.now(),identity);
    setSessionCookie(res,token,SESSION_MAX_SECONDS);
    return res.status(200).json({authenticated:true,...publicAccess(verifySession(token,secret))});
  } catch(error) {
    // Never expose internal errors or secret configuration to evaluator users.
    return res.status(503).json({error:"SIGN_IN_UNAVAILABLE"});
  }
}
