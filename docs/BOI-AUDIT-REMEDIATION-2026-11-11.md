# BOI audit remediation — 11 November 2026

Source: uploaded Runnerbot2_Acceptance_Audit_2026-11-10.1.zip. Independent matrix: 104 criteria, 61 PASS, 11 FAILED, 22 BLOCKED, 10 NOT TESTED. 36 preserved screenshots; earlier live notes are reconstructed, not verbatim traces. This report does not convert blocked independent criteria to passes.

| Finding | Change | Verification / remaining gate |
|---|---|---|
| D01 | Bare amount requests trigger targeted business, location, purpose and evidence questions | Deterministic route regression; fresh browser capture pending |
| D02 | Safe BDSP/password education explains routes and credential safety; actual disclosures and mixed prohibited requests remain refused | Route regressions for safe and unsafe prompts |
| D03 | RAPID uncertainty retains cooperative/location context and lists evidence for official review | Escalation and injection regression; fresh live capture pending |
| D04 | Language selector explicitly states its partial coverage | Disclosure only: complete localisation and native financial-language validation remain OPEN |
| D05 | Monetary inputs and computed totals outside supported ranges are rejected; consistency differences rounded to kobo | Exact unsafe-integer reproduction rejected; ordinary arithmetic regressions retained |
| D06 | Model instructed to use plain text; heading and bold markers normalised without HTML rendering | Provider-output regression; fresh live screenshot pending |
| D07 | RAPID, GLOW, youth, security and eligibility stages specify distinct evidence and reviewer outputs | All specialised workflow actions validated; walkthrough regressions retained |

62 automated checks pass. A pre-existing flaky tampering test was corrected: it sometimes replaced a signature character with itself. Signature verification behaviour was not changed.

Live responses now return evaluationRequestId and providerResponseId when supplied by the provider. The server logs those IDs, model and token counts only after successful settlement. It logs no prompts or answers. Cache repeats retain the original request ID and must not be counted as new inference.

Read-only production ledger check on 11 November: authorised cap $0.70, normal stop $0.67, conservative debits $0.024384, reservations $0, no halt, 29 settled requests, last reconciliation 10 November 19:21:27 UTC. Remaining safe allowance at that check: $0.645616. This is conservative application accounting, not an OpenAI invoice; refresh before more paid testing. No paid calls were made for this remediation.

Re-test gate: confirm release 2026-11-11.1 and exact deployment commit; recapture AI-B/D/G/M and verify a new English response, follow-up and local-language response against request IDs and ledger deltas. The original audit's admin/API, 390px, accessibility, failure-fixture and end-to-end journey criteria remain independently unverified until their evidence is collected. No new external administrator or Vercel team permissions were granted.

Recommendation remains CONDITIONAL for supervised synthetic review; no complete institutional acceptance or real-applicant use is claimed. The previous production rollback target is dpl_662MaPuzWn5w8YRvAtDRwVGfqDAQ; preserve the global ledger on rollback.
