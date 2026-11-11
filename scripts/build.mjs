import {mkdirSync,copyFileSync,readFileSync,writeFileSync} from 'node:fs';
mkdirSync('public',{recursive:true});mkdirSync('public/lib',{recursive:true});
for(const f of ['boi-preflight.js','boi-live.js','boi-live.css'])copyFileSync(f,'public/'+f);
for(const f of ['boi-evaluator-core.mjs','boi-quality.mjs','boi-response.mjs','boi-release.mjs','boi-showcase.mjs','boi-upgrade-ui.mjs','boi-finance.mjs','boi-languages.mjs'])copyFileSync('lib/'+f,'public/lib/'+f);
const html=readFileSync('private/evaluator.html','utf8');
const logo=html.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
if(logo)for(const f of ['runners-logo.png','apple-touch-icon.png','apple-touch-icon-precomposed.png'])writeFileSync('public/'+f,Buffer.from(logo[1],'base64'));
writeFileSync('public/robots.txt','User-agent: *\nDisallow: /\n');

const prior=JSON.parse(readFileSync('docs/release-evidence.json','utf8'));
const release={version:'2026-11-11.1',commit:process.env.VERCEL_GIT_COMMIT_SHA||null,deploymentUrl:process.env.VERCEL_URL||null,environment:process.env.VERCEL_ENV||'local',builtAt:new Date().toISOString(),status:'BUILD_ARTIFACT_NOT_LIVE_TEST_ATTESTATION',automatedTests:prior.automatedTests,authorisedBudgetUsd:0.70,normalStopUsd:0.67,budgetStatus:'Read the authenticated admin monitor for current accounting; authorisation is not proof of migration.',notification:'Founder notification pending — manual action required.',limitations:["Authenticated live-model retest pending",...prior.limitations.filter(x=>!x.includes("no promotion performed"))]};
writeFileSync('public/release-evidence.json',JSON.stringify(release,null,2)+'\n');
