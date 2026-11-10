import {verifySession,cookieValue,secureHeaders,allowedOrigin} from '../lib/boi-session.mjs';
import {budgetMonitor,haltBudget} from '../lib/boi-budget.mjs';
export default async function handler(req,res) {
 secureHeaders(res);
 const session=verifySession(cookieValue(req),process.env.BOI_COOKIE_SECRET);
 if(!session)return res.status(401).json({error:'SIGN_IN_REQUIRED'});
 if(session.role!=='RUNNERS_ADMIN')return res.status(403).json({error:'ADMIN_REQUIRED'});
 if(!['GET','POST'].includes(req.method))return res.status(405).end();
 if(req.method==='POST') {
  if(!allowedOrigin(req))return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'});
  if(req.body?.action!=='suspend')return res.status(400).json({error:'ONLY_SUSPEND_SUPPORTED'});
  try{await haltBudget(null,'ADMIN_SUSPENDED');}catch{return res.status(503).json({error:'CONTROL_UNAVAILABLE'});}
 }
 try{return res.status(200).json(await budgetMonitor());}
 catch{return res.status(503).json({error:'BUDGET_MONITOR_UNAVAILABLE',paidInferenceStatus:'FAIL_CLOSED'});}
}
