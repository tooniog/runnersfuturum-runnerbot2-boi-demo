# BOI evaluator release candidate — 5 November 2026

Status: NOT SIGNED OFF FOR EXTERNAL SHARING. Production is not updated.

## Implemented in this candidate
- Server-rendered access gate: private evaluator HTML is returned only with a valid signed session. Static output contains selected client assets only.
- Free-form chat interface connected to the existing server endpoint, with context, perspective and experimental language selection, safe Markdown rendering, source links, clear errors, conversation clearing/export and sign-out.
- Self-reported preparation checklist retained; synthetic consistency review, returned-document guidance, editable lending/time-release illustrations and automatic six-step walkthrough added.
- Proposed pilot controls are distinguished from working evaluator functions. MyBOI/iProgrammes remain official application channels.
- Dedicated key and database configured locally. No secrets are committed.

## Executed evidence
- 27 automated unit/route checks passed, including session tampering, origin restrictions, private HTML gating, policy refusals, disabled-AI fallback and financial calculations.
- Real Neon concurrency test: 12 simultaneous reservations of $0.01; 8 accepted and 4 rejected at the $0.08 normal stop. All test reservations reconciled to zero without model requests.
- Two actual GPT-6 Luna responses completed through the server handler. The second retained the fictional cassava-processing context. Answers distinguished official channels, BDSP preparation and retained BOI lending authority.
- Conservative ledger debit after those two responses: $0.002205; outstanding reservations $0; normal-stop headroom $0.077795. This is a five-times conservative usage debit, not an exact provider invoice.
- JavaScript syntax and static asset build passed.

## Outstanding release gates
- Automatic approval review blocked uploading credentials to Vercel preview/production. Explicit founder approval of destination and scope is needed. No credential upload succeeded.
- Browser regression script is prepared but NOT EXECUTED: the local Chromium download returned an invalid archive. Test the deployment in the supported cloud browser after configuration.
- Review mobile layout, protected sign-in/logout, conversation rendering, copy/export and all navigation on the deployed candidate.
- A real iPhone Safari bookmark-icon test remains unverified. Existing approved Runners raster is supplied through conventional icon paths; do not claim a device test.
- Deployed authentication, database and AI responses must be verified before production promotion.
- Model output remains probabilistic. A real BOI pilot additionally requires content approval, security review, DPA/residency, language review, named escalation contacts and measurement baseline.

## Build and rollback
`node scripts/build.mjs` emits only allowlisted public assets. `api/page.js` serves `private/evaluator.html` after session verification. Keep existing production deployment as rollback until candidate verification passes.

Do not contact BOI, share credentials externally, claim partnership, connect BOI systems or raise the $0.10 aggregate ceiling.
