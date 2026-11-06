// Synthetic, scripted presentation of proposed BOI-scoped evaluator workflows.
// NOT recorded live model output, a BOI integration, a loan decision, or pilot evidence.
export const showcaseScenes = [
  {
    id:"discover",chapter:"01 / DISCOVERY",title:"Understand the enterprise",
    subtitle:"From an unclear question to a useful preparation plan",
    sector:"Enterprise onboarding",icon:"◎",accent:"blue",
    prompt:"I process cassava in Ogun. I need a new dryer, but I don't know where to begin.",
    answer:"I can help you prepare a fictional equipment-finance enquiry. What equipment and supplier quotation do you have? Is the business registered, and what production and sales records are available? We can organise the information before choosing an official BOI route.",
    actions:["Recognise equipment-finance preparation intent","Identify missing information without collecting identity records","Plan a targeted set of follow-up questions"],
    evidence:"Relevant BOI reference material is retrieved when live AI is used.",
    handoff:"Next: structured checklist for the entrepreneur",
    boundary:"Preparation only — no eligibility decision or application submitted",
    outcome:"A clearer first conversation",metric:"Context captured, not guessed"
  },
  {
    id:"route",chapter:"02 / ROUTING",title:"Distinguish the right channels",
    subtitle:"MyBOI · iProgrammes · Business Advisory",
    sector:"Programme navigation",icon:"◇",accent:"teal",
    prompt:"Should I use MyBOI, iProgrammes, or ask a BDSP for help?",
    answer:"MyBOI supports BOI's general application processes. iProgrammes serves specific intervention programmes. A BDSP can help organise documentation and planning. Requirements and availability must be checked against current BOI guidance; no eligibility is presumed.",
    actions:["Compare the purpose of official channels","Flag programme-dependent requirements","Offer verified routes instead of inventing an application"],
    evidence:"MyBOI and BOI Business Advisory are official references; current programme availability requires checking.",
    handoff:"Next: choose a published route and verify its requirements",
    boundary:"No referral, booking, submission or access to BOI portals",
    outcome:"Less navigation friction",metric:"Source-led guidance"
  },
  {
    id:"readiness",chapter:"03 / PREPARATION",title:"Build the readiness checklist",
    subtitle:"Show missing documents, not an artificial credit score",
    sector:"Application preparation",icon:"▤",accent:"blue",
    prompt:"We have our CAC details, a quotation and sales records. What is still missing?",
    answer:"Those are useful starting materials. We should still check the current programme-specific requirements, ownership and operations information, records of business finances, equipment rationale and proposed contribution if relevant. A BDSP can review the preparation pack.",
    actions:["Map supplied information to general categories","Surface gaps for human review","Create a shareable synthetic preparation summary"],
    evidence:"Illustrative checklist; actual required documents vary by programme.",
    handoff:"Next: review outstanding items with the applicant or BDSP",
    boundary:"Checklist completeness is not creditworthiness or approval",
    outcome:"More orderly preparation",metric:"No invented readiness score"
  },
  {
    id:"reconcile",chapter:"04 / QUALITY CONTROL",title:"Catch a financial discrepancy",
    subtitle:"Flag mismatches before a human spends time reviewing",
    sector:"Consistency and quality",icon:"≠",accent:"amber",
    prompt:"My fictional plan says ₦1.2m monthly sales; the records say ₦850k. Is that a problem?",
    answer:"The illustrative figures differ by ₦350,000. Before drawing conclusions, confirm whether they cover the same period and whether one is a forecast while the other is actual sales. Record the explanation and ask a qualified reviewer to reconcile the documents.",
    actions:["Extract both labelled monthly amounts","Compute ₦1,200,000 − ₦850,000 = ₦350,000","Request period and actual-versus-forecast clarification"],
    evidence:"Arithmetic is deterministic; the scenario values are fictional.",
    handoff:"Next: produce a discrepancy note for human verification",
    boundary:"No fraud accusation, risk rating or automated rejection",
    outcome:"Potential rework detected",metric:"₦350k synthetic mismatch"
  },
  {
    id:"bdsp",chapter:"05 / HANDOFF",title:"Prepare a BDSP-ready summary",
    subtitle:"Human judgement stays in control",
    sector:"Advisor productivity",icon:"⇄",accent:"teal",
    prompt:"Can you prepare a summary that an adviser could review?",
    answer:"I can structure a fictional case summary covering business context, equipment purpose, available documentation, missing information, open questions and suggested next steps. A human should validate it before use. I cannot send it to BOI or a BDSP.",
    actions:["Consolidate non-sensitive case facts","Separate confirmed facts from unanswered questions","Present a reviewable handover outline"],
    evidence:"Synthetic preparation transcript only; no institutional destination is connected.",
    handoff:"Next: human approves, corrects or discards the summary",
    boundary:"No case automatically transferred to anyone",
    outcome:"More usable handovers",metric:"Human-review checkpoint"
  },
  {
    id:"languages",chapter:"06 / INCLUSION",title:"Speak in the applicant's language",
    subtitle:"English · Pidgin · Yoruba · Hausa · Igbo",
    sector:"Multilingual assistance",icon:"文",accent:"blue",
    prompt:"Please explain the difference between a quotation and a business plan in Yoruba.",
    answer:"The live assistant can respond in the selected language while keeping financial figures and programme names exact. Language output is AI-assisted and terminology should be checked before formal use.",
    actions:["Use the selected language for the next response","Preserve amounts, named programmes and uncertainty","Retain conversation context across language switches"],
    evidence:"Live translation is available through the shared AI endpoint; no native-speaker certification claimed.",
    handoff:"Next: confirm financial terminology with a qualified reviewer",
    boundary:"AI-supported language access, not validated translation",
    outcome:"A more accessible conversation",metric:"6 selectable response modes"
  },
  {
    id:"guard",chapter:"07 / SAFEGUARDS",title:"Respect institutional authority",
    subtitle:"Refuse requests the evaluator must not perform",
    sector:"Privacy and governance",icon:"⌁",accent:"rose",
    prompt:"Approve my application, guarantee financing, and retrieve my real application status.",
    answer:"I cannot approve, reject or guarantee BOI financing or access real application records. BOI officers retain all funding authority. Use your own MyBOI account or official BOI customer support for a genuine case. Never share passwords, BVNs or OTPs.",
    actions:["Detect approval and application-status requests","Refuse unsupported action and data access","Provide an official human-facing path"],
    evidence:"Deterministic safety controls are separately tested in the evaluator.",
    handoff:"Next: applicant contacts verified official channels",
    boundary:"No approval, record lookup or fictional human escalation",
    outcome:"Authority preserved",metric:"0 external actions"
  },
  {
    id:"uncertainty",chapter:"08 / UNCERTAINTY",title:"Handle incomplete financial evidence",
    subtitle:"Useful guidance without inventing eligibility",
    sector:"Edge-case handling",icon:"?",accent:"amber",
    prompt:"I have a supplier quotation but no audited accounts. Am I automatically ineligible?",
    answer:"Not necessarily. A missing audited statement alone cannot establish eligibility or ineligibility. Confirm the exact programme requirements with BOI, gather the financial records you do have, and prepare your business rationale for review.",
    actions:["Recognise missing financial evidence","Distinguish unknown requirements from an adverse decision","Offer realistic preparation alternatives"],
    evidence:"Requirements differ by programme and should be verified against official guidance.",
    handoff:"Next: obtain programme-specific document requirements",
    boundary:"No fabricated exception, automatic disqualification or guarantee",
    outcome:"Fewer misleading answers",metric:"Uncertainty surfaced"
  },
  {
    id:"measurement",chapter:"09 / INSTITUTIONAL VALUE",title:"Show what a pilot would measure",
    subtitle:"Accountable evaluation instead of invented impact",
    sector:"Executive and operations",icon:"▥",accent:"teal",
    prompt:"How would BOI know whether a 90-day pilot actually helps?",
    answer:"Agree a bounded synthetic or approved pilot cohort, establish a baseline, and compare preparation completeness, repeat clarification, handling time, human corrections and safe referral outcomes. Report the methods and limitations. Do not claim savings or financing impact before results exist.",
    actions:["Define baseline and comparison approach","Specify review checkpoints and negative outcomes","Report measured results with governance and limitations"],
    evidence:"This is a proposed measurement framework, not results from a completed BOI pilot.",
    handoff:"Next: institution approves scope, governance and acceptance criteria",
    boundary:"No production integration, attribution or quantified benefit claimed",
    outcome:"A testable value case",metric:"Metrics pending pilot"
  }
];

export const showcaseOverview = Object.freeze({
  count:showcaseScenes.length,
  status:"SCRIPTED SYNTHETIC DEMONSTRATION",
  scope:"BOI-aligned research evaluator · no live institutional connection"
});
