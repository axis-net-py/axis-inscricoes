import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const form=fs.readFileSync(new URL('../components/PublicForm.js',import.meta.url),'utf8');

test('LAP18 form exposes corporate and couple pricing',()=>{
  assert.match(form,/Tabla de inversión corporativa/);
  assert.match(form,/Tabela de investimento corporativo/);
  assert.match(form,/USD \$350/);
  assert.match(form,/USD \$335/);
  assert.match(form,/USD \$325/);
  assert.match(form,/USD \$315/);
  assert.match(form,/Casal \/ Pareja/);
  assert.match(form,/USD \$630/);
});
