import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script,runInContext} from "node:vm";
import {JSDOM} from "jsdom";

const html=readFileSync(new URL("../private/evaluator.html",import.meta.url),"utf8");
const match=html.match(/<script>\s*(\/\/ Live corner assistant[\s\S]*?)<\/script>/);
assert.ok(match,"Live corner script must exist in the authenticated evaluator HTML");

function widget(fetchHandler) {
  const dom=new JSDOM(html,{url:"https://runnersfuturum-runnerbot2-boi-demo.vercel.app/",runScripts:"outside-only"});
  dom.window.AbortSignal.timeout=()=>undefined;
  dom.window.fetch=fetchHandler;
  runInContext(match[1],dom.getInternalVMContext());
  dom.window.openPanel();
  return dom;
}
const wait=()=>new Promise(r=>setTimeout(r,25));

test("live corner assistant script is syntactically valid and has no scripted decision tree",()=>{
  assert.doesNotThrow(()=>new Script(match[1]));
  assert.doesNotMatch(match[1],/function renderNode|food_micro:\s*\{|const en\s*=/);
  assert.match(match[1],/fetch\("\/api\/chat"/);
  assert.match(match[1],/history:rnHistory|history,perspective/);
});
test("corner sends free-form BOI question to authenticated shared API, renders model answer and retains follow-up context",async()=>{
  const calls=[];
  const dom=widget(async(url,opts)=>{
    calls.push({url,payload:JSON.parse(opts.body)});
    return {ok:true,status:200,json:async()=>({answer:calls.length===1?"Ask about the equipment and business stage.":"That quotation can help your preparation.",sources:[],mode:"live-ai-boi-evaluation",classification:"ANSWER",externalActionExecuted:false})};
  });
  try {
    const d=dom.window.document;
    const form=d.querySelector("#rn-live-form");
    d.querySelector("#rn-question").value="I have a synthetic equipment loan question";
    form.dispatchEvent(new dom.window.Event("submit",{bubbles:true,cancelable:true}));
    await wait();
    assert.equal(calls.length,1);
    assert.equal(calls[0].url,"/api/chat");
    assert.equal(calls[0].payload.perspective,"Applicant");
    assert.equal(calls[0].payload.language,"English");
    assert.deepEqual(calls[0].payload.history,[]);
    assert.match(d.querySelector("#chatBody").textContent,/Ask about the equipment/);
    d.querySelector("#rn-question").value="What if I only have a supplier quote?";
    form.dispatchEvent(new dom.window.Event("submit",{bubbles:true,cancelable:true}));
    await wait();
    assert.equal(calls.length,2);
    assert.equal(calls[1].payload.history.length,2);
    assert.equal(calls[1].payload.history[0].role,"user");
    assert.equal(calls[1].payload.history[1].role,"assistant");
    assert.match(d.querySelector("#chatBody").textContent,/That quotation/);
  }finally{dom.window.close();}
});
test("corner language switches control model-language request without wiping conversation",async()=>{
  const calls=[];
  const dom=widget(async(url,opts)=>{calls.push(JSON.parse(opts.body));return {ok:true,status:200,json:async()=>({answer:"Nkọwa nchekwa",sources:[],mode:"live-ai-boi-evaluation"})};});
  try {
    const d=dom.window.document;
    [...d.querySelectorAll("#langRow button")].find(x=>x.textContent==="Igbo").click();
    d.querySelector("#rn-question").value="Kedu ihe a ga-akwadebe?";
    d.querySelector("#rn-live-form").dispatchEvent(new dom.window.Event("submit",{bubbles:true,cancelable:true}));
    await wait();
    assert.equal(calls[0].language,"Igbo");
    assert.match(d.querySelector("#rn-live-status").textContent,/Live AI response/);
    assert.equal(d.querySelector("#langDraftBadge").classList.contains("show"),true);
    [...d.querySelectorAll("#langRow button")].find(x=>x.textContent==="English").click();
    d.querySelector("#plainSwitch").click();
    d.querySelector("#rn-question").value="Explain this in easier words";
    d.querySelector("#rn-live-form").dispatchEvent(new dom.window.Event("submit",{bubbles:true,cancelable:true}));
    await wait();
    assert.equal(calls[1].language,"Plain English");
    assert.equal(calls[1].history.length,2);
  }finally{dom.window.close();}
});
test("budget-stop errors are surfaced without retries or fabricated answers",async()=>{
  let n=0;
  const dom=widget(async()=>{n++;return {ok:false,status:503,json:async()=>({error:"LIVE_AI_BUDGET_STOP",fallback:"Use the guided demonstration; no further credits are needed."})};});
  try {
    const d=dom.window.document;
    d.querySelector("#rn-question").value="Please advise on a fictional application";
    d.querySelector("#rn-live-form").dispatchEvent(new dom.window.Event("submit",{bubbles:true,cancelable:true}));
    await wait();
    assert.equal(n,1);
    assert.match(d.querySelector("#chatBody").textContent,/no further credits/);
    assert.match(d.querySelector("#rn-live-status").textContent,/spending limit/i);
  }finally{dom.window.close();}
});
test("source links reject non-BOI domains and the reset clears context",async()=>{
  const calls=[];
  const dom=widget(async(url,opts)=>{calls.push(JSON.parse(opts.body));return {ok:true,status:200,json:async()=>({answer:"BOI materials",sources:[{title:"Official BOI",url:"https://www.boi.ng/business-advisory/"},{title:"External",url:"https://not-boi.example/"}],mode:"live-ai-boi-evaluation"})};});
  try {
    const d=dom.window.document;
    d.querySelector("#rn-question").value="What sources apply?";
    d.querySelector("#rn-live-form").dispatchEvent(new dom.window.Event("submit",{bubbles:true,cancelable:true}));
    await wait();
    const anchors=[...d.querySelectorAll("#chatBody a")];
    assert.equal(anchors.length,1);
    assert.equal(new URL(anchors[0].href).hostname,"www.boi.ng");
    d.querySelector("#rn-reset").click();
    d.querySelector("#rn-question").value="Start over with a new question";
    d.querySelector("#rn-live-form").dispatchEvent(new dom.window.Event("submit",{bubbles:true,cancelable:true}));
    await wait();
    assert.equal(calls[1].history.length,0);
  }finally{dom.window.close();}
});
