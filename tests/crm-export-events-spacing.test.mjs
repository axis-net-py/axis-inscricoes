import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync(new URL('../app/admin-crm.css',import.meta.url),'utf8');

test('event export cards separate title and registration count',()=>{
  assert.match(css,/\.admin-export-events label>span\{[^}]*display:grid[^}]*gap:/);
  assert.match(css,/\.admin-export-events label strong\{[^}]*line-height:/);
  assert.match(css,/\.admin-export-events label small\{[^}]*margin-top:/);
});
