import test from 'node:test';
import assert from 'node:assert/strict';
import {copyFor} from '../lib/i18n.js';

test('terms acceptance fallback exists in Spanish and Portuguese',()=>{
  assert.match(copyFor('es').termsAcceptance,/términos y condiciones/i);
  assert.match(copyFor('pt').termsAcceptance,/termos e condições/i);
});
