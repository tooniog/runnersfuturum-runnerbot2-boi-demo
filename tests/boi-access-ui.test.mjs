import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {ROLE_PERMISSIONS,ROLE_LABELS} from '../lib/boi-access.mjs';
test('account UI exposes only role permissions and presentation switching grants no controls',async()=>{
 const originals=new Map(['document','location','fetch'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 try{for(const [role,permissions]of Object.entries(ROLE_PERMISSIONS)){
  const dom=new JSDOM('<body><div class="transparency-banner"></div></body>',{url:'https://evaluator.example/'});
  Object.defineProperty(globalThis,'document',{value:dom.window.document,configurable:true});Object.defineProperty(globalThis,'location',{value:dom.window.location,configurable:true});
  const requests=[];globalThis.fetch=async(url)=>{requests.push(url);return {ok:true,json:async()=>url==='/api/status'?{authenticated:true,identity:'test-'+role,role,roleLabel:ROLE_LABELS[role],permissions}: {events:[]}};};
  try{await import('../boi-live.js?access='+role);await new Promise(setImmediate);
   const $=id=>dom.window.document.getElementById(id);
   assert.match($('eval-identity').textContent,new RegExp(ROLE_LABELS[role]));
   assert.equal($('admin-budget').hidden,!permissions.includes('audit:read'));
   assert.equal($('budget-suspend').hidden,!permissions.includes('ai:suspend'));
   assert.equal($('eval-account-tools').textContent.includes('Generate synthetic handover'),permissions.includes('review:prepare'));
   for(const value of ['Applicant','Executive','Technology']){$('eval-perspective').value=value;$('eval-perspective').dispatchEvent(new dom.window.Event('change'));assert.equal($('budget-suspend').hidden,!permissions.includes('ai:suspend'));}
   assert.equal(requests.filter(x=>x==='/api/admin').length,permissions.includes('audit:read')?1:0);
  }finally{dom.window.close();}
 }}finally{for(const [k,d]of originals){if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];}}
});
