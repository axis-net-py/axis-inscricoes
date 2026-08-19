import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const admin=fs.readFileSync(new URL('../app/admin/page.js',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../lib/db.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');

test('dashboard focuses LAP 18 and hides previous events behind details',()=>{
  assert.match(db,/getDashboard\(currentSlug='lap18'\)/);
  assert.match(admin,/Eventos anteriores/);
  assert.match(admin,/<details[^>]*className="admin-archive"/);
  assert.match(admin,/d\.currentEvent/);
});

test('current dashboard stats are scoped to the active event',()=>{
  assert.match(db,/WHERE e\.slug=\$\{currentSlug\}/);
  assert.match(db,/currentStats/);
  assert.match(admin,/d\.stats\.registrations/);
  assert.match(admin,/d\.stats\.confirmed_payments/);
});

test('admin uses dedicated LAP design-system classes',()=>{
  assert.match(admin,/admin-shell/);
  assert.match(admin,/admin-hero/);
  assert.match(css,/\.admin-shell/);
  assert.match(css,/\.admin-stat-card/);
});

test('transfer registrations expose a secure proof action',()=>{
  assert.match(admin,/\/api\/admin\/proof\?registrationId=/);
  assert.match(admin,/Ver comprovante/);
  assert.match(db,/proof_filename/);
});
