// BOI evaluator deterministic calculations. No model calls, no personal data storage.
// Calculations are illustrative only. They are not lending, eligibility or credit decisions.
const finite = (value, label) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1e12) {
    throw new TypeError(`${label} must be a finite non-negative number`);
  }
  return value;
};
const rate = (value, label) => {
  finite(value, label);
  if (value > 1) throw new RangeError(`${label} must be between 0 and 1`);
  return value;
};
const money = (amount) => {if(!Number.isFinite(amount)||Math.abs(amount)>1e12)throw new RangeError('Calculated amount exceeds supported range');return Math.round(amount*100)/100;};

export function documentPreparationCompleteness(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50)
    throw new TypeError("Provide a bounded list of checklist items");
  const seen = new Set();
  for (const item of items) {
    if (!item || typeof item.id !== "string" || !/^[A-Za-z0-9_-]{1,60}$/.test(item.id) ||
        seen.has(item.id) || typeof item.reportedReady !== "boolean")
      throw new TypeError("Checklist items require unique IDs and user-reported boolean readiness");
    seen.add(item.id);
  }
  const ready = items.filter((item) => item.reportedReady).length;
  return {
    type: "DOCUMENT_PREPARATION_COMPLETENESS",
    ready,
    applicableItems: items.length,
    percentage: Math.round((10000 * ready) / items.length) / 100,
    verification: "SELF_REPORTED_NOT_VERIFIED",
    lendingDecision: false,
    otherDimensions: ["Business model", "Financial planning", "Market validation", "Operations", "Leadership"].map((name) => ({ name, status: "NOT_YET_SCORED" })),
    notice: "This is a self-reported documentation-preparation metric, not an eligibility assessment, credit score or probability of approval."
  };
}

export function incrementalInterestScenario({
  baselineFacilities, hypotheticalUpliftRate, averageFacilityNgn,
  annualInterestRate, capitalAvailabilityRate = 1
}) {
  finite(baselineFacilities, "baselineFacilities");
  rate(hypotheticalUpliftRate, "hypotheticalUpliftRate");
  finite(averageFacilityNgn, "averageFacilityNgn");
  rate(annualInterestRate, "annualInterestRate");
  rate(capitalAvailabilityRate, "capitalAvailabilityRate");
  const hypotheticalAdditionalFacilities = baselineFacilities * hypotheticalUpliftRate * capitalAvailabilityRate;
  return {
    hypotheticalAdditionalFacilities,
    hypotheticalIncrementalPrincipalNgn: money(hypotheticalAdditionalFacilities * averageFacilityNgn),
    hypotheticalAnnualGrossInterestIncomeNgn: money(hypotheticalAdditionalFacilities * averageFacilityNgn * annualInterestRate),
    label: "ILLUSTRATIVE_NOT_FORECAST",
    note: "Gross interest income is not profit. This scenario assumes additional qualified demand, processing capacity, capital availability and successful disbursement. None is established by this calculator."
  };
}

export function proposedPostPilotFeeScenario({
  applications, paidConversionRate, feePerPaidUserNgn, boiRevenueShareRate
}) {
  finite(applications, "applications");
  rate(paidConversionRate, "paidConversionRate");
  finite(feePerPaidUserNgn, "feePerPaidUserNgn");
  rate(boiRevenueShareRate, "boiRevenueShareRate");
  return {
    hypotheticalBoiRevenueNgn: money(applications * paidConversionRate * feePerPaidUserNgn * boiRevenueShareRate),
    label: "ILLUSTRATIVE_POST_PILOT_ONLY",
    note: "No applicant fees or paid priority during the proposed 90-day pilot. Any post-pilot fee would require BOI approval and must never affect lending priority."
  };
}

export function timingInterestScenario({
  disbursementPrincipalNgn, proportionAdvanced, daysAdvanced, annualInterestRate
}) {
  finite(disbursementPrincipalNgn, "disbursementPrincipalNgn");
  rate(proportionAdvanced, "proportionAdvanced");
  finite(daysAdvanced, "daysAdvanced");
  rate(annualInterestRate, "annualInterestRate");
  return {
    hypotheticalTimingInterestNgn: money(disbursementPrincipalNgn * proportionAdvanced * (daysAdvanced / 365) * annualInterestRate),
    label: "ILLUSTRATIVE_NOT_FORECAST",
    note: "Simplified gross interest timing illustration, not profit, liquidity availability, a repayment schedule or an observed BOI outcome."
  };
}
