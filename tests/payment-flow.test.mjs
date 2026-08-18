import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePaymentInput, normalizePaymentCode} from '../lib/payment.mjs';

test('cash never requires proof',()=>{
  const r=validatePaymentInput({paymentMethod:'cash',paymentScope:'individual'});
  assert.equal(r.valid,true);
  assert.equal(r.requiresProof,false);
});

test('new transfer requires proof',()=>{
  const r=validatePaymentInput({paymentMethod:'transfer',paymentScope:'group',payerCompany:'ACME',expectedParticipants:'8'});
  assert.equal(r.valid,true);
  assert.equal(r.requiresProof,true);
});

test('joining existing payment group does not require another proof',()=>{
  const r=validatePaymentInput({paymentMethod:'transfer',paymentScope:'group',paymentCode:' lap18-emp-0042 '});
  assert.equal(r.valid,true);
  assert.equal(r.requiresProof,false);
  assert.equal(normalizePaymentCode(' lap18-emp-0042 '),'LAP18-EMP-0042');
});

test('new group requires company and participant count',()=>{
  const r=validatePaymentInput({paymentMethod:'cash',paymentScope:'group'});
  assert.equal(r.valid,false);
  assert.equal(r.errors.payerCompany,'required');
  assert.equal(r.errors.expectedParticipants,'required');
});
