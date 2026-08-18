import test from 'node:test';
import assert from 'node:assert/strict';
import {footerCopyright} from '../lib/footer.mjs';

test('builds AXIS copyright with supplied year',()=>{
  assert.equal(
    footerCopyright(2031),
    '© 2031 AXIS - Soluciones Digitales. Todos los derechos reservados.'
  );
});
