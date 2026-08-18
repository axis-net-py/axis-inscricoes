import crypto from 'node:crypto';
const COOKIE='axis_admin';
export { COOKIE };
function secret(){ if(!process.env.ADMIN_SESSION_SECRET) throw new Error('ADMIN_SESSION_SECRET não configurado'); return process.env.ADMIN_SESSION_SECRET; }
export function makeSession(){ const exp=Date.now()+8*60*60*1000; const data=`admin:${exp}`; const sig=crypto.createHmac('sha256',secret()).update(data).digest('hex'); return Buffer.from(`${data}:${sig}`).toString('base64url'); }
export function validSession(token){ try{ const raw=Buffer.from(token,'base64url').toString(); const [role,exp,sig]=raw.split(':'); if(role!=='admin'||Number(exp)<Date.now()) return false; const expected=crypto.createHmac('sha256',secret()).update(`${role}:${exp}`).digest('hex'); return crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)); }catch{return false;} }
