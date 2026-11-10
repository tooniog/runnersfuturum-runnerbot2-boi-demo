import {neon} from "@neondatabase/serverless";
import {randomUUID} from "node:crypto";
export const HARD_CEILING_MICRO_USD=300000;
export const NORMAL_STOP_MICRO_USD=270000;
const MODEL="gpt-6-luna";
export function modelConfig() {
  const name=process.env.BOI_AI_MODEL || MODEL;
  if (name !== MODEL) throw new Error("MODEL_PRICING_REVALIDATION_REQUIRED");
  return name;
}
export function dollarsMicro(value) { return value/1000000; }
export function reserveEstimate({prompt, outputTokens=320}) {
  if (typeof prompt!=="string" || !Number.isSafeInteger(outputTokens) || outputTokens > 1024 || outputTokens < 1) throw new Error("INVALID_AI_REQUEST");
  const bytes=Buffer.byteLength(prompt,"utf8");
  if(bytes > 26000) throw new Error("AI_CONTEXT_TOO_LARGE");
  // Conservative only for gpt-6-luna; model/price change requires fresh approval.
  // Input upper bound: UTF-8 bytes plus protocol overhead; reasoning effort set to none.
  const upperInputTokens=bytes+2048;
  // Verified 2026-11-09: $0.10/M input, $0.50/M output.
  // Bound input at $0.14/M (cache writes + regional premium), output $0.55/M; 5x reserve.
  // Standard tier, no tools, no automatic retries or long-context pricing.
  const maxMicroUSD=Math.ceil(5*((upperInputTokens*0.14)+(outputTokens*0.55)));
  return Math.max(maxMicroUSD,1);
}
export function conservativeCharge(usage) {
  if(!usage || !Number.isSafeInteger(usage.input_tokens) ||
     !Number.isSafeInteger(usage.output_tokens) ||
     usage.input_tokens<0 || usage.output_tokens<0) throw new Error("USAGE_UNRECONCILED");
  return Math.ceil(5*(usage.input_tokens*0.14+usage.output_tokens*0.55));
}
function sql() {
  if(!process.env.DATABASE_URL) throw new Error("BOI_DATABASE_NOT_CONFIGURED");
  return neon(process.env.DATABASE_URL);
}
export async function budgetAvailable() {
  const rows=await sql()`SELECT ceiling_micro_usd,stop_micro_usd,spent_micro_usd,reserved_micro_usd,halt_reason FROM boi_ai_ledger WHERE id=1`;
  const b=rows[0];
  if(!b || b.ceiling_micro_usd!==HARD_CEILING_MICRO_USD || b.stop_micro_usd!==NORMAL_STOP_MICRO_USD)
    throw new Error("BOI_BUDGET_CONTROL_UNAVAILABLE");
  return !b.halt_reason && b.spent_micro_usd+b.reserved_micro_usd < b.stop_micro_usd;
}
export async function reserveBudget(amount) {
  if(!Number.isSafeInteger(amount) || amount<1 || amount>NORMAL_STOP_MICRO_USD) throw new Error("BOI_BUDGET_INVALID");
  const id=randomUUID();
  const rows=await sql()`SELECT boi_reserve_v2(${id}::uuid,${amount}::integer) AS accepted`;
  if(rows[0]?.accepted!==true)throw new Error("BOI_BUDGET_STOP");
  return {id,amount};
}
export async function settleBudget(id,charge,usage) {
  if(!Number.isSafeInteger(charge)||charge<0) throw new Error("BOI_CHARGE_INVALID");
  conservativeCharge(usage);
  await sql()`SELECT boi_settle_v2(${id}::uuid,${charge}::integer,${usage.input_tokens}::integer,${usage.output_tokens}::integer)`;
}

export async function haltBudget(id,code) {
  await sql()`SELECT boi_halt(${id||null}::uuid,${code})`;
}
export async function budgetMonitor() {
  const rows=await sql()`SELECT l.*,
    (SELECT count(*)::integer FROM boi_ai_reservations WHERE status='SETTLED') AS requests_completed,
    (SELECT count(*)::integer FROM boi_ai_reservations WHERE status='RESERVED') AS outstanding_requests,
    (SELECT max(reconciled_at) FROM boi_ai_reservations) AS last_reconciled_at,
    (SELECT COALESCE(sum(reserved_micro_usd),0)::integer FROM boi_ai_reservations WHERE status='RESERVED' AND (failure_code IS NOT NULL OR created_at<now()-interval '2 minutes')) AS unreconciled_micro_usd,
    (SELECT COALESCE(json_agg(e),'[]') FROM (SELECT code,created_at,exposure_micro_usd,notification_status FROM boi_audit_events ORDER BY id DESC LIMIT 30) e) AS events
    FROM boi_ai_ledger l WHERE id=1`;
  const b=rows[0];
  if(!b||b.ceiling_micro_usd!==HARD_CEILING_MICRO_USD||b.stop_micro_usd!==NORMAL_STOP_MICRO_USD)throw Error('BOI_BUDGET_CONTROL_UNAVAILABLE');
  return {...b,remaining_safe_micro_usd:Math.max(0,b.stop_micro_usd-b.spent_micro_usd-b.reserved_micro_usd),
    accounting:'Conservative ledger debit; usage reconciled at 5× bounded rates. Not a provider invoice. Unreconciled costs are a subset of outstanding reservations.',
    notice:b.halt_reason==='BUDGET_EXHAUSTED'?'AI budget limit reached — founder approval required to resume paid inference.':b.halt_reason?'Paid inference suspended — billing or administrator review required.':null,
    founderNotification:'Founder notification pending — manual action required.'};
}
