import test from "node:test";
import assert from "node:assert/strict";
import {documentPreparationCompleteness,incrementalInterestScenario,proposedPostPilotFeeScenario,timingInterestScenario} from "../lib/boi-evaluator-core.mjs";

test("completeness reports only self-described preparation",()=>{
  const result=documentPreparationCompleteness([{id:"a",reportedReady:true},{id:"b",reportedReady:false},{id:"c",reportedReady:true},{id:"d",reportedReady:false}]);
  assert.equal(result.percentage,50);
  assert.equal(result.verification,"SELF_REPORTED_NOT_VERIFIED");
  assert.equal(result.lendingDecision,false);
  assert.ok(result.otherDimensions.every(x=>x.status==="NOT_YET_SCORED"));
});
test("rejects unsupported checklist input",()=>{
  assert.throws(()=>documentPreparationCompleteness([]));
  assert.throws(()=>documentPreparationCompleteness([{id:"a",reportedReady:true},{id:"a",reportedReady:false}]));
});
test("interest illustrates gross income not profit",()=>{
  const result=incrementalInterestScenario({baselineFacilities:100,hypotheticalUpliftRate:0.05,averageFacilityNgn:1000000,annualInterestRate:0.1,capitalAvailabilityRate:0.5});
  assert.equal(result.hypotheticalAdditionalFacilities,2.5);
  assert.equal(result.hypotheticalAnnualGrossInterestIncomeNgn,250000);
  assert.match(result.note,/not profit/);
});
test("fee model is post-pilot only",()=>{
  const result=proposedPostPilotFeeScenario({applications:1000,paidConversionRate:0.1,feePerPaidUserNgn:10000,boiRevenueShareRate:0.2});
  assert.equal(result.hypotheticalBoiRevenueNgn,200000);
  assert.equal(result.label,"ILLUSTRATIVE_POST_PILOT_ONLY");
});
test("timing calculation is explicit",()=>{
  const result=timingInterestScenario({disbursementPrincipalNgn:3650000,proportionAdvanced:0.5,daysAdvanced:10,annualInterestRate:0.1});
  assert.equal(result.hypotheticalTimingInterestNgn,5000);
});
test("rejects invalid financial inputs",()=>{
  assert.throws(()=>incrementalInterestScenario({baselineFacilities:-1,hypotheticalUpliftRate:0.1,averageFacilityNgn:1,annualInterestRate:0.1}));
  assert.throws(()=>proposedPostPilotFeeScenario({applications:1,paidConversionRate:1.1,feePerPaidUserNgn:1,boiRevenueShareRate:0.2}));
  assert.throws(()=>timingInterestScenario({disbursementPrincipalNgn:10,proportionAdvanced:0.5,daysAdvanced:1,annualInterestRate:NaN}));
});
