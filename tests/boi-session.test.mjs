import test from "node:test";
import assert from "node:assert/strict";
import {SESSION_MAX_SECONDS,constantTimePasswordMatch,makeSession,verifySession,cookieValue,allowedOrigin,setSessionCookie} from "../lib/boi-session.mjs";
const secret="a".repeat(48);
test("evaluator sessions are signed, scoped, and time-limited",()=>{
 const now=1730000000000;
 const token=makeSession("EVALUATOR_OBSERVER",secret,now);
 const verified=verifySession(token,secret,now+1000);
 assert.equal(verified.role,"EVALUATOR_OBSERVER");
 assert.equal(verified.exp,Math.floor(now/1000)+SESSION_MAX_SECONDS);
 assert.match(verified.sid,/^[0-9a-f-]{36}$/);
 assert.notEqual(makeSession("EVALUATOR_OBSERVER",secret,now),token);
 assert.equal(verifySession(token,"b".repeat(48),now+1000),null);
 assert.equal(verifySession(token,secret,now+(SESSION_MAX_SECONDS+1)*1000),null);
 assert.equal(verifySession(token+"tamper",secret,now),null);
 assert.equal(verifySession(token.replace(/.$/,"0"),secret,now),null);
});
test("reject forged privilege and malformed session tokens",()=>{
 const token=makeSession("EVALUATOR_OBSERVER",secret);
 assert.throws(()=>makeSession("BOI_REVIEWER",secret));
 assert.equal(verifySession(token+".extra",secret),null);
 assert.equal(verifySession("invalid",secret),null);
 assert.equal(verifySession(token,undefined),null);
});
test("password comparison is exact and not lower-cased",()=>{
 const prior=process.env.BOI_COOKIE_SECRET;
 process.env.BOI_COOKIE_SECRET=secret;
 try{
  assert.equal(constantTimePasswordMatch("OnlyMyPrivateTest","OnlyMyPrivateTest"),true);
  assert.equal(constantTimePasswordMatch("onlymyprivatetest","OnlyMyPrivateTest"),false);
  assert.equal(constantTimePasswordMatch("x",""),false);
  assert.equal(constantTimePasswordMatch("x".repeat(129),"x".repeat(129)),false);
 }finally{if(prior===undefined)delete process.env.BOI_COOKIE_SECRET; else process.env.BOI_COOKIE_SECRET=prior;}
});
test("cookie parser extracts only the namespaced session",()=>{
 const req={headers:{cookie:"other=abc; __Host-boi_eval=signed.token; irrelevant=xyz"}};
 assert.equal(cookieValue(req),"signed.token");
 assert.equal(cookieValue({headers:{}}),"");
});
test("session cookie is secure and HTTP-only",()=>{
 const response={setHeader(k,v){this[k]=v}};
 setSessionCookie(response,"signed.token",120);
 assert.match(response["Set-Cookie"],/HttpOnly/);
 assert.match(response["Set-Cookie"],/SameSite=Strict/);
 assert.match(response["Set-Cookie"],/Secure/);
 assert.match(response["Set-Cookie"],/Max-Age=120/);
});
test("POST origin enforcement rejects cross-site and absent origin",()=>{
 const base={headers:{host:"boi.example.com",origin:"https://boi.example.com"}};
 assert.equal(allowedOrigin(base),true);
 assert.equal(allowedOrigin({headers:{host:"boi.example.com",origin:"https://attacker.example.com"}}),false);
 assert.equal(allowedOrigin({headers:{host:"boi.example.com"}}),false);
 assert.equal(allowedOrigin({headers:{host:"boi.example.com",origin:"http://boi.example.com"}}),false);
});
