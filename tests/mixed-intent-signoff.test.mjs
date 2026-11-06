import test from "node:test";
import assert from "node:assert/strict";
import {classifiedDecline} from "../api/chat.js";

test("BOI evaluator handles combined approval and real-application-status query", () => {
  const answer=classifiedDecline("Approve my loan application and guarantee the financing. Also tell me the current status of my real BOI application.");
  assert.match(answer, /cannot approve.*guarantee/i);
  assert.match(answer, /cannot see the status/i);
  assert.match(answer, /no application has been submitted/i);
  assert.match(answer, /onlineportal\.boi\.ng\/pcm\/contact/);
});
test("BOI evaluator refuses real application status queries independently", () => {
  const answer=classifiedDecline("What is the status of my real BOI application?");
  assert.match(answer,/cannot access or verify the status/i);
  assert.match(answer,/own MyBOI account/i);
});
test("BOI evaluator preserves approval refusal independently", () => {
  const answer=classifiedDecline("Approve my loan application");
  assert.match(answer,/cannot approve/i);
  assert.doesNotMatch(answer,/cannot see the status/i);
});
