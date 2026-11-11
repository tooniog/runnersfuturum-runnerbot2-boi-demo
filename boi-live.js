import {mountLanguages,localeCopy,localScene} from './lib/boi-languages.mjs';
import {mountUpgrade,renderWorkflow} from './lib/boi-upgrade-ui.mjs';
import {exportTranscript} from './lib/boi-response.mjs';
import {showcaseScenes,showcaseOverview} from './lib/boi-showcase.mjs';
import {EVALUATOR_VERSION} from './lib/boi-release.mjs';
import {incrementalInterestScenario,proposedPostPilotFeeScenario,timingInterestScenario} from './lib/boi-evaluator-core.mjs';
import {compareSyntheticRevenue} from './lib/boi-quality.mjs';
const login=document.querySelector('#login');
if(login){login.addEventListener('submit',async e=>{e.preventDefault();const b=login.querySelector('button'),s=document.querySelector('#status');b.disabled=true;s.textContent='Verifying access…';try{const r=await fetch('/api/auth?action=login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:login.password.value})});login.password.value='';if(r.ok)location.reload();else s.textContent=r.status===429?'Please wait before trying again.':r.status===503?'Evaluator access is temporarily unavailable.':'Access code not recognised.';}catch{s.textContent='Connection unavailable. Please try again.';}finally{b.disabled=false;}});}
else mount();
function mount(){
const shell=document.createElement('section');shell.className='eval-workspace';shell.id='live-evaluator';
shell.innerHTML=`<div class="eval-card"><p class="eval-meta">PRIVATE TECHNOLOGY EVALUATOR · SYNTHETIC INPUTS ONLY</p><h2>Stronger preparation. Less avoidable rework.</h2><p>Prepare a clearer application, identify inconsistencies, and give a BDSP a useful starting point. MyBOI and iProgrammes remain the official channels. No applications are submitted here.</p><div class="eval-actions"><a href="#eval-chat">Ask Runnerbot 2 live</a><a href="#boi-preflight">Preparation checklist</a><a href="#eval-review">Consistency review</a><a href="#eval-commercial">Value scenarios</a><button id="eval-logout">Sign out</button></div></div>
<div class="eval-card" id="eval-chat"><h2>Ask Runnerbot 2 live</h2><p class="eval-meta">Real model responses when available; reference guidance stays available without paid AI. Do not enter actual applicant records, BVNs, bank details or credentials.</p><div class="eval-grid"><label>Perspective<select id="eval-perspective"><option>Applicant</option><option>Executive</option><option>Technology</option></select></label><label>Response language<select id="eval-language"><option>English</option><option>Plain English</option><option>Nigerian Pidgin</option><option>Yoruba</option><option>Hausa</option><option>Igbo</option></select></label></div><p class="eval-meta">AI-supported language options. Check financial terminology against the English source.</p><div class="eval-actions" id="eval-suggestions"></div><div id="eval-messages" class="eval-log" role="log" aria-label="Runnerbot conversation" aria-live="polite"></div><form id="eval-form"><label for="eval-question">Your BOI question</label><textarea id="eval-question" maxlength="1200" required placeholder="Use a fictional example: a cassava processor in Ogun needs equipment. What should they prepare?"></textarea><div class="eval-actions"><button id="eval-send">Ask Runnerbot 2</button><button type="button" id="eval-clear">Clear conversation</button><button type="button" id="eval-export">Export this conversation</button></div><p id="eval-status" role="status"></p></form></div>
<div class="eval-card" id="eval-review"><h2>Catch a discrepancy before submission</h2><p>Synthetic practice only. Compare figures for the same period, then explain differences to a human reviewer. This is not document verification or credit assessment.</p><div class="eval-grid"><label>Business-plan monthly sales (₦)<input id="plan-sales" type="number" min="0" max="1000000000000" value="1200000"></label><label>Financial-record monthly sales (₦)<input id="record-sales" type="number" min="0" max="1000000000000" value="850000"></label></div><label><input id="same-period" type="checkbox"> Both figures refer to the same accounting period</label><button id="review-figures">Check consistency</button><p id="review-result" class="eval-result" role="status"></p><details><summary>Returned documents: prepare a better response</summary><label>Example issue<select id="return-issue"><option value="period">Figures cover different periods</option><option value="missing">Supporting evidence missing</option><option value="unclear">Purpose of funding unclear</option></select></label><p id="return-guidance"></p><p class="eval-meta">Use the actual instruction in your official portal. Do not upload or paste the returned document here.</p></details></div>
<div class="eval-card" id="eval-commercial"><h2>Test the value assumptions</h2><p>Editable illustrations, not forecasts or measured BOI results. Interest income is not profit. No fees, payments or paid priority during the proposed pilot.</p><div class="eval-grid"><label>Baseline facilities<input id="facilities" type="number" min="0" max="1000000" value="1000"></label><label>Hypothetical completion uplift (%)<input id="uplift" type="number" min="0" max="100" value="5"></label><label>Average facility (₦)<input id="facility" type="number" min="0" max="1000000000000" value="10000000"></label><label>Assumed annual interest rate (%)<input id="interest" type="number" min="0" max="100" value="7"></label><label>Capital availability assumption (%)<input id="capital" type="number" min="0" max="100" value="50"></label><label>Preparation cases per month<input id="cases" type="number" min="0" max="1000000" value="100"></label><label>Manual minutes per case<input id="before" type="number" min="0" max="10000" value="45"></label><label>Assisted minutes per case<input id="after" type="number" min="0" max="10000" value="30"></label></div><button id="calculate-value">Calculate illustration</button><p id="value-result" class="eval-result" role="status"></p><details><summary>Proposed pilot: prove the operational value first</summary><p>90 days, one BOI-selected programme, one bounded cohort. No upfront technology fee or applicant charge. No live BOI integration or lending decisions.</p><ol><li>Weeks 1–2: approve scope, content, baseline, security, privacy and escalation arrangements.</li><li>Weeks 3–10: compare preparation completeness, document rework and staff/BDSP handling time with the agreed baseline.</li><li>Weeks 11–12: review results, errors, accessibility and cost per completed preparation. Agree whether to stop, revise or procure an expansion.</li></ol><p>No outcomes measured yet. Proposed metrics: complete preparation packs / reviewed packs; returned-document incidents / submitted cases; median human handling minutes per case. Record cohort, denominator, time period and limitations.</p><p>Future options: institutional licence, programme sponsorship or BOI-approved revenue share. No paid loan priority, approval commission or sale of applicant data. Basic programme information remains free.</p></details></div>
<div class="eval-card showcase-card" id="runnerbot-showcase">
  <div class="showcase-kicker"><span class="showcase-live-dot"></span> RUNNERBOT 2 / INTELLIGENCE DEMONSTRATION <span class="showcase-scripted">SCRIPTED · SYNTHETIC · NO MODEL CALLS</span></div>
  <div class="showcase-top">
    <div><h2>Watch Runnerbot 2 in action.</h2><p>Follow a fictional enterprise from its first financing question to a human-review-ready preparation pack. Explore nine decision moments, safeguards and institutional use cases—without submitting any case.</p></div>
    <div class="showcase-counter"><strong id="showcase-count">09</strong><span>illustrative scenarios</span></div>
  </div>
  <div class="showcase-tabs" id="showcase-tabs" role="group" aria-label="Choose a Runnerbot 2 scenario"></div>
  <div class="showcase-stage" aria-label="Scripted synthetic conversation and workflow">
    <div class="showcase-main">
      <div class="showcase-stage-header"><div class="showcase-stage-tag" id="showcase-chapter"></div><span id="showcase-sector"></span></div>
      <h3 id="showcase-title"></h3><p class="showcase-subtitle" id="showcase-subtitle"></p>
      <div class="showcase-message showcase-user"><span>FICTIONAL ENTREPRENEUR / EVALUATOR</span><p id="showcase-prompt"></p></div>
      <div class="showcase-message showcase-bot"><div class="showcase-bot-label"><span class="showcase-bot-avatar">✦</span><strong>Runnerbot 2</strong><small>Illustrative guidance</small></div><p id="showcase-answer"></p></div>
      <div class="showcase-bottom"><div class="showcase-result-kicker">POTENTIAL VALUE</div><strong id="showcase-outcome"></strong><span id="showcase-metric"></span></div>
    </div>
    <aside class="showcase-rail">
      <div class="showcase-rail-header"><span>ILLUSTRATIVE WORKFLOW</span><span>01—03</span></div>
      <ol class="showcase-process" id="showcase-process"></ol>
      <div class="showcase-evidence"><span>REFERENCE / EVIDENCE</span><p id="showcase-evidence"></p></div>
      <div class="showcase-guard"><span>CONTROL BOUNDARY</span><p id="showcase-boundary"></p></div>
      <div class="showcase-handoff"><span>PROPOSED NEXT STEP</span><p id="showcase-handoff"></p></div>
    </aside>
  </div>
  <div class="showcase-controls">
    <div class="showcase-control-buttons"><button id="tour-play" type="button">▶ Watch demonstration</button><button id="tour-prev" type="button">← Previous</button><button id="tour-next" type="button">Next scenario →</button><button id="tour-reset" type="button">Restart</button></div>
    <div class="showcase-progress"><div id="showcase-progress-fill"></div></div>
    <div class="showcase-progress-caption"><span id="showcase-position" aria-live="polite"></span><span>Illustrative behaviour, not live output or measured BOI results</span></div>
  </div>
</div>
<div class="eval-card"><h2>What is working—and what remains proposed</h2><p id="eval-health" role="status">Checking evaluator service…</p><ul><li>Working: signed evaluator sessions, preparation checklist, synthetic consistency checks, editable scenario calculations and local transcript export.</li><li>Live AI: availability shown above; bounded context and official-source retrieval, with a shared server-side spending stop.</li><li>No BOI, MyBOI, iProgrammes, Microsoft 365, lending or applicant-record integration.</li><li>Human referrals here are guidance or exportable drafts. No officer is notified and no case is submitted.</li><li>Production pilot gates: BOI-approved content owner, DPA/retention policy, security review, deployment/residency choice, language validation, escalation contacts and evaluation baseline.</li></ul><p class="eval-meta">Conversation stays in this page's memory and is cleared on reload or sign-out. Questions sent to live AI are processed by OpenAI; do not include personal information. No conversational database is used in this evaluator. Provider retention terms require review before a real pilot.</p></div>`;
const upgrade=mountUpgrade(shell);
const target=document.querySelector('.transparency-banner');target?.after(shell);if(!target)document.body.append(shell);
let history=[],transcript=[],busy=false;const $=id=>document.getElementById(id);
const choices=['How does this complement MyBOI and BDSPs?','A fictional Ogun cassava processor needs equipment. What should they prepare?','How would BOI measure value in a 90-day pilot?','Can this integrate with Microsoft Copilot?'];
for(const text of choices){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>{$('eval-question').value=text;$('eval-question').focus();};$('eval-suggestions').append(b);}
function formatted(text){const fragment=document.createDocumentFragment();const pattern=/\*\*([^*]+)\*\*|\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g;let at=0;for(const m of text.matchAll(pattern)){fragment.append(document.createTextNode(text.slice(at,m.index)));if(m[1]){const b=document.createElement('strong');b.textContent=m[1];fragment.append(b);}else{const a=document.createElement('a');a.textContent=m[2];a.href=m[3];a.target='_blank';a.rel='noopener noreferrer';fragment.append(a);}at=m.index+m[0].length;}fragment.append(document.createTextNode(text.slice(at)));return fragment;}
function message(text,role,sources=[]){transcript.push({text,role,sources});const d=document.createElement('div');d.className='eval-msg '+role;d.append(document.createTextNode((role==='user'?'You':'Runnerbot 2')+'\n'),formatted(text));for(const s of sources){try{const u=new URL(s.url);if(u.protocol!=='https:')continue;const a=document.createElement('a');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=s.title;d.append(document.createElement('br'),a);}catch{}}$('eval-messages').append(d);d.scrollIntoView({block:'nearest'});}
$('eval-form').onsubmit=async e=>{e.preventDefault();if(busy)return;const question=$('eval-question').value.trim();if(!question)return;busy=true;$('eval-send').disabled=true;$('eval-clear').disabled=true;message(question,'user');$('eval-question').value='';$('eval-status').textContent='Preparing a grounded response…';try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:question,history:history.slice(-6),perspective:$('eval-perspective').value,language:$('eval-language').value}),signal:AbortSignal.timeout(40000)});const data=await r.json();if(r.ok){message(data.answer,'assistant',data.sources);history.push({role:'user',content:question},{role:'assistant',content:data.answer.slice(0,1000)});$('eval-status').textContent=(data.mode==='deterministic'?'Reference / policy response':data.mode==='cached-ai'?'Cached AI response':'Live AI response')+' · '+data.classification+' · No external action executed';}else{message(data.fallback||'Live conversation is unavailable. Your checklist, consistency review, scenarios and guided walkthrough remain available.','assistant');$('eval-status').textContent=r.status===401?'Session expired. Sign out and sign in again.':'Live AI unavailable; no automatic retry was made.';}}catch{$('eval-status').textContent='Connection interrupted. No automatic retry was made; use the preparation tools or try later.';}finally{busy=false;$('eval-send').disabled=false;$('eval-clear').disabled=false;}};
$('eval-clear').onclick=()=>{history=[];transcript=[];$('eval-messages').replaceChildren();$('eval-status').textContent='Conversation cleared.';};
$('eval-export').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([exportTranscript(transcript,{pageUrl:location.href})],{type:'text/plain'}));a.download='boi-evaluation-conversation.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
$('eval-logout').onclick=async()=>{const r=await fetch('/api/auth?action=logout',{method:'POST'});if(r.ok){history=[];location.reload();}else $('eval-status').textContent='Sign-out failed; please retry.';};
$('review-figures').onclick=()=>{try{const v=compareSyntheticRevenue({planMonthlySalesNgn:Number($('plan-sales').value),recordsMonthlySalesNgn:Number($('record-sales').value),samePeriodConfirmed:$('same-period').checked});$('review-result').textContent=v.issue||`${v.status}: ₦${v.differenceNgn.toLocaleString()} difference (${v.differencePercentage}%).\n${v.note}\nNext: reconcile dates, sales basis and any one-off items with your BDSP; do not change records just to make the figures agree.`;}catch{$('review-result').textContent='Enter valid sample amounts from ₦0 to ₦1 trillion. Larger amounts are not supported.';}};
const guidance={period:'Confirm period start/end, whether figures are cash received or sales invoiced, and treatment of VAT and one-off items. Prepare a short reconciliation for human review.',missing:'Identify the specific missing item in the official return notice. Check the programme-specific checklist and gather evidence through the official channel. Do not mark missing evidence as verified.',unclear:'Explain the equipment or working-capital purpose, the cost basis and expected operational use. Distinguish supplier quotations from estimates; ask a BDSP to review assumptions.'};
$('return-issue').onchange=()=>{$('return-guidance').textContent=guidance[$('return-issue').value];};$('return-issue').onchange();
$('calculate-value').onclick=()=>{try{const ids=['facilities','uplift','facility','interest','capital','cases','before','after'];if(ids.some(id=>!$(id).checkValidity()||$(id).value===''))throw Error();const n=id=>Number($(id).value);const v=incrementalInterestScenario({baselineFacilities:n('facilities'),hypotheticalUpliftRate:n('uplift')/100,averageFacilityNgn:n('facility'),annualInterestRate:n('interest')/100,capitalAvailabilityRate:n('capital')/100});$('value-result').textContent=`ILLUSTRATIVE — NOT A FORECAST\nAdditional facilities: ${v.hypotheticalAdditionalFacilities}\nPrincipal: ₦${v.hypotheticalIncrementalPrincipalNgn.toLocaleString()}\nAnnual gross interest income: ₦${v.hypotheticalAnnualGrossInterestIncomeNgn.toLocaleString()}\nWorking: facilities × uplift × capital assumption × average facility × interest rate.\nPotential human time released: ${(n('cases')*(n('before')-n('after'))/60).toFixed(1)} hours/month; cases × (manual − assisted minutes) ÷ 60. Negative values indicate extra time.\n${v.note}\nTime released is not a payroll saving unless BOI demonstrates it.`;}catch{$('value-result').textContent='Check all example values and percentages.';}};
// Curated synthetic video-style showcase. It makes no model calls and never claims real actions.
const showcaseTabs=$('showcase-tabs');
let sceneIndex=0,sceneTimer=null,workflowStep=0;
let currentLanguage='English';
$('showcase-count').textContent=String(showcaseOverview.count).padStart(2,'0');
function stopShowcase(){
  if(sceneTimer!==null){clearInterval(sceneTimer);sceneTimer=null;}
  $('tour-play').textContent='▶ '+localeCopy(currentLanguage)[6];
  $('tour-play').setAttribute('aria-pressed','false');
}
function renderShowcase(){
  const scene=showcaseScenes[sceneIndex];
  $('showcase-chapter').textContent=scene.chapter;
  $('showcase-sector').textContent=scene.sector;
  $('showcase-title').textContent=scene.title;
  $('showcase-subtitle').textContent=scene.subtitle;
  $('showcase-prompt').textContent=scene.prompt;
  $('showcase-answer').textContent=scene.answer;
  $('showcase-outcome').textContent=scene.outcome;
  $('showcase-metric').textContent=scene.metric;
  $('showcase-evidence').textContent=scene.evidence;
  $('showcase-boundary').textContent=scene.boundary;
  $('showcase-handoff').textContent=scene.handoff;
  $('showcase-process').replaceChildren();
  scene.actions.forEach((a,i)=>{
    const li=document.createElement('li');
    const n=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');
    const t=document.createElement('p');t.textContent=a;
    li.append(n,t);$('showcase-process').appendChild(li);
  });
  for(const b of showcaseTabs.querySelectorAll('button')){
    const active=Number(b.dataset.sceneIndex)===sceneIndex;
    b.classList.toggle('active',active);
    b.setAttribute('aria-pressed',String(active));
  }
  $('showcase-position').textContent='Scenario '+(sceneIndex+1)+' of '+showcaseScenes.length;
  $('showcase-progress-fill').style.width=((sceneIndex*3+workflowStep+1)/(showcaseScenes.length*3)*100).toFixed(1)+'%';
  renderWorkflow(scene,workflowStep);
  const localized=localScene(sceneIndex,currentLanguage),copy=localeCopy(currentLanguage);
  $('runnerbot-showcase').dataset.language=currentLanguage;
  if(localized){
    $('showcase-title').textContent=localized[0];$('showcase-answer').textContent=localized[1];
    $('showcase-subtitle').textContent=copy[29];
    const original=document.createElement('details');const summary=document.createElement('summary');summary.textContent='English reference';original.append(summary);
    const text=document.createElement('p');text.textContent=scene.prompt+' '+scene.answer;original.append(text);$('workflow-state').append(original);
    [...$('showcase-process').querySelectorAll('li p')].forEach((p,i)=>p.textContent=copy[30+i]);
  }
  const play=$('tour-play');play.textContent=(sceneTimer===null?'▶ ':'❚❚ ')+copy[sceneTimer===null?6:7];
}
showcaseScenes.forEach((scene,i)=>{
  const button=document.createElement('button');
  button.type='button';
  button.dataset.sceneIndex=String(i);
  button.className='showcase-tab';
  const icon=document.createElement('span');icon.className='showcase-tab-icon';icon.textContent=scene.icon;
  const label=document.createElement('span');label.textContent=scene.sector;
  button.append(icon,label);
  button.onclick=()=>{stopShowcase();sceneIndex=i;workflowStep=0;renderShowcase();};
  showcaseTabs.appendChild(button);
});
function shiftShowcase(delta,manual=true){
  if(manual)stopShowcase();
  sceneIndex=(sceneIndex+delta+showcaseScenes.length)%showcaseScenes.length;workflowStep=0;
  renderShowcase();
}
$('tour-play').onclick=()=>{
  if(sceneTimer!==null){stopShowcase();return;}
  $('tour-play').textContent='❚❚ '+localeCopy(currentLanguage)[7];
  $('tour-play').setAttribute('aria-pressed','true');
  sceneTimer=setInterval(()=>{
    if(workflowStep<2){workflowStep++;renderShowcase();return;}
    if(sceneIndex===showcaseScenes.length-1){stopShowcase();return;}
    shiftShowcase(1,false);
  },7200);
};
$('tour-prev').onclick=()=>shiftShowcase(-1);
$('tour-next').onclick=()=>shiftShowcase(1);
$('tour-reset').onclick=()=>{stopShowcase();sceneIndex=0;workflowStep=0;renderShowcase();};
$('tour-step').onclick=()=>{stopShowcase();if(workflowStep<2){workflowStep++;renderShowcase();}else shiftShowcase(1);};
const locales=mountLanguages(shell,language=>{currentLanguage=language;renderShowcase();document.dispatchEvent(new document.defaultView.CustomEvent('boi-workspace-language',{detail:language}));});
renderShowcase();
fetch('/api/status').then(r=>r.json()).then(x=>{upgrade.refresh(x);$('eval-health').textContent=`Evaluator access: ${x.authenticated?'authenticated':'sign-in required'}. Live AI: ${x.aiAvailable?'available':'currently unavailable'}. Knowledge: ${x.knowledgeVersion||'unavailable'}. Evaluation version: ${EVALUATOR_VERSION}.`;}).catch(()=>{$('eval-health').textContent='Live service status unavailable; preparation tools remain usable.';});
}
