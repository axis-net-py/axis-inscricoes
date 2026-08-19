import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../components/PublicForm.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');

test('transfer selection opens a bank-details modal',()=>{
  assert.match(source,/setTransferModalOpen\(e\.target\.value==='transfer'\)/);
  assert.match(source,/role="dialog"/);
  assert.match(source,/event\.bank_name/);
  assert.match(source,/event\.bank_account_primary/);
  assert.match(source,/event\.bank_account_secondary/);
});

test('transfer modal accepts image or pdf proof inside the same form',()=>{
  assert.match(source,/name="paymentProof"/);
  assert.match(source,/accept="image\/\*,\.pdf"/);
  assert.match(source,/transfer-file-name/);
});

test('modal has dedicated LAP styling',()=>{
  assert.match(css,/\.transfer-modal-backdrop/);
  assert.match(css,/\.transfer-modal-card/);
  assert.match(css,/\.transfer-upload/);
});
