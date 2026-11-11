import test from 'node:test';import assert from 'node:assert/strict';
import {neonConfig} from '@neondatabase/serverless';
import chat from '../api/chat.js';import {makeSession} from '../lib/boi-session.mjs';
const secret='fake-test-cookie-secret-with-adequate-length';
const response=()=>({setHeader(){},status(code){this.code=code;return this;},json(data){this.data=data;return this;},end(){return this;}});
const sqlResult=(name,value,type=16)=>new Response(JSON.stringify({fields:[{name,dataTypeID:type}],rows:[[value]],rowCount:1,command:'SELECT'}),{status:200});
async function run({reserve='ok',settle='ok',provider='ok',usage={input_tokens:400,output_tokens:80},answer='Prepare the business facts and check the official requirements.',history=[],repeat=false}={}){
 const previousFetch=globalThis.fetch,previousNeon=neonConfig.fetchFunction;const env={BOI_COOKIE_SECRET:secret,BOI_AI_ENABLED:'true',BOI_AI_PRICING_CONFIRMED:'true',OPENAI_API_KEY:'fake-local-test-only',DATABASE_URL:'postgresql://test:test@ep-example.us-east-2.aws.neon.tech/boi'};const old=Object.fromEntries(Object.keys(env).map(k=>[k,process.env[k]]));Object.assign(process.env,env);
 const events=[];let providerCalls=0;
 neonConfig.fetchFunction=async(url,options)=>{const q=JSON.parse(options.body).query;events.push(q);
  if(q.includes('boi_reserve_v2')){if(reserve==='error')throw Error('ledger unavailable');return sqlResult('accepted',reserve==='reject'?'f':'t');}
  if(q.includes('boi_settle_v2')){if(settle==='error')throw Error('settle unavailable');return sqlResult('boi_settle_v2','',25);}
  if(q.includes('boi_halt'))return sqlResult('boi_halt','',25);
  throw Error('Unexpected SQL');};
 globalThis.fetch=async(url,options)=>{providerCalls++;assert.equal(url,'https://api.openai.com/v1/responses');const b=JSON.parse(options.body);assert.equal(b.store,false);assert.equal(b.max_output_tokens,1024);assert.equal(b.reasoning.effort,'none');if(provider==='error')throw Error('provider unavailable');return {ok:true,json:async()=>({status:'completed',output_text:answer,usage})};};
 const req={method:'POST',headers:{host:'test.example',origin:'https://test.example',cookie:'__Host-boi_eval='+makeSession('EVALUATOR_OBSERVER',secret)},body:{message:'Explain cash-flow preparation for a fictional cassava processor.',perspective:'Applicant',history}};
 try{const r=response();await chat(req,r);let second;if(repeat){second=response();await chat(req,second);}return {r,second,events,providerCalls};}
 finally{globalThis.fetch=previousFetch;neonConfig.fetchFunction=previousNeon;for(const [k,v]of Object.entries(old))if(v===undefined)delete process.env[k];else process.env[k]=v;}
}
test('reservation rejection or ledger outage makes zero provider requests',async()=>{for(const reserve of ['reject','error']){const x=await run({reserve});assert.equal(x.r.code,503);assert.equal(x.providerCalls,0);}});
test('provider failure retains reservation and suspends further paid requests without retry',async()=>{const x=await run({provider:'error'});assert.equal(x.r.code,502);assert.equal(x.providerCalls,1);assert.ok(x.events.some(q=>q.includes('boi_halt')));assert.ok(!x.events.some(q=>q.includes('boi_settle_v2')));});
test('missing usage or settlement failure fails closed and records halt',async()=>{for(const config of [{usage:null},{settle:'error'}]){const x=await run(config);assert.equal(x.r.data.error,'USAGE_RECONCILIATION_REQUIRED');assert.equal(x.providerCalls,1);assert.ok(x.events.some(q=>q.includes('boi_halt')));}});
test('successful provider response reconciles once, repeat is free cached response',async()=>{const x=await run({repeat:true,answer:'### Preparation\n**Business facts** and evidence are needed.'});assert.doesNotMatch(x.r.data.answer,/###|\*\*/);assert.equal(x.r.code,200);assert.equal(x.r.data.mode,'live-ai-boi-evaluation');assert.equal(x.providerCalls,1);assert.equal(x.second.data.mode,'cached-ai');assert.equal(x.events.filter(q=>q.includes('boi_settle_v2')).length,1);});
test('unsupported output URL never reaches client and sensitive history never reaches provider',async()=>{const x=await run({answer:'Apply at https://untrusted.example/'});assert.equal(x.r.data.classification,'ESCALATE');assert.ok(!x.r.data.answer.includes('untrusted'));const y=await run({history:[{role:'user',content:'My BVN is 12345678901'}]});assert.equal(y.r.data.classification,'REFUSE');assert.equal(y.providerCalls,0);});
