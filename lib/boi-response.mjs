// Pure response and export helpers: no provider calls, retries or credentials.
import {EVALUATOR_VERSION} from './boi-release.mjs';
export function completedAnswer(payload,text) {
  const incomplete=payload.status!=="completed" || Boolean(payload.incomplete_details) ||
    (payload.output||[]).some(item=>item.type==="message" && item.status && item.status!=="completed");
  return {incomplete,answer:incomplete
    ? "Response incomplete — do not treat this as a finished checklist or handover. No automatic retry was made.\n\n"+text
    : text};
}
export function citedSources(answer,sources) {
  const seen=new Set();
  const normalized=url=>{try{const u=new URL(url);return u.origin+u.pathname.replace(/\/$/,'');}catch{return '';}};
  const urls=new Set([...answer.matchAll(/https?:\/\/[^\s<>"\])]+/g)].map(m=>normalized(m[0].replace(/[.,;:]+$/,''))));
  return sources.filter(s=>{
    if(s.category!=="official_BOI" || !s.url || seen.has(s.url))return false;
    const mentioned=urls.has(normalized(s.url)) || answer.includes(s.title);
    if(mentioned)seen.add(s.url);
    return mentioned;
  }).map(({title,url,verifiedOn})=>({title,url,verifiedOn}));
}
export function exportTranscript(messages,{pageUrl,exportedAt=new Date().toISOString()}={}) {
  // Retain only the origin: share tokens, paths, queries and fragments are private.
  let origin='';
  try {const url=new URL(pageUrl);if(['https:','http:'].includes(url.protocol))origin=url.origin;}catch{}
  return "Private synthetic BOI evaluation — not a submitted case\n"+
    `Evaluator version: ${EVALUATOR_VERSION}\nExport format: boi-transcript-v3\nExported at: ${exportedAt}\n`+
    (origin?`Page origin: ${origin}\n`:'')+'\n'+
    messages.map(m=>(m.role==="user"?"You":"Runnerbot 2")+"\n"+m.text+
      (m.role==='assistant'?exportProvenance(m.provenance):'')+
      (m.sources?.length?"\n\nSources:\n"+m.sources.map(s=>s.title+"\n"+s.url).join("\n"):"")
    ).join("\n\n");
}
export function responseProvenance(data={}) {
  const result={};
  for(const key of ['mode','classification','evaluationRequestId','providerResponseId','releaseVersion','releaseCommit']){
    const value=data[key];
    if(typeof value==='string' && /^[a-zA-Z0-9_.-]{1,160}$/.test(value))result[key]=value;
  }
  return result;
}
function exportProvenance(data){
  const p=responseProvenance(data);
  if(!Object.keys(p).length)return '\n\nProvenance: not recorded for this response.';
  return '\n\nResponse provenance:\n'+Object.entries(p).map(([k,v])=>`${k}: ${v}`).join('\n')+
    (p.mode==='cached-ai'?'\nCached answer: IDs refer to the original inference, not a new paid call.':'');
}
