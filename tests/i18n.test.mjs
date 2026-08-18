import test from 'node:test';
import assert from 'node:assert/strict';
import {copyFor, fieldText} from '../lib/i18n.js';

test('returns Spanish and Portuguese interface copy',()=>{
 assert.equal(copyFor('es').submit,'Enviar inscripción');
 assert.equal(copyFor('pt').submit,'Enviar inscrição');
 assert.equal(copyFor('pt').trainingInfo,'Informações do treinamento');
});

test('uses event field translation for active language',()=>{
 const f={label_es:'Teléfono',label_pt:'Telefone',help_text_es:'Incluye país',help_text_pt:'Inclua país'};
 assert.equal(fieldText(f,'es').label,'Teléfono');
 assert.equal(fieldText(f,'pt').label,'Telefone');
 assert.equal(fieldText(f,'pt').help,'Inclua país');
});
