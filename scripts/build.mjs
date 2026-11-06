import {mkdirSync,copyFileSync,readFileSync,writeFileSync} from 'node:fs';
mkdirSync('public',{recursive:true});mkdirSync('public/lib',{recursive:true});
for(const f of ['boi-preflight.js','boi-live.js','boi-live.css'])copyFileSync(f,'public/'+f);
for(const f of ['boi-evaluator-core.mjs','boi-quality.mjs','boi-response.mjs','boi-release.mjs'])copyFileSync('lib/'+f,'public/lib/'+f);
const html=readFileSync('private/evaluator.html','utf8');
const logo=html.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
if(logo)for(const f of ['runners-logo.png','apple-touch-icon.png','apple-touch-icon-precomposed.png'])writeFileSync('public/'+f,Buffer.from(logo[1],'base64'));
writeFileSync('public/robots.txt','User-agent: *\nDisallow: /\n');
