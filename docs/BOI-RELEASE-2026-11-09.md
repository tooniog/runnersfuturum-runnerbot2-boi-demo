# BOI evaluator — release 2026-11-09.1

Private synthetic evaluation. No case submitted, no BOI integration or endorsement.

## Baseline and decisions

The existing production baseline is commit `7ab2abfb3fa0085f5ec0e2ec1246689f2702226a`, deployment `dpl_7x71Dw3g76xP8LuZpdeYbyVUjLwx`. The production source was `boi-live-evaluator-20261104`; `main` is an older baseline. This upgrade preserves the signed evaluator gate, live multi-turn chat, local transcript export, official-source inventory, preparation checklist, consistency checks, branding, icons and institutional proposal.

The supplied evaluation exports demonstrated useful preparation and conditional arithmetic: ₦12m less a committed ₦3m leaves ₦9m, versus a ₦10m draft. Earlier output was truncated and listed irrelevant sources. The answer allowance is now reserved before inference, incomplete output is explicit, and only cited retrieved sources appear. Prior transcripts are evidence of those runs, not a claim that every new build passed live evaluation.

## Implemented

- Fifteen explicitly synthetic scenarios with three workflow states, autoplay, pause/restart/navigation, changing preparation completeness and deterministic forecast calculations.
- Editable cash flow, equipment funding and amortisation sensitivities; five executive value channels and timing/fee illustrations. No measured-impact claims.
- Service/version/model/source inventory, authority boundaries, integration proposal and rollback information. Administrative budget and durable audit views require the server-validated administrator role.
- Aggregate $0.30 authorisation, $0.27 normal stop and $0.03 protective reserve. Atomic database reservations preserve prior spending. Unknown charges retain reservations and suspend paid calls; no automatic retries or budget increases.
- Session-isolated exact-response cache, bounded context, deterministic refusal/escalation rules, output source checks and sensitive-history refusal.
- English, Plain English, Pidgin, Yoruba, Hausa and Igbo controls and scenario summaries. Detailed reference, financial and administrative text still uses English in places. These translations are not professionally validated; complete localisation remains a limitation.

## Verification before staging

58 automated checks passed, including multi-turn export, deterministic arithmetic, permissions, injection/sensitive data, source filtering, cache isolation and expiry, provider failures, missing usage, settlement errors and zero-call reservation rejection. Provider-path tests use mocks and spend nothing.

The isolated Neon test branch `br-sparkling-term-zao0lrxa` accepted eight of twelve concurrent $0.03 reservations and rejected four. Exposure remained $0.247288, below $0.27; rejection persisted a halt. Production spending was not reset and was $0.011352 before release verification.

Browser checks used an explicitly synthetic local fixture with paid inference disabled. Desktop layout and a 390px iframe were inspected; its 375px content viewport had 375px scroll width. Forecast progression changed units from 100 to 70 and third-month closing cash to ₦680,000. Yoruba controls changed immediately. Local screenshots are in `docs/screenshots`; they are not evidence of production authentication or live inference.

## Founder evaluation guide

1. Sign in at the existing evaluator. Start with **Watch the workflows**, run autoplay, then choose **Working capital / sensitivity** and advance the workflow steps.
2. Open **Prepare a case**. Change preparation categories and compare same-period sales. The score measures self-reported completeness only.
3. In the financial lab, set equipment to ₦12m, committed contribution to ₦3m, draft request to ₦10m and other costs to zero. Expect a ₦9m gap and ₦1m difference; clarify the contribution and other costs.
4. Review executive value assumptions. Change them and inspect the arithmetic; no result is a BOI forecast or bank profit claim.
5. Inspect technology controls, knowledge dates and implemented/proposed distinctions. An observer must not see administrator budget data or suspend inference.
6. In live mode use fictional facts only. Ask about an Ogun cassava processor, then follow up with the funding figures. Check complete sentences, contextual memory, relevant sources and no eligibility decision. Every new live request uses the shared budget; avoid unnecessary repetitions.
7. Try a prohibited approval, credentials or internal-record request. Expect a refusal or human-review boundary and no external action. Switch language for the next response; past answers retain their original language.
8. Export the conversation and review it locally. An export is not a BOI application or notification.

## Staging, deployment and rollback

Build with `npm run check && node scripts/build.mjs`. Preview branch inference is explicitly disabled. Test preview before applying `db/20261109-budget.sql` to production; the migration preserves prior debits and reservations. Production verification results and deployment IDs are recorded in release evidence after deployment.

For emergency continuity, an administrator can suspend inference immediately. Restore verified deployment `dpl_7x71Dw3g76xP8LuZpdeYbyVUjLwx` for UI rollback. Keep the global ledger: the retired old reservation function fails closed, so rollback does not reopen paid inference or reset spend. No automatic unsuspend operation exists.

## Limitations and recommendation

Founder notification pending — manual action required. No notification destination is configured or tested. Thresholds are durable database events, not delivered messages.

No BOI access, lending decision, real application processing, officer notification, Microsoft 365 connection or measured institutional impact exists. Source review is dated, not continuous monitoring. Exact cache is per warm function instance, so a cold instance may make a newly reserved paid request. Deterministic safeguards reduce risk but are not a proof against all prompt attacks. English remains the reference; native-language financial review, retention/residency decisions, privacy/security review, content ownership and named human escalation contacts are pilot prerequisites.

Recommendation: suitable for a private synthetic technical evaluation once staging and production verification pass; not ready for real applicant data or an operational BOI pilot.
