// BOI pre-submission preflight: only user-reported categories; never handle original documents.
// This is not the MyBOI official eligibility or validation engine.
export const GENERAL_PREPARATION=[
  {id:"registration",label:"CAC registration evidence",source:"https://onlineportal.boi.ng/"},
  {id:"business_plan",label:"Business plan or feasibility study",source:"https://onlineportal.boi.ng/"},
  {id:"financial_records",label:"Financial statements or bank statements",source:"https://onlineportal.boi.ng/"},
  {id:"identity_prepared",label:"Identification prepared for official submission only",source:"https://onlineportal.boi.ng/"},
  {id:"premises",label:"Evidence of operating premises",source:"https://onlineportal.boi.ng/"}
];
export function prepareCaseHandoff(reported,route="UNKNOWN") {
  if(!Array.isArray(reported)||reported.length!==GENERAL_PREPARATION.length||
     !["UNKNOWN","MYBOI","IPROGRAMMES"].includes(route)) throw Error("INVALID_PREFLIGHT");
  const input=new Map();
  for(const v of reported){
    if(!v||typeof v.id!=="string"||typeof v.ready!=="boolean"||input.has(v.id))
      throw Error("INVALID_PREFLIGHT_INPUT");
    input.set(v.id,v.ready);
  }
  if(GENERAL_PREPARATION.some(x=>!input.has(x.id))) throw Error("PREFLIGHT_MISSING_ITEMS");
  const count=GENERAL_PREPARATION.filter(x=>input.get(x.id)).length;
  const outstanding=GENERAL_PREPARATION.filter(x=>!input.get(x.id)).map(x=>x.label);
  return {
    status:"SELF_REPORTED_NOT_VERIFIED",
    countReady:count,applicableItems:GENERAL_PREPARATION.length,
    completenessPct:100*count/GENERAL_PREPARATION.length,
    route,
    outstandingPreparation:outstanding,
    bdspHandoffSummary:`Synthetic preparation summary: ${count} of ${GENERAL_PREPARATION.length} general preparation categories reported ready. Outstanding: ${outstanding.join("; ")||"none reported"}. Requires human review and programme-specific checklist verification.`,
    instructions:"Do not paste BVN, NIN, passport images, bank credentials or identity documents. Submit formally only through BOI's approved portals.",
    note:"General demonstration categories, not an official programme checklist, document verification, eligibility verdict, credit assessment, application submission or BOI decision."
  };
}
