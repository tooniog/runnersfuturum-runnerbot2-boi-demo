-- Founder mandate 2026-11-10: $0.70 aggregate, $0.67 stop. Preserve all prior debits.
-- Apply after db/boi-evaluator.sql, first on an isolated branch. No reset/refund.
BEGIN;
ALTER TABLE boi_ai_ledger DROP CONSTRAINT IF EXISTS boi_ai_ledger_ceiling_micro_usd_check;
ALTER TABLE boi_ai_ledger DROP CONSTRAINT IF EXISTS boi_ai_ledger_stop_micro_usd_check;
UPDATE boi_ai_ledger SET ceiling_micro_usd=700000,stop_micro_usd=670000 WHERE id=1;
ALTER TABLE boi_ai_ledger ADD CONSTRAINT boi_ai_ledger_ceiling_micro_usd_check CHECK(ceiling_micro_usd=700000);
ALTER TABLE boi_ai_ledger ADD CONSTRAINT boi_ai_ledger_stop_micro_usd_check CHECK(stop_micro_usd=670000);
ALTER TABLE boi_ai_ledger ADD COLUMN IF NOT EXISTS halt_reason text;
-- Explicitly authorised increase may clear only an old exhaustion halt, never an unresolved provider charge.
UPDATE boi_ai_ledger SET halt_reason=NULL WHERE id=1 AND halt_reason='BUDGET_EXHAUSTED' AND spent_micro_usd+reserved_micro_usd<670000;
ALTER TABLE boi_ai_ledger ADD COLUMN IF NOT EXISTS rejected_requests integer NOT NULL DEFAULT 0;
ALTER TABLE boi_ai_reservations ADD COLUMN IF NOT EXISTS input_tokens integer;
ALTER TABLE boi_ai_reservations ADD COLUMN IF NOT EXISTS output_tokens integer;
ALTER TABLE boi_ai_reservations ADD COLUMN IF NOT EXISTS failure_code text;
CREATE TABLE IF NOT EXISTS boi_audit_events(
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 code text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 exposure_micro_usd integer, reservation_id uuid,
 notification_status text NOT NULL DEFAULT 'NOT_CONFIGURED_MANUAL_ACTION_REQUIRED'
);
CREATE UNIQUE INDEX IF NOT EXISTS boi_budget_threshold_070_once ON boi_audit_events(code)
 WHERE code IN ('BUDGET_80_PERCENT_070','BUDGET_90_PERCENT_070','BUDGET_EXHAUSTED','BUDGET_AUTHORISED_20261110');
INSERT INTO boi_audit_events(code,exposure_micro_usd)
 SELECT 'BUDGET_AUTHORISED_20261110',spent_micro_usd+reserved_micro_usd FROM boi_ai_ledger WHERE id=1
 ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION boi_budget_events(p_exposure integer) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 IF p_exposure >= 560000 THEN
  INSERT INTO boi_audit_events(code,exposure_micro_usd) VALUES('BUDGET_80_PERCENT_070',p_exposure) ON CONFLICT DO NOTHING;
 END IF;
 IF p_exposure >= 630000 THEN
  INSERT INTO boi_audit_events(code,exposure_micro_usd) VALUES('BUDGET_90_PERCENT_070',p_exposure) ON CONFLICT DO NOTHING;
 END IF;
 IF p_exposure >= 670000 THEN
  INSERT INTO boi_audit_events(code,exposure_micro_usd) VALUES('BUDGET_EXHAUSTED',p_exposure) ON CONFLICT DO NOTHING;
  UPDATE boi_ai_ledger SET halt_reason=COALESCE(halt_reason,'BUDGET_EXHAUSTED') WHERE id=1;
 END IF;
END $$;

