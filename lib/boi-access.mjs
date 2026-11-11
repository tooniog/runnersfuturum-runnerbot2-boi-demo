import {scryptSync, timingSafeEqual, createHash} from 'node:crypto';

export const ROLE_PERMISSIONS = Object.freeze({
  RUNNERS_ADMIN: Object.freeze(['evaluate', 'review:prepare', 'audit:read', 'ai:suspend']),
  BOI_REVIEWER: Object.freeze(['evaluate', 'review:prepare']),
  IT_AUDITOR: Object.freeze(['evaluate', 'audit:read']),
  EVALUATOR_OBSERVER: Object.freeze(['evaluate'])
});
export const ROLE_LABELS = Object.freeze({RUNNERS_ADMIN:'Administrator', BOI_REVIEWER:'BOI reviewer / BDSP', IT_AUDITOR:'IT auditor', EVALUATOR_OBSERVER:'Observer'});
export function hasPermission(session, permission) {
  return !!session && Object.hasOwn(ROLE_PERMISSIONS, session.role) && ROLE_PERMISSIONS[session.role].includes(permission);
}
export function identityRegistry() {
  const raw=process.env.BOI_TEST_IDENTITIES_JSON;
  if(!raw)return [];
  const rows=JSON.parse(raw);
  const names=new Set();
  if(!Array.isArray(rows)||rows.length>20)throw Error('INVALID_IDENTITY_CONFIGURATION');
  for(const row of rows){
    if(!row || !/^[a-z0-9][a-z0-9.-]{2,63}$/.test(row.username) || names.has(row.username)
      || !Object.hasOwn(ROLE_PERMISSIONS,row.role) || !/^[a-f0-9]{32}$/.test(row.salt)
      || !/^[a-f0-9]{128}$/.test(row.hash) || typeof row.enabled!=='boolean')throw Error('INVALID_IDENTITY_CONFIGURATION');
    names.add(row.username);
  }
  return rows;
}
export function identityTag(row) {
  return createHash('sha256').update([row.username,row.role,row.salt,row.hash,row.enabled].join('|')).digest('hex');
}
export function authenticateIdentity(username,password) {
  if(typeof username!=='string'||typeof password!=='string'||password.length>128)return null;
  const name=username.trim().toLowerCase();
  const row=identityRegistry().find(r=>r.username===name);
  // Unknown accounts take the same password-derivation path and return the same error.
  const derived=scryptSync(password,row?.salt||'0'.repeat(32),64);
  const expected=Buffer.from(row?.hash||'0'.repeat(128),'hex');
  return timingSafeEqual(derived,expected)&&row?.enabled ? row : null;
}
export function publicAccess(session) {
  return {identity:session?.sub||null,role:session?.role||null,roleLabel:ROLE_LABELS[session?.role]||null,
    permissions:session && Object.hasOwn(ROLE_PERMISSIONS,session.role)?[...ROLE_PERMISSIONS[session.role]]:[],
    presentationModesGrantPermissions:false};
}
