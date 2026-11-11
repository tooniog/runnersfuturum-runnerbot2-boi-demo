# BOI evaluator test identities — release 2026-11-11.2

Four distinct named test identities use unique access codes, stored server-side only as salted scrypt hashes. No credentials are in Git, public assets or this report. Named sessions bind the username, role and credential state in signed Secure/HttpOnly/SameSite=Strict cookies for two hours. Removing, disabling, rotating or changing a role invalidates that identity’s sessions on deployments using the updated registry. Vercel environment changes require a new deployment; retire older deployment access when revoking credentials.

| Identity | Role | Synthetic evaluation/chat | Reviewer handover API | Control/audit read API | Suspend paid AI |
|---|---|---|---|---|---|
| administrator | RUNNERS_ADMIN | Yes | Yes | Yes | Yes |
| boi-reviewer | BOI_REVIEWER | Yes | Yes | No | No |
| it-auditor | IT_AUDITOR | Yes | No | Yes | No |
| observer | EVALUATOR_OBSERVER | Yes | No | No | No |

Applicant, Executive and Technology are presentation modes. They confer no permissions. All authenticated roles can use synthetic calculators, reference chat and local transcript export. These are not production BOI accounts or lending roles. No role grants real records, submission, external messages, budget increases or automatic resumption.

Endpoints: GET /api/auth reports identity and permissions; POST /api/auth signs in with username/password and ignores client role claims. GET /api/admin requires audit:read. POST /api/admin requires ai:suspend, same-origin validation and action=suspend. POST /api/review requires review:prepare, same-origin validation and a strict synthetic numeric schema. It generates a transient handover, stores no applicant record and sends no case. Other unsupported actions are rejected.

Named sign-in failures share generic responses and the existing durable IP throttle. Existing access-code-only administrator and observer logins remain compatible; BOI_ALLOW_LEGACY_ACCESS=false disables both legacy login and legacy sessions after deployment. No prior credentials were changed. Logout clears the browser cookie; a copied bearer token remains valid until expiry or credential revocation. Central per-session logout revocation is not introduced in this scoped change.

Validation: 72 automated tests pass, including nine identity/API tests and a four-role UI matrix. Checks cover wrong username/password pairs, forged role claims, protected APIs before side effects, rejected cross-origin mutations, unsafe payloads, expired/altered sessions, credential-state revocation, forbidden actions, presentation switching and synthetic handover arithmetic. Provider calls are mocked or avoided; no paid calls needed for this change. Admin suspension is exercised only in an isolated database fixture, never against the production ledger.

The attached 2026-11-11.1 retest reports 33 PASS, 3 FAIL, 6 BLOCKED and 6 NOT TESTED. This account change addresses its access-test prerequisites; it does not close unrelated over-escalation, fractional percentage or transcript-provenance findings, nor claim full acceptance.

Deploy target: existing runnersfuturum-runnerbot2-boi-demo project. Previous production rollback: dpl_6LJEHTzhx58wrNHpPWeogUJi96cX. Preserve the cumulative budget and historical ledger on any rollback.