-- Return false (not an exception) on budget rejection so the event/counter commit.
CREATE OR REPLACE FUNCTION boi_reserve_v2(p_id uuid,p_amount integer) RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE b boi_ai_ledger%ROWTYPE; exposure integer;
BEGIN
 IF p_amount IS NULL OR p_amount<1 OR p_amount>670000 THEN RAISE EXCEPTION 'BOI_BUDGET_INVALID'; END IF;
 SELECT * INTO b FROM boi_ai_ledger WHERE id=1 FOR UPDATE;
 IF NOT FOUND OR b.ceiling_micro_usd<>700000 OR b.stop_micro_usd<>670000 THEN RAISE EXCEPTION 'BOI_BUDGET_CONTROL_UNAVAILABLE'; END IF;
 exposure:=b.spent_micro_usd+b.reserved_micro_usd;
 IF b.halt_reason IS NOT NULL OR exposure+p_amount>b.stop_micro_usd THEN
  UPDATE boi_ai_ledger SET rejected_requests=rejected_requests+1,
   halt_reason=COALESCE(halt_reason,'BUDGET_EXHAUSTED') WHERE id=1;
  INSERT INTO boi_audit_events(code,exposure_micro_usd) VALUES('REQUEST_REJECTED',exposure);
  IF b.halt_reason IS NULL OR b.halt_reason='BUDGET_EXHAUSTED' THEN
   INSERT INTO boi_audit_events(code,exposure_micro_usd) VALUES('BUDGET_EXHAUSTED',exposure) ON CONFLICT DO NOTHING;
  END IF;
  RETURN false;
 END IF;
 UPDATE boi_ai_ledger SET reserved_micro_usd=reserved_micro_usd+p_amount WHERE id=1;
 INSERT INTO boi_ai_reservations(id,reserved_micro_usd) VALUES(p_id,p_amount);
 PERFORM boi_budget_events(exposure+p_amount);
 RETURN true;
END $$;

CREATE OR REPLACE FUNCTION boi_settle_v2(p_id uuid,p_spent integer,p_input integer,p_output integer) RETURNS void LANGUAGE plpgsql AS $$
DECLARE old_row boi_ai_reservations%ROWTYPE; b boi_ai_ledger%ROWTYPE;
BEGIN
 -- All budget functions lock the ledger first: consistent order avoids deadlocks.
 SELECT * INTO b FROM boi_ai_ledger WHERE id=1 FOR UPDATE;
 SELECT * INTO old_row FROM boi_ai_reservations WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'BOI_RECONCILIATION_ERROR'; END IF;
 IF old_row.status='SETTLED' THEN
  IF old_row.spent_micro_usd=p_spent THEN RETURN; ELSE RAISE EXCEPTION 'BOI_RECONCILIATION_ERROR'; END IF;
 END IF;
 IF p_spent IS NULL OR p_spent<0 OR p_spent>old_row.reserved_micro_usd OR p_input IS NULL OR p_input<0 OR p_output IS NULL OR p_output<0 THEN
  RAISE EXCEPTION 'BOI_CHARGE_ABOVE_RESERVATION';
 END IF;
 UPDATE boi_ai_ledger SET reserved_micro_usd=reserved_micro_usd-old_row.reserved_micro_usd,
  spent_micro_usd=spent_micro_usd+p_spent WHERE id=1 AND reserved_micro_usd>=old_row.reserved_micro_usd;
 IF NOT FOUND THEN RAISE EXCEPTION 'BOI_RECONCILIATION_ERROR'; END IF;
 UPDATE boi_ai_reservations SET status='SETTLED',spent_micro_usd=p_spent,input_tokens=p_input,output_tokens=p_output,reconciled_at=now() WHERE id=p_id;
 INSERT INTO boi_audit_events(code,reservation_id) VALUES('USAGE_RECONCILED',p_id);
 PERFORM boi_budget_events(b.spent_micro_usd+p_spent+b.reserved_micro_usd-old_row.reserved_micro_usd);
END $$;

CREATE OR REPLACE FUNCTION boi_halt(p_id uuid,p_code text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 IF p_code NOT IN ('PROVIDER_UNAVAILABLE','USAGE_RECONCILIATION_REQUIRED','ADMIN_SUSPENDED') THEN RAISE EXCEPTION 'INVALID_HALT'; END IF;
 UPDATE boi_ai_ledger SET halt_reason=COALESCE(halt_reason,p_code) WHERE id=1;
 UPDATE boi_ai_reservations SET failure_code=p_code WHERE id=p_id AND status='RESERVED';
 INSERT INTO boi_audit_events(code,reservation_id) VALUES(p_code,p_id);
END $$;
-- Disallow the pre-upgrade reserve function, including calls from rollback builds.
CREATE OR REPLACE FUNCTION boi_reserve(p_id uuid,p_micro_usd integer) RETURNS void LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'BOI_BUDGET_VERSION_RETIRED'; END $$;
COMMIT;
