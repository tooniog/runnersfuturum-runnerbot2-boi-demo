import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {readFileSync} from 'node:fs';
import {citedSources} from '../lib/boi-response.mjs';
import {EVALUATOR_VERSION} from '../lib/boi-release.mjs';

test('actual chat and export handlers preserve both turns, cited URLs and clear state without network calls',async()=>{
  const sources=JSON.parse(readFileSync(new URL('../data/boi-knowledge-v1.json',import.meta.url))).sources;
  const advisory=sources.find(s=>s.title.includes('BDSP Directory'));
  const impact=sources.find(s=>s.title.includes('Impact Report'));
  assert.ok(advisory?.url);assert.ok(impact?.url);
  const firstQuestion='Fictional registered cassava processor in Ogun State: what should I prepare?';
  const secondQuestion='Equipment ₦12 million, funds ₦3 million, draft request ₦10 million. Identify the inconsistency.';
  const firstAnswer='General preparation guidance. '+('Full preparation detail. '.repeat(60))+`See [BOI advisory](${advisory.url}).`;
  const secondAnswer=`₦9 million funding gap if available funds are committed; ₦1 million unexplained. Registered cassava processor in Ogun State. See [BOI advisory](${advisory.url}).`;
  const replies=[firstAnswer,secondAnswer].map(answer=>({answer,sources:citedSources(answer,[advisory,impact]),classification:'ANSWER',mode:'live-ai-boi-evaluation',evaluationRequestId:'request-fixture-1',providerResponseId:'resp_fixture_1',releaseCommit:'abc123'}));
  const dom=new JSDOM('<body><div class="transparency-banner"></div></body>',{url:'https://evaluator.example/?_vercel_share=private-share#private-fragment'});
  const originals=new Map(['document','location','fetch'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  const oldCreate=URL.createObjectURL,oldRevoke=URL.revokeObjectURL;
  const requests=[],downloads=[];let blob;
  dom.window.HTMLElement.prototype.scrollIntoView=function(){};
  dom.window.HTMLAnchorElement.prototype.click=function(){downloads.push({filename:this.download,href:this.href});};
  Object.defineProperty(globalThis,'document',{value:dom.window.document,configurable:true});
  Object.defineProperty(globalThis,'location',{value:dom.window.location,configurable:true});
  globalThis.fetch=async(url,options)=>{
    if(url==='/api/status')return {json:async()=>({authenticated:true,aiAvailable:false,knowledgeVersion:'test'})};
    assert.equal(url,'/api/chat');requests.push(JSON.parse(options.body));
    return {ok:true,json:async()=>replies[requests.length-1]};
  };
  URL.createObjectURL=value=>{blob=value;return 'blob:export-test';};URL.revokeObjectURL=()=>{};
  try{
    await import('../boi-live.js');
    const $=id=>dom.window.document.getElementById(id);
    for(const question of [firstQuestion,secondQuestion]){
      $('eval-question').value=question;
      await $('eval-form').onsubmit({preventDefault(){}});
    }
    assert.equal(requests.length,2);
    assert.equal(requests[1].history[0].content,firstQuestion);
    assert.match($('eval-messages').textContent,/₦1 million unexplained/);
    assert.deepEqual([...$('eval-messages').querySelectorAll('a')].map(a=>a.href),[advisory.url,advisory.url,advisory.url,advisory.url]);
    $('eval-export').click();
    const exported=await blob.text();
    assert.equal(downloads[0].filename,'boi-evaluation-conversation.txt');
    for(const text of [firstQuestion,firstAnswer,secondQuestion,secondAnswer,advisory.url,advisory.title,EVALUATOR_VERSION])assert.ok(exported.includes(text),text);
    assert.match(exported,/Sources:\n/);assert.match(exported,/evaluationRequestId: request-fixture-1/);assert.match(exported,/providerResponseId: resp_fixture_1/);
    assert.match(exported,/Page origin: https:\/\/evaluator.example/);
    assert.doesNotMatch(exported,/private-share|private-fragment|_vercel_share/);
    assert.ok(!exported.includes(impact.url));assert.ok(!exported.includes(impact.title));
    $('eval-clear').click();$('eval-export').click();
    assert.equal($('eval-messages').textContent,'');
    assert.doesNotMatch(await blob.text(),/cassava|₦|Sources:/);
    assert.equal(requests.length,2,'Export and clear must not call the model');
  }finally{
    dom.window.close();URL.createObjectURL=oldCreate;URL.revokeObjectURL=oldRevoke;
    for(const [k,d] of originals){if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];}
  }
});
