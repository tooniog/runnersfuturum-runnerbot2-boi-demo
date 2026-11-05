import {readFileSync} from 'node:fs';
import {verifySession,cookieValue} from '../lib/boi-session.mjs';
const login=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Runners | BOI Evaluator</title><link rel="icon" href="/runners-logo.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="stylesheet" href="/boi-live.css"><main class="eval-login"><img src="/runners-logo.png" alt="Runners" width="60"><p>RUNNERS FUTURUM · PRIVATE EVALUATION</p><h1>Runnerbot 2 for BOI</h1><p>Applicant preparation. BDSP productivity. Human authority.</p><form id="login"><label for="password">Evaluator access code</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="128"><button>Open evaluator</button><p id="status" role="status"></p></form><small>Not an official BOI application channel. No live BOI systems connected. Use synthetic examples only.</small></main><script src="/boi-live.js" type="module"></script></html>`;
export default function handler(req,res){
res.setHeader('Cache-Control','private, no-store');res.setHeader('Content-Type','text/html; charset=utf-8');
res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
if(!['GET','HEAD'].includes(req.method))return res.status(405).end();
res.status(200).send(verifySession(cookieValue(req),process.env.BOI_COOKIE_SECRET)?readFileSync(new URL('../private/evaluator.html',import.meta.url),'utf8'):login);
}
