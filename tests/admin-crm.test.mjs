import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const admin=fs.readFileSync(new URL('../app/admin/page.js',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../lib/db.js',import.meta.url),'utf8');
const crm=fs.readFileSync(new URL('../app/admin/crm/page.js',import.meta.url),'utf8');

test('dashboard exposes CRM and previous-event subscriber links',()=>{
  assert.match(admin,/href="\/admin\/crm"/);
  assert.match(admin,/Ver inscritos/);
  assert.match(admin,/\/admin\/crm\?event=/);
});

test('CRM query supports event, search, registration and payment filters',()=>{
  assert.match(db,/export async function getCRM/);
  assert.match(db,/eventSlug/);
  assert.match(db,/registrationStatus/);
  assert.match(db,/paymentStatus/);
  assert.match(db,/paymentMethod/);
  assert.match(db,/company/);
  assert.match(db,/LIMIT \$\{limit\} OFFSET \$\{offset\}/);
});

test('CRM page renders search, filters, results and secure proof access',()=>{
  assert.match(crm,/name="q"/);
  assert.match(crm,/name="event"/);
  assert.match(crm,/name="registrationStatus"/);
  assert.match(crm,/name="paymentStatus"/);
  assert.match(crm,/name="paymentMethod"/);
  assert.match(crm,/Ver comprovante/);
  assert.match(crm,/resultados/);
  assert.match(crm,/Página/);
});
