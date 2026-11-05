// Local browser UI regression. Network/provider responses are mocked: no AI spend.
const {chromium}=require('playwright');const http=require('node:http');const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
const root=process.cwd();const server=http.createServer((req,res)=>{
res.setHeader('Content-Type',req.url.endsWith('.css')?'text/css':req.url.endsWith('.js')||req.url.endsWith('.mjs')?'text/javascript':'text/html');
if(req.url.startsWith('/api/')){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(req.url==='/api/status'?{authenticated:true,aiAvailable:true,knowledgeVersion:'test'}:{authenticated:true,role:'EVALUATOR_OBSERVER'}));}
try{res.end(fs.readFileSync(req.url==='/'?path.join(root,'private/evaluator.html'):path.join(root,'public',req.url)));}catch{res.statusCode=404;res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let browser;
try{browser=await chromium.launch({headless:true});for(const width of [1280,390]){
const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/api/chat',r=>r.fulfill({json:{answer:'**Preparation guidance**\nUse the official [MyBOI portal](https://onlineportal.boi.ng/). No eligibility decision.',classification:'ANSWER',mode:'live-ai-boi-evaluation',sources:[]}}));
await page.goto(base);await page.locator('#rnGate').waitFor({state:'detached'});
await page.locator('#boi-preflight-items input').nth(0).check();await page.locator('#boi-preflight-items input').nth(1).check();assert.match(await page.locator('#boi-preflight-result').innerText(),/2 of 5.*40%/);
await page.getByRole('button',{name:'Check consistency',exact:true}).click();assert.match(await page.locator('#review-result').innerText(),/same accounting period/);
await page.locator('#same-period').check();await page.getByRole('button',{name:'Check consistency',exact:true}).click();assert.match(await page.locator('#review-result').innerText(),/350,000/);
await page.getByRole('button',{name:'Calculate illustration',exact:true}).click();assert.match(await page.locator('#value-result').innerText(),/17,500,000/);assert.match(await page.locator('#value-result').innerText(),/25.0 hours/);
await page.locator('#eval-question').fill('What should a fictional processor prepare?');await page.locator('#eval-send').click();await page.locator('#eval-status').getByText('Live AI response',{exact:false}).waitFor();assert.equal(await page.locator('#eval-messages strong').innerText(),'Preparation guidance');
await page.getByRole('button',{name:'Clear conversation',exact:true}).click();assert.equal(await page.locator('#eval-messages').innerText(),'');
await page.getByRole('button',{name:'Next step',exact:true}).click();assert.match(await page.locator('#tour-step').innerText(),/2 \/ 6/);
for(const v of ['staff','tech','entrepreneur'])await page.locator('[data-view="'+v+'"]').click();
assert.deepEqual(errors,[]);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,'Horizontal overflow at '+width);
console.log('PASS browser width '+width+': preparation, discrepancy, value, chat rendering, reset, tour, navigation, no JS errors or overflow');await page.close();}
}finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
