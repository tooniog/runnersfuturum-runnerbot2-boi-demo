// Pure response and export helpers: no provider calls, retries or credentials.
export function completedAnswer(payload,text) {
  const incomplete=payload.status!=="completed" || Boolean(payload.incomplete_details) ||
    (payload.output||[]).some(item=>item.type==="message" && item.status && item.status!=="completed");
  return {incomplete,answer:incomplete
    ? "Response incomplete — do not treat this as a finished checklist or handover. No automatic retry was made.\n\n"+text
    : text};
}
export function citedSources(answer,sources) {
  const seen=new Set();
  return sources.filter(s=>{
    if(s.category!=="official_BOI" || !s.url || seen.has(s.url))return false;
    const mentioned=answer.includes(s.url) || answer.includes(s.title);
    if(mentioned)seen.add(s.url);
    return mentioned;
  }).map(({title,url,verifiedOn})=>({title,url,verifiedOn}));
}
export function exportTranscript(messages) {
  return "Private synthetic BOI evaluation — not a submitted case\n\n"+
    messages.map(m=>(m.role==="user"?"You":"Runnerbot 2")+"\n"+m.text+
      (m.sources?.length?"\n\nSources:\n"+m.sources.map(s=>s.title+"\n"+s.url).join("\n"):"")
    ).join("\n\n");
}
