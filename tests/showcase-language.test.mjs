import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {showcaseScenes,showcaseOverview} from "../lib/boi-showcase.mjs";
import {JSDOM} from "jsdom";
import {runInContext} from "node:vm";

const live=readFileSync(new URL("../boi-live.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../private/evaluator.html",import.meta.url),"utf8");

test("showcase covers nine distinct BOI scenarios with specific evidence, safeguards and next steps",()=>{
  assert.equal(showcaseScenes.length,9);
  assert.equal(showcaseOverview.count,9);
  assert.equal(new Set(showcaseScenes.map(x=>x.id)).size,9);
  for(const scenario of showcaseScenes){
    for(const field of ["title","subtitle","prompt","answer","evidence","handoff","boundary","outcome","metric","sector"]){
      assert.ok(typeof scenario[field]==="string"&&scenario[field].length>8,scenario.id+" missing "+field);
    }
    assert.equal(scenario.actions.length,3);
  }
  for(const id of ["discover","route","readiness","reconcile","bdsp","languages","guard","uncertainty","measurement"]){
    assert.ok(showcaseScenes.some(x=>x.id===id),id);
  }
});
test("tour is demonstrably synthetic, no paid model calls, and user can navigate every scenario",()=>{
  assert.match(live,/SCRIPTED · SYNTHETIC · NO MODEL CALLS/);
  assert.match(live,/showcaseScenes\.forEach/);
  assert.match(live,/button\.onclick=\(\)=>\{stopShowcase\(\);sceneIndex=i;renderShowcase\(\);/);
  assert.match(live,/\\$\\('tour-play'\\)\.onclick/);
  assert.match(live,/\\$\\('tour-next'\\)\.onclick/);
  assert.match(live,/\\$\\('tour-prev'\\)\.onclick/);
  assert.match(live,/No application|no institutional|not live|no live|no model/i);
  assert.doesNotMatch(live,/Watch a preparation review/);
});
test("showcase refuses fabricated institutional approval and unearned pilot impact",()=>{
  const combined=showcaseScenes.map(s=>[s.answer,s.boundary,s.evidence].join(" ")).join(" ");
  assert.match(combined,/no eligibility/i);
  assert.match(combined,/No case automatically transferred/i);
  assert.match(combined,/No production integration/i);
  assert.match(combined,/No approval, record lookup/i);
  assert.match(combined,/no impact|not results|not completed|pilot/i);
});
test("language selection provides instant greeting and next-response indication in all five language options",()=>{
  const match=html.match(/<script>\s*(\/\/ Live corner assistant[\s\S]*?)<\/script>/);
  assert.ok(match,"Expected corner assistant inline script");
  const d=new JSDOM(html,{url:"https://runnersfuturum-runnerbot2-boi-demo.vercel.app/",runScripts:"outside-only"});
  d.window.AbortSignal.timeout=()=>undefined;
  d.window.fetch=async()=>{throw Error("Unnecessary paid API request");};
  try{
    runInContext(match[1],d.getInternalVMContext());
    d.window.openPanel();
    const document=d.window.document;
    const options=[
      ["English","English",/Hi, I'm Runnerbot 2/],
      ["Nigerian Pidgin","Nigerian Pidgin",/How far/],
      ["Yoruba","Yoruba",/Ẹ káàbọ̀/],
      ["Hausa","Hausa",/Sannu/],
      ["Igbo","Igbo",/Nnọọ/]
    ];
    for(const [label,lang,greeting] of options){
      const button=[...document.querySelectorAll("#langRow button")].find(x=>x.textContent===label);
      assert.ok(button,label);
      button.click();
      assert.match(document.getElementById("rn-language-state").textContent,new RegExp(lang));
      assert.match(document.getElementById("rn-intro").textContent,greeting);
      assert.ok(document.getElementById("rn-question").placeholder.length>5);
    }
    assert.doesNotMatch(document.getElementById("langDraftBadge").textContent,/⚠|pending native-speaker/i);
    assert.match(document.getElementById("langDraftBadge").textContent,/Verify financial terminology/i);
  }finally{d.window.close();}
});
