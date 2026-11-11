import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import {ROLE_PERMISSIONS,identityRegistry,identityTag} from './boi-access.mjs';
export const SESSION_COOKIE = "__Host-boi_eval";
export const SESSION_MAX_SECONDS = 2 * 60 * 60;

function hmac(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
function equal(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}
export function constantTimePasswordMatch(candidate, configured) {
  if (typeof candidate !== "string" || !configured || candidate.length > 128) return false;
  const salt = String(process.env.BOI_COOKIE_SECRET || "BOI_EVAL_PASSWORD_HASH");
  return equal(hmac(candidate, salt), hmac(configured, salt));
}
export function makeSession(role, secret, now = Date.now(), identity = null) {
  if (!secret || secret.length < 32) throw new Error("BOI_SESSION_NOT_CONFIGURED");
  if (!Object.hasOwn(ROLE_PERMISSIONS,role) || (!identity && !['EVALUATOR_OBSERVER','RUNNERS_ADMIN'].includes(role))) throw new Error("INVALID_SESSION_ROLE");
  if(identity && (identity.role!==role || !identity.enabled))throw Error('INVALID_IDENTITY');
  const payload = Buffer.from(JSON.stringify({ v:identity?2:1, role, ...(identity?{sub:identity.username,credentialTag:identityTag(identity)}:{}), sid:randomUUID(), exp:Math.floor(now / 1000) + SESSION_MAX_SECONDS })).toString("base64url");
  return payload + "." + hmac(payload, secret);
}
export function verifySession(cookie, secret, now = Date.now()) {
  if (!secret || typeof cookie !== "string" || cookie.length > 1024) return null;
  const [payload, sig, extra] = cookie.split(".");
  if (!payload || !sig || extra) return null;
  if (!equal(sig, hmac(payload, secret))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (![1,2].includes(data.v) || !Object.hasOwn(ROLE_PERMISSIONS,data.role) ||
        !Number.isSafeInteger(data.exp) || data.exp <= Math.floor(now / 1000)) return null;
    if(data.v===1 && (process.env.BOI_ALLOW_LEGACY_ACCESS==='false'||!['EVALUATOR_OBSERVER','RUNNERS_ADMIN'].includes(data.role)))return null;
    if(data.v===2){
      const identity=identityRegistry().find(r=>r.username===data.sub);
      if(!identity?.enabled||identity.role!==data.role||!equal(identityTag(identity),data.credentialTag))return null;
    }
    return { role:data.role, exp:data.exp, sub:data.sub||'legacy-'+data.role.toLowerCase(), ...(data.sid?{sid:data.sid}:{}) };
  } catch { return null; }
}
export function cookieValue(req, name=SESSION_COOKIE) {
  const raw = req.headers.cookie || "";
  const part = raw.split(";").map(s => s.trim()).find(s => s.startsWith(name + "="));
  return part ? part.slice(name.length+1) : "";
}
export function setSessionCookie(res, value, maxAge=SESSION_MAX_SECONDS) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${value}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`);
}
export function secureHeaders(res) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
}
export function allowedOrigin(req) {
  const origin=req.headers.origin;
  const host=req.headers.host;
  if (!origin || !host || typeof origin !== "string" || typeof host !== "string") return false;
  try {
    const parsed=new URL(origin);
    return (parsed.protocol==="https:" || (parsed.protocol==="http:" && /^localhost(:|$)|^127\.0\.0\.1(:|$)/.test(host)))
      && parsed.host === host;
  } catch { return false; }
}
