import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistration, normalizePhone } from '../lib/validation.mjs';

test('normalizePhone keeps country prefix and digits', () => {
  assert.equal(normalizePhone('+595 (981) 123-456'), '+595981123456');
});

test('valid registration passes', () => {
  const result = validateRegistration({firstName:'Ana',lastName:'Silva',company:'Axis',roleTitle:'Gerente',phone:'+595981123456',discoverySource:'Instagram',accessibility:'No',dietaryRestriction:'Ninguna',termsAccepted:true});
  assert.equal(result.valid, true);
});

test('missing required values fails', () => {
  const result = validateRegistration({});
  assert.equal(result.valid, false);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.termsAccepted);
});
