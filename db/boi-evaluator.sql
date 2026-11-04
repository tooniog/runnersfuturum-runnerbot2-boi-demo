-- BOI evaluator private budget/auth schema. Apply to a dedicated BOI database only.
-- No institution data, real applicant data, or credit records.
CREATE TABLE IF NOT EXISTS boi_ai_ledger (
  id smallint PRIMARY KEY CHECK (id=1),
  ceiling_micro_usd integer NOT NULL CHECK (ceiling_micro_usd=100000),
  stop_micro_usd integer NOT NULL CHECK (stop_micro_usd=80000),
  spent_micro_usd integer NOT NULL DEFAULT 0 CHECK (spent_micro_usd>=0),
  reserved_micro_usd integer NOT NULL DEFAULT 0 CHECK (reserved_micro_usd>=0),
  CHECK (spent_micro_usd+reserved_micro_usd<=ceiling_micro_usd)
);
INSERT INTO boi_ai_ledger(id,ceiling_micro_usd,stop_micro_usd) VALUES (1,100000,80000)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS boi_ai_reservations (
  id uuid PRIMARY KEY,
  reserved_micro_usd integer NOT NULL CHECK (reserved_micro_usd>0),
  status text NOT NULL DEFAULT 'RESERVED' CHECK (status IN ('RESERVED','SETTLED')),
  spent_micro_usd integer NOT NULL DEFAULT 0 CHECK (spent_micro_usd>=0),
  created_at timestamptz NOT NULL DEFAULT now(),
  reconciled_at timestamptz
);

CREATE TABLE IF NOT EXISTS boi_auth_throttle (
  fingerprint text PRIMARY KEY,
  failures integer NOT NULL DEFAULT 0,
  window_started timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz
);

CREATE OR REPLACE FUNCTION boi_reserve(p_id uuid,p_micro_usd integer) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  IF p_micro_usd IS NULL OR p_micro_usd <= 0 OR p_micro_usd > 80000 THEN
    RAISE EXCEPTION 'BOI_BUDGET_INVALID';
  END IF;
  UPDATE boi_ai_ledger
  SET reserved_micro_usd=reserved_micro_usd+p_micro_usd
  WHERE id=1 AND ceiling_micro_usd=100000 AND stop_micro_usd=80000
    AND spent_micro_usd+reserved_micro_usd+p_micro_usd<=stop_micro_usd;
  IF NOT FOUND THEN RAISE EXCEPTION 'BOI_BUDGET_STOP'; END IF;
  INSERT INTO boi_ai_reservations(id,reserved_micro_usd)
  VALUES (p_id,p_micro_usd);
END $$;

CREATE OR REPLACE FUNCTION boi_settle(p_id uuid,p_spent integer) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE old_row boi_ai_reservations%ROWTYPE;
BEGIN
  SELECT * INTO old_row FROM boi_ai_reservations WHERE id=p_id FOR UPDATE;
  IF NOT FOUND OR old_row.status <> 'RESERVED' THEN RAISE EXCEPTION 'BOI_RECONCILIATION_ERROR'; END IF;
  IF p_spent IS NULL OR p_spent < 0 OR p_spent > old_row.reserved_micro_usd THEN
    RAISE EXCEPTION 'BOI_CHARGE_ABOVE_RESERVATION';
  END IF;
  UPDATE boi_ai_ledger
  SET reserved_micro_usd=reserved_micro_usd-old_row.reserved_micro_usd,
      spent_micro_usd=spent_micro_usd+p_spent
  WHERE id=1 AND reserved_micro_usd>=old_row.reserved_micro_usd;
  IF NOT FOUND THEN RAISE EXCEPTION 'BOI_RECONCILIATION_ERROR'; END IF;
  UPDATE boi_ai_reservations
  SET status='SETTLED',spent_micro_usd=p_spent,reconciled_at=now()
  WHERE id=p_id;
END $$;

-- A reserve is intentionally NOT automatically refunded on provider timeout/error:
-- retain unresolved reservations until an administrator confirms billing.
-- Never reset or truncate the ledger to regain budget without founder approval.
