import test from "node:test";
import assert from "node:assert/strict";
import {HARD_CEILING_MICRO_USD,NORMAL_STOP_MICRO_USD,reserveEstimate,conservativeCharge,modelConfig} from "../lib/boi-budget.mjs";
test("hard authorization ceiling and normal stop remain fixed",()=>{
 assert.equal(HARD_CEILING_MICRO_USD,100000);
 assert.equal(NORMAL_STOP_MICRO_USD,80000);
 assert.equal(HARD_CEILING_MICRO_USD-NORMAL_STOP_MICRO_USD,20000);
});
test("reserve estimator rejects oversized and malformed prompts",()=>{
 assert.throws(()=>reserveEstimate({prompt:"x".repeat(13501)}));
 assert.throws(()=>reserveEstimate({prompt:"test",outputTokens:321}));
 assert.throws(()=>reserveEstimate({prompt:"test",outputTokens:0}));
 assert.throws(()=>reserveEstimate({prompt:null}));
});
test("conservative estimate covers corresponding recorded token charge in bounded example",()=>{
 const text="A short, controlled institutional test message";
 const reserved=reserveEstimate({prompt:text,outputTokens:320});
 const charged=conservativeCharge({input_tokens:100,output_tokens:150});
 assert.ok(reserved>0);
 assert.ok(charged>0);
 assert.ok(reserved>=charged);
});
test("provider usage cannot be reconciled when missing or malformed",()=>{
 assert.throws(()=>conservativeCharge(null));
 assert.throws(()=>conservativeCharge({input_tokens:-1,output_tokens:1}));
 assert.throws(()=>conservativeCharge({input_tokens:5,output_tokens:NaN}));
});
test("model changes fail closed until pricing is revalidated",()=>{
 const previous=process.env.BOI_AI_MODEL;
 try{
   process.env.BOI_AI_MODEL="unapproved-model";
   assert.throws(()=>modelConfig(),/PRICING_REVALIDATION_REQUIRED/);
   process.env.BOI_AI_MODEL="gpt-6-luna";
   assert.equal(modelConfig(),"gpt-6-luna");
 }finally{if(previous===undefined)delete process.env.BOI_AI_MODEL;else process.env.BOI_AI_MODEL=previous;}
});
