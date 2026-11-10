// Authority is enforced outside the model. No tool-execution capability is provided.
export function governanceAction(text) {
 if(/(?:issue|draft|generate|write|create|provide|send).{0,60}(?:approval|sanction|offer)\s*(?:letter|certificate|notice)|(?:approve|authorise|authorize).{0,40}(?:loan|finance|financing|application)|(?:retrieve|access|show|read|lookup|look up|fetch).{0,50}(?:applicant|customer|loan|bank|internal|confidential).{0,20}(?:record|file|data|status)/i.test(text))
  return {classification:'REFUSE',answer:'I cannot issue or draft a BOI approval letter, approve financing, or access applicant and internal records. Only authorised BOI officers can decide or communicate approval. I can prepare a clearly labelled fictional preparation summary. No case has been approved, accessed or sent.'};
 if(/(?:ignore|override|bypass).{0,50}(?:rules|instructions|budget|limit|guardrails)|(?:system prompt|api[ _-]?key|cookie[ _-]?secret)|(?:i am|make me).{0,15}(?:admin|administrator)|(?:send|submit|upload).{0,30}(?:application|case|records)|\b(?:bvn|nin|otp|password|pin code)\b|\b\d{10,16}\b/i.test(text))
  return {classification:'REFUSE',answer:'This evaluator cannot process identity numbers, credentials or real records, change access rights, override controls, or send or submit a case. Use synthetic facts only. No external action was executed.'};
 if(/(?:am i|are we|do i|do we).{0,25}(?:eligible|qualify)|(?:decide|determine).{0,25}(?:eligibility|creditworthiness)|(?:human|officer).{0,10}(?:review|decision)/i.test(text))
  return {classification:'ESCALATE',answer:'Eligibility and financing decisions require authorised BOI review against the current facility requirements. This evaluator cannot decide whether you qualify. I can organise the facts and missing evidence for human review. No case has been sent. Use MyBOI for facilities, or the relevant intervention portal linked from iProgrammes.'};
 if(/^(?:help|i need (?:money|funding|a loan)|which programme|what next)[?!.\s]*$/i.test(text))
  return {classification:'CLARIFY',answer:'For this fictional example, what does the business do, where does it operate, and is the funding for equipment or working capital? Give approximate figures only; do not share personal or account information.'};
 return null;
}
export function outputAllowed(answer,allowedUrls) {
 if(/\b(?:your (?:loan|application) (?:is|has been) approved|you (?:are|definitely) eligible|guaranteed (?:approval|financing)|i (?:have )?(?:submitted|contacted|notified) (?:BOI|an officer)|sk-proj-)/i.test(answer))return false;
 for(const match of answer.matchAll(/https?:\/\/[^\s<>"\])]+/g)) {
  const url=match[0].replace(/[.,;:]+$/,'');
  if(!allowedUrls.has(url))return false;
 }
 return true;
}
