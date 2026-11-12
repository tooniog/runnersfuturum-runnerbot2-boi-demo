# Acceptance remediation — 12 November 2026

Release: 2026-11-12.1. This is not a full evaluator pass.

## Changes
- Negated eligibility instructions and a request to prepare a human-reviewer summary no longer trigger decision escalation. Actual decision/approval requests remain blocked.
- Decimal consistency percentages use the larger reported amount after rounding to kobo; zero/zero is handled explicitly.
- Transcript format v3 records inference request ID, provider response ID, release, classification and response mode. Cached output preserves original inference IDs. Filtered paid outputs and empty paid responses retain provenance and settlement logging.
- Removed stale release evidence referring to the old $0.10 ceiling and unrelated staging commit.

## Verified
- `npm run check`: 79 tests passed, zero failures. Includes server role boundaries, session expiry, sensitive-data refusal, export handlers, calculator arithmetic, all 15 showcase scenarios through all three ordered states, language controls, provider failure/timeout/malformed JSON, settlement failures, incomplete output and cache provenance.
- `node scripts/build.mjs`: passed. These UI checks use DOM fixtures, not screenshots or a real mobile browser.
- Earlier direct production checks in this continuation accepted the legacy observer code and all four named identity/code pairs on release 2026-11-11.2. Earlier role verification recorded 53 production assertions.
- Real database functions tested on isolated branch `br-rough-union-zayt6t17`, copied from production. Starting debit 660000 micro-USD; two concurrent reservations of 10000 each: one accepted, one rejected. Exposure never exceeded 670000. Settlement at 1000 reduced final debit to 661000 and reservation to zero. Repeating same settlement changed nothing. Different settlement amount raised BOI_RECONCILIATION_ERROR. Subsequent reservation remained blocked by sticky BUDGET_EXHAUSTED.
- Production ledger re-read unchanged at 36489 micro-USD ($0.036489), zero reservations, no halt; ceiling $0.70, normal stop $0.67. No paid model calls in this continuation. Protective $0.03 reserve remains intact.

## Outstanding
- Secure browser sign-in was declined. Authenticated browser journeys, keyboard checks, true 390px rendering and current-release live AI conversations have not been verified in this continuation.
- Native-speaker financial terminology validation remains outstanding.
- New provider-response IDs are available for the next live run; provider-log correlation must be completed for those actual calls.
- Isolated database branch is retained for review; it is not connected to production.

Full acceptance requires resolving those outstanding checks against the deployed commit. Passing deterministic fixtures does not establish live-model quality or BOI endorsement.
