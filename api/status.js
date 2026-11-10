import {readFileSync} from 'node:fs';
import {verifySession,cookieValue,secureHeaders} from '../lib/boi-session.mjs';
import {budgetAvailable,modelConfig} from '../lib/boi-budget.mjs';
import {EVALUATOR_VERSION} from '../lib/boi-release.mjs';
const knowledge=JSON.parse(readFileSync(new URL('../data/boi-knowledge-v1.json',import.meta.url),'utf8'));
export default async function handler(req,res){
 secureHeaders(res);
 if(req.method!=='GET')return res.status(405).end();
 const session=verifySession(cookieValue(req),process.env.BOI_COOKIE_SECRET);
 if(!session)return res.status(401).json({authenticated:false});
 let available=false,model=null,health='UNAVAILABLE';
 try{model=modelConfig();const enabled=process.env.BOI_AI_ENABLED==='true'&&process.env.BOI_AI_PRICING_CONFIRMED==='true'&&!!process.env.OPENAI_API_KEY;
  const budget=await budgetAvailable();available=enabled&&budget;health=available?'READY':enabled?'PAUSED':'DISABLED';
 }catch{health='FAIL_CLOSED';}
 return res.status(200).json({authenticated:true,role:session.role,aiAvailable:available,
  health,model,commit:process.env.VERCEL_GIT_COMMIT_SHA||null,deploymentUrl:process.env.VERCEL_URL||null,version:EVALUATOR_VERSION,checkedAt:new Date().toISOString(),
  environment:process.env.VERCEL_ENV||'local',knowledgeVersion:knowledge.version,
  sourceInventory:knowledge.sources.map(({title,url,category,verifiedOn,publicationDate})=>({title,url,category,verifiedOn,publicationDate})),
  noBoiSystemsConnected:true,
  evaluation:{status:'See release acceptance record; no institutional accuracy percentage claimed',record:'/release-evidence.json'},
  boundaries:['Synthetic inputs only','No lending decisions, submission or status lookup','No BOI or Microsoft 365 connection','No notification destination verified'],
  dataHandling:'Page-memory conversation; exact-answer cache scoped to signed session for up to five minutes in server memory. Metadata-only persistent budget/audit records. OpenAI receives live prompts with store:false; provider retention still requires pilot review.'});
}
