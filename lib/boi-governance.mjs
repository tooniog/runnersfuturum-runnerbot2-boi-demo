export function safeCredentialQuestion(text){
 return !/approve|approval letter|retrieve|submit|system prompt|api.key|make me.{0,15}admin|\b\d{10,16}\b|(?:password|otp|pin|bvn)\s*(?:is|=|:)\s*\S+|(?:ignore|override|bypass).{0,40}(?:rules|instructions|controls)/i.test(text) && /(?:should|can|may|must|is it safe|do i need).{0,80}(?:share|give|require|ask|send).{0,60}(?:password|otp|pin|bvn)/i.test(text);
}
export function sensitiveDisclosure(text){return !safeCredentialQuestion(text)&& /\b(?:bvn|nin|otp|password|pin code)\b|\b\d{10,16}\b/i.test(text);}
// Authority is enforced outside the model. No tool-execution capability is provided.
export function governanceAction(text) {
 if(/^(?:(?:i|we)\s+)?(?:need|want|require|am seeking|are seeking).{0,20}(?:₦|NGN|N)?\s*\d+(?:[.,]\d+)?\s*(?:m|million|k|thousand)?(?:\s+(?:naira|loan|funding|please))*[?.!\s]*$/i.test(text))
  return {classification:'CLARIFY',answer:'For this fictional request, what does the business do, where does it operate, and is the money for equipment or working capital? Is it already trading, and what quotation, cost breakdown or sales records are available? An amount alone is not enough to suggest an official route.'};

 if(/(?:issue|draft|generate|write|create|provide|send).{0,60}(?:approval|sanction|offer)\s*(?:letter|certificate|notice)|(?:approve|authorise|authorize).{0,40}(?:loan|finance|financing|application)|(?:retrieve|access|show|read|lookup|look up|fetch).{0,50}(?:applicant|customer|loan|bank|internal|confidential).{0,20}(?:record|file|data|status)/i.test(text))
  return {classification:'REFUSE',answer:'I cannot issue or draft a BOI approval letter, approve financing, or access applicant and internal records. Only authorised BOI officers can decide or communicate approval. I can prepare a clearly labelled fictional preparation summary. No case has been approved, accessed or sent.'};
 if(/(?:ignore|override|bypass).{0,50}(?:rules|instructions|budget|limit|guardrails)|(?:system prompt|api[ _-]?key|cookie[ _-]?secret)|(?:i am|make me).{0,15}(?:admin|administrator)|(?:send|submit|upload).{0,30}(?:application|case|records)|\b(?:bvn|nin|otp|password|pin code)\b|\b\d{10,16}\b/i.test(text))
  return {classification:'REFUSE',answer:'This evaluator cannot process identity numbers, credentials or real records, change access rights, override controls, or send or submit a case. Use synthetic facts only. No external action was executed.'};
 if(/RAPID|rural/i.test(text)&& /eligib|qualif|uncertain|unclear/i.test(text))
  return {classification:'ESCALATE',answer:'For this cooperative’s RAPID enquiry, rural or rural-edge location alone does not establish eligibility. Confirm the operating address, community and local government area, activity, enterprise scale, registration, intended use of funds and supporting cost breakdown. Ask the official RAPID channel to confirm how the location and cooperative structure are treated under current requirements: https://rapid.boi.ng/ . I can help organise that evidence; only authorised BOI review can decide eligibility. No case has been sent.'};
 // A limitation such as "do not decide eligibility" is not a request for a decision.
 // Strip only that narrowly negated decision clause; refusal gates above remain intact.
 const decisionText=text.replace(/\b(?:do not|don't|never|without)\s+(?:decid(?:e|ing)|determin(?:e|ing)|assess(?:ing)?)\s+(?:(?:my|our|the|any)\s+)?(?:eligibility|creditworthiness)\b/gi,'');
 if(/(?:am i|are we|do i|do we).{0,25}(?:eligible|qualify)|(?:decide|determine).{0,25}(?:eligibility|creditworthiness)/i.test(decisionText))
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
