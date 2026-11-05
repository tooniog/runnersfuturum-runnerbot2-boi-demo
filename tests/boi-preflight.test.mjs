import test from "node:test";
import assert from "node:assert/strict";
import {GENERAL_PREPARATION,prepareCaseHandoff} from "../lib/boi-preflight.mjs";
test("self-reported preflight is deterministic and no eligibility is issued",()=>{
 const data=GENERAL_PREPARATION.map((x,i)=>({id:x.id,ready:i<3}));
 const out=prepareCaseHandoff(data,"MYBOI");
 assert.equal(out.completenessPct,60);
 assert.equal(out.outstandingPreparation.length,2);
 assert.equal(out.status,"SELF_REPORTED_NOT_VERIFIED");
 assert.ok(!("eligible" in out));
});
test("preflight rejects invalid and duplicate checklist submissions",()=>{
 const data=GENERAL_PREPARATION.map(x=>({id:x.id,ready:true}));
 assert.throws(()=>prepareCaseHandoff([...data,data[0]]));
 assert.throws(()=>prepareCaseHandoff(data,"BOI_APPROVED"));
 assert.throws(()=>prepareCaseHandoff(data.slice(1)));
});
