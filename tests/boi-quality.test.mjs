import test from "node:test";
import assert from "node:assert/strict";
import {compareSyntheticRevenue} from "../lib/boi-quality.mjs";
test("Detect illustrative discrepancy without eligibility judgement",()=>{
 const q=compareSyntheticRevenue({planMonthlySalesNgn:100000,recordsMonthlySalesNgn:85000,samePeriodConfirmed:true});
 assert.equal(q.status,"REVIEW_DISCREPANCY");
 assert.equal(q.differencePercentage,15);
 assert.equal(q.eligibilityDecision,false);
});
test("Fail closed on period mismatch and invalid amounts",()=>{
 assert.equal(compareSyntheticRevenue({planMonthlySalesNgn:100,recordsMonthlySalesNgn:150,samePeriodConfirmed:false}).status,"NEEDS_CLARIFICATION");
 assert.throws(()=>compareSyntheticRevenue({planMonthlySalesNgn:-2,recordsMonthlySalesNgn:8,samePeriodConfirmed:true}));
});
