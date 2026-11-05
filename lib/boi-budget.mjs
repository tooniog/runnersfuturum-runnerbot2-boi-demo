import {neon} from "@neondatabase/serverless";
import {randomUUID} from "node:crypto";
export const HARD_CEILING_MICRO_USD=100000;
export const NORMAL_STOP_MICRO_USD=80000;
const MODEL="gpt-6-luna";
export function modelConfig() {
  const name=process.env.BOI_AI_MODEL || MODEL;
  if (name !== MODEL) throw new Error("MODEL_PRICING_REVALIDATION_REQUIRED");
  return name;
}
export function dollarsMicro(value) { return value/1000000; }
export function reserveEstimate({prompt, outputTokens=320}) {
  if (typeof prompt!=="string" || outputTokens > 320 || outputTokens < 1) throw new Error("INVALID_AI_REQUEST");
  const bytes=Buffer.byteLength(prompt,"utf8");
  if(bytes > 26000) throw new Error("AI_CONTEXT_TOO_LARGE");
  // Conservative only for gpt-6-luna; model/price change requires fresh approval.
  // Input upper bound: UTF-8 bytes plus protocol overhead; reasoning effort set to none.
  const upperInputTokens=bytes+1024;
  // $0.10/M input; $0.50/M output; 5x safety multiplier.
  const maxMicroUSD=Math.ceil(5*((upperInputTokens*0.1)+(outputTokens*0.5)));
  return Math.max(maxMicroUSD,1);
}
export function conservativeCharge(usage) {
  if(!usage || !Number.isSafeInteger(usage.input_tokens) ||
     !Number.isSafeInteger(usage.output_tokens) ||
     usage.input_tokens<0 || usage.output_tokens<0) throw new Error("USAGE_UNRECONCILED");
  return Math.ceil(5*(usage.input_tokens*0.1+usage.output_tokens*0.5));
}
function sql() {
  if(!process.env.DATABASE_URL) throw new Error("BOI_DATABASE_NOT_CONFIGURED");
  return neon(process.env.DATABASE_URL);
}
export async function budgetAvailable() {
  const rows=await sql()`SELECT ceiling_micro_usd,stop_micro_usd,spent_micro_usd,reserved_micro_usd FROM boi_ai_ledger WHERE id=1`;
  const b=rows[0];
  if(!b || b.ceiling_micro_usd!==HARD_CEILING_MICRO_USD || b.stop_micro_usd!==NORMAL_STOP_MICRO_USD)
    throw new Error("BOI_BUDGET_CONTROL_UNAVAILABLE");
  return b.spent_micro_usd+b.reserved_micro_usd < b.stop_micro_usd;
}
export async function reserveBudget(amount) {
  if(!Number.isSafeInteger(amount) || amount<1 || amount>NORMAL_STOP_MICRO_USD) throw new Error("BOI_BUDGET_INVALID");
  const id=randomUUID();
  await sql()`SELECT boi_reserve(${id}::uuid,${amount}::integer)`;
  return {id,amount};
}
export async function settleBudget(id,charge) {
  if(!Number.isSafeInteger(charge)||charge<0) throw new Error("BOI_CHARGE_INVALID");
  await sql()`SELECT boi_settle(${id}::uuid,${charge}::integer)`;
}
