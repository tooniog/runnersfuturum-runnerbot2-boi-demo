import {verifySession,cookieValue,secureHeaders,allowedOrigin} from '../lib/boi-session.mjs';
import {hasPermission} from '../lib/boi-access.mjs';

export default async function handler(req,res){
  secureHeaders(res);
  const session=verifySession(cookieValue(req),process.env.BOI_COOKIE_SECRET);
  if(!session)return res.status(401).json({error:'SIGN_IN_REQUIRED'});
  if(!hasPermission(session,'review:prepare'))return res.status(403).json({error:'PERMISSION_DENIED'});
  if(req.method!=='POST')return res.status(405).end();
  if(!allowedOrigin(req))return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'});
  try{
    const data=typeof req.body==='string'?JSON.parse(req.body):req.body;
    if(!data||data.synthetic!==true||Object.keys(data).some(k=>!['synthetic','equipmentCost','otherCosts','contribution','request'].includes(k)))throw Error();
    const amounts=['equipmentCost','otherCosts','contribution','request'].map(k=>data[k]);
    if(amounts.some(x=>typeof x!=='number'||!Number.isFinite(x)||x<0||x>1e12))throw Error();
    const cents=amounts.map(x=>Math.round(x*100));
    const [equipment,other,contribution,request]=cents;
    const total=equipment+other;
    if(total>1e14||contribution+request>1e14)throw Error();
    return res.status(200).json({synthetic:true,preparedBy:session.sub,role:session.role,
      facts:{equipmentCost:equipment/100,otherCosts:other/100,contribution:contribution/100,request:request/100},
      totalProjectCost:total/100,fundingGap:Math.max(0,total-contribution)/100,
      excessFunding:(contribution+request-total)/100,
      questions:['Are all costs for the same project and supported by quotations?','Is the contribution committed and available?','Explain any excess or shortfall before human review.'],
      notice:'Synthetic preparation handover only. No approval, eligibility decision, record access, submission or notification.',externalActionExecuted:false});
  }catch{return res.status(400).json({error:'INVALID_SYNTHETIC_REVIEW'});}
}
