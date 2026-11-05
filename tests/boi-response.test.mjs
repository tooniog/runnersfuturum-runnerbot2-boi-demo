import test from 'node:test';
import assert from 'node:assert/strict';
import {completedAnswer,citedSources,exportTranscript} from '../lib/boi-response.mjs';
import {reserveEstimate,conservativeCharge} from '../lib/boi-budget.mjs';
test('provider token exhaustion is explicitly incomplete without retry',()=>{
 const r=completedAnswer({status:'incomplete',incomplete_details:{reason:'max_output_tokens'}},'A summary does not replace');
 assert.equal(r.incomplete,true);assert.match(r.answer,/Response incomplete/);assert.match(r.answer,/No automatic retry/);
});
test('completed answers are unchanged; missing completion status fails closed',()=>{
 assert.deepEqual(completedAnswer({status:'completed'},'Finished.'),{answer:'Finished.',incomplete:false});
 assert.equal(completedAnswer({},'Partial').incomplete,true);
});
test('source list excludes unrelated retrieved sources and deduplicates URLs',()=>{
 const a={category:'official_BOI',title:'Advisory',url:'https://www.boi.ng/business-advisory/'};
 const b={category:'official_BOI',title:'Impact',url:'https://www.boi.ng/impact/'};
 assert.deepEqual(citedSources('See '+a.url,[a,b,a]).map(x=>x.title),['Advisory']);
 assert.deepEqual(citedSources('Arithmetic based on your figures.',[a,b]),[]);
});
test('export preserves both turns, complete text, naira and source URLs',()=>{
 const out=exportTranscript([{role:'user',text:'₦12 million',sources:[]},{role:'assistant',text:'₦9 million gap.',sources:[{title:'Advisory',url:'https://www.boi.ng/business-advisory/'}]}]);
 assert.match(out,/You\n₦12 million/);assert.match(out,/Runnerbot 2\n₦9 million gap/);assert.match(out,/https:\/\/www.boi.ng\/business-advisory\//);
 assert.doesNotMatch(exportTranscript([]),/₦12/);
});
test('expanded answer allowance is reserved conservatively within existing ceiling',()=>{
 assert.ok(reserveEstimate({prompt:'Test',outputTokens:640})>=conservativeCharge({input_tokens:100,output_tokens:640}));
 assert.throws(()=>reserveEstimate({prompt:'Test',outputTokens:641}));
 assert.throws(()=>reserveEstimate({prompt:'Test',outputTokens:NaN}));
});
