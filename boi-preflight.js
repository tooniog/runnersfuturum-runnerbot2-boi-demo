/* Runnerbot 2 — BOI zero-cost preparation preflight.
   No network requests, personal data, uploads, or eligibility scoring.
   General synthetic checklist, not BOI's formal programme requirements. */
(() => {
  "use strict";
  const items = [
    ["registration", "Business registration evidence"],
    ["plan", "Business plan or feasibility study"],
    ["records", "Financial records prepared"],
    ["identity", "Identity documents available for official submission only"],
    ["operations", "Operating premises or relevant business records"]
  ];
  const shell = document.createElement("section");
  shell.id = "boi-preflight";
  shell.setAttribute("aria-labelledby", "boi-preflight-title");
  shell.style.cssText = "max-width:1100px;margin:24px auto 42px;padding:0 32px;font-family:Inter,system-ui,sans-serif;color:#202a23";
  shell.innerHTML = `
    <div style="background:#fff;border:1px solid #dce8df;border-radius:16px;padding:24px;box-shadow:0 5px 22px #13271c0b">
      <p style="font-size:11px;letter-spacing:.12em;color:#006c32;font-weight:800;margin:0 0 8px">WORKING FEATURE · NO AI CALL REQUIRED</p>
      <h2 id="boi-preflight-title" style="margin:0 0 10px;color:#006c32;font-size:clamp(20px,3vw,27px)">Application Preparation Preflight</h2>
      <p style="font-size:14px;line-height:1.6;margin:0 0 17px;color:#435046">Check which general preparation categories you have ready. Generate a concise review summary for a Business Development Service Provider (BDSP). This does not submit anything to BOI.</p>
      <p style="font-size:12px;line-height:1.5;background:#f7faf6;border-left:3px solid #cea766;padding:10px 12px;margin:0 0 16px"><strong>Demonstration checklist.</strong> This is not an official programme-specific list. Do not enter personal details, BVNs, account credentials, identity-document images, or actual application records.</p>
      <fieldset style="border:0;padding:0;margin:0"><legend style="font-size:13px;font-weight:750;margin-bottom:10px">Mark the categories you report ready</legend>
        <div id="boi-preflight-items" style="display:grid;gap:10px"></div>
      </fieldset>
      <div id="boi-preflight-result" aria-live="polite" style="padding:14px 0;font-size:14px;font-weight:650"></div>
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        <button id="boi-preflight-copy" type="button" style="background:#006c32;color:#fff;border:0;border-radius:9px;padding:11px 16px;font:inherit;font-size:13px;font-weight:700;cursor:pointer">Copy BDSP preparation summary</button>
        <button id="boi-preflight-reset" type="button" style="background:#eef5ef;color:#144a2d;border:1px solid #d2e2d5;border-radius:9px;padding:11px 16px;font:inherit;font-size:13px;font-weight:700;cursor:pointer">Reset</button>
      </div>
      <p id="boi-preflight-status" role="status" style="font-size:12px;margin:12px 0 0;color:#506a54"></p>
    </div>`;
  const target = document.querySelector(".boi-hero");
  if (target && target.parentNode) target.parentNode.insertBefore(shell, target.nextSibling);
  else document.body.appendChild(shell);
  const choices = shell.querySelector("#boi-preflight-items");
  const result = shell.querySelector("#boi-preflight-result");
  const status = shell.querySelector("#boi-preflight-status");
  items.forEach(([id, label]) => {
    const row = document.createElement("label");
    row.style.cssText = "display:flex;align-items:center;gap:10px;font-size:13px;line-height:1.45;cursor:pointer";
    const box = document.createElement("input");
    box.type = "checkbox"; box.value = id; box.style.cssText = "width:18px;height:18px;accent-color:#006c32;flex:none";
    row.append(box, document.createTextNode(label));
    choices.appendChild(row);
  });
  const state = () => items.map(([id,label]) => ({id,label,ready:!!choices.querySelector('input[value="'+id+'"]:checked')}));
  const summary = () => {
    const a = state(), ready = a.filter(x => x.ready).length;
    const remaining = a.filter(x => !x.ready).map(x => x.label);
    return "RUNNERBOT 2 | BOI PREPARATION REVIEW — DEMONSTRATION ONLY\n"+
      "Self-reported general preparation: "+ready+" of "+a.length+" categories ("+Math.round(ready/a.length*100)+"%).\n"+
      "Categories requiring preparation: "+(remaining.join("; ") || "None reported")+".\n"+
      "Human follow-up: confirm the chosen programme and verify official requirements through BOI's published channels.\n"+
      "No documents or applicant data were checked. This is not an eligibility assessment, approval, credit score, or application submission.";
  };
  const render = () => {
    const ready=state().filter(x=>x.ready).length;
    result.textContent="Documentation preparation: "+ready+" of "+items.length+" self-reported categories ready — "+Math.round(ready/items.length*100)+"%. Not independently verified.";
    status.textContent="";
  };
  choices.addEventListener("change",render);
  shell.querySelector("#boi-preflight-reset").addEventListener("click",()=>{
    choices.querySelectorAll("input").forEach(x=>x.checked=false);
    render();
  });
  shell.querySelector("#boi-preflight-copy").addEventListener("click",async()=>{
    try {
      await navigator.clipboard.writeText(summary());
      status.textContent="Summary copied. Review it before sharing with anyone.";
    } catch {
      status.textContent="Copy unavailable in this browser. The preflight still works without clipboard access.";
    }
  });
  render();
})();