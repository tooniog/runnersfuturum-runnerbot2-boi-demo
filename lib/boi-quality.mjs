// Illustrative pre-submission consistency check; no credit decision or document access.
const number = (x) => {
  if(typeof x!=="number" || !Number.isFinite(x) || x<0 || x>1e12) throw new Error("INVALID_SYNTHETIC_AMOUNT");
  return Math.round(x*100)/100;
};
export function compareSyntheticRevenue({planMonthlySalesNgn,recordsMonthlySalesNgn,samePeriodConfirmed}) {
  planMonthlySalesNgn=number(planMonthlySalesNgn);
  recordsMonthlySalesNgn=number(recordsMonthlySalesNgn);
  if(typeof samePeriodConfirmed!=="boolean") throw new Error("PERIOD_CONFIRMATION_REQUIRED");
  if(!samePeriodConfirmed)
    return {status:"NEEDS_CLARIFICATION",issue:"Confirm the two figures describe the same accounting period.",eligibilityDecision:false};
  const difference=Math.round(Math.abs(planMonthlySalesNgn-recordsMonthlySalesNgn)*100)/100;
  const denominatorNgn=Math.max(planMonthlySalesNgn,recordsMonthlySalesNgn);
  const ratio=denominatorNgn===0?0:difference/denominatorNgn;
  return {
    status: ratio>0.05 ? "REVIEW_DISCREPANCY" : "NO_MATERIAL_DIFFERENCE_IN_EXAMPLE",
    differenceNgn:difference,
    differencePercentage:Math.round(ratio*10000)/100,
    denominatorNgn,
    percentageBasis:'Absolute difference divided by the larger reported amount; both zero gives 0%. Amounts rounded to kobo.',
    note:"Illustrative consistency check only. A reported discrepancy is a prompt for human discussion, not evidence of fraud, credit risk or ineligibility. It uses synthetic figures, not BOI or applicant documents.",
    eligibilityDecision:false
  };
}
