import {createHmac} from 'node:crypto';
// Exact, session-isolated, five-minute warm-instance cache. No prompt/answer database.
// Only complete validated outputs enter it. Release/model/language/context are in key.
const entries=new Map();
export function cacheKey(session,prompt,version,model) {
 if(!session.sid||!process.env.BOI_COOKIE_SECRET)return null;
 return createHmac('sha256',process.env.BOI_COOKIE_SECRET).update(JSON.stringify([session.sid,session.role,version,model,prompt])).digest('hex');
}
export function cachedAnswer(key,now=Date.now()) {
 const item=entries.get(key);
 if(!item||item.until<=now){entries.delete(key);return null;}
 return {...item.response,mode:'cached-ai',cachedAt:new Date(item.created).toISOString()};
}
export function cacheAnswer(key,response,now=Date.now()) {
 if(!key||response.incomplete||response.classification!=='ANSWER')return;
 for(const [k,v] of entries)if(v.until<=now)entries.delete(k);
 if(entries.size>=32)entries.delete(entries.keys().next().value);
 entries.set(key,{response,until:now+300000,created:now});
}
