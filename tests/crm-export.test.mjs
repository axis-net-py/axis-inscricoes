import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const crm=fs.readFileSync(new URL('../app/admin/crm/page.js',import.meta.url),'utf8');
const route=fs.readFileSync(new URL('../app/api/admin/crm/export/route.js',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../lib/db.js',import.meta.url),'utf8');

test('CRM exposes an XLSX export action that preserves active filters',()=>{
  assert.match(crm,/Exportar planilha/);
  assert.match(crm,/\/api\/admin\/crm\/export\?/);
  assert.match(crm,/event/);
  assert.match(crm,/registrationStatus/);
  assert.match(crm,/paymentStatus/);
  assert.match(crm,/paymentMethod/);
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

test('export includes the CRM operational columns',()=>{
  for(const label of ['Participante','Telefone','E-mail','Empresa','Evento','Data da inscrição','Status da inscrição','Método de pagamento','Status do pagamento','Valor','Moeda','Código do pagamento','Comprovante']){
    assert.match(route,new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  }
});
