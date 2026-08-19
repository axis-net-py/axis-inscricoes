import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const crm=fs.readFileSync(new URL('../app/admin/crm/page.js',import.meta.url),'utf8');
const route=fs.readFileSync(new URL('../app/api/admin/crm/export/route.js',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../lib/db.js',import.meta.url),'utf8');

test('CRM exposes an XLSX export action that preserves active filters',()=>{
  assert.match(crm,/Exportar planilha/);
  assert.match(crm,/\/api\/admin\/crm\/export/);
  assert.match(crm,/registrationStatus/);
  assert.match(crm,/paymentStatus/);
  assert.match(crm,/paymentMethod/);
});

test('CRM export UI lets the user choose spreadsheet columns',()=>{
  assert.match(crm,/Escolha os dados da planilha/);
  assert.match(crm,/name="columns"/);
  assert.match(crm,/Selecionar todos/);
  assert.match(crm,/Limpar seleção/);
  assert.match(crm,/Gerar XLSX/);
});

test('CRM export UI lets the user select one or more events',()=>{
  assert.match(crm,/Eventos da exportação/);
  assert.match(crm,/name="events"/);
  assert.match(crm,/d\.events\.map/);
  assert.match(crm,/Selecionar todos os eventos/);
  assert.match(route,/searchParams\.getAll\('events'\)/);
  assert.match(db,/eventSlugs/);
  assert.match(db,/jsonb_array_elements_text/);
});

test('export endpoint is authenticated and returns an XLSX attachment',()=>{
  assert.match(route,/validSession/);
  assert.match(route,/application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/);
  assert.match(route,/Content-Disposition/);
  assert.match(route,/attachment/);
});

test('export queries the complete filtered CRM base rather than current pagination',()=>{
  assert.match(db,/getCRMExport/);
  assert.match(route,/getCRMExport/);
  assert.doesNotMatch(route,/limit:\s*25/);
});

test('export only includes explicitly selected allowed columns',()=>{
  assert.match(route,/searchParams\.getAll\('columns'\)/);
  assert.match(route,/COLUMN_DEFINITIONS/);
  assert.match(route,/selectedColumns/);
  assert.match(route,/Nenhuma coluna selecionada/);
});
