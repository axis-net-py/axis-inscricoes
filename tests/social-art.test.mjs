import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {renderSocialArt} from '../lib/social-art.mjs';

test('LAP preset composites the photo while preserving header and footer',async()=>{
  const photo=await sharp({create:{width:300,height:500,channels:3,background:'#e02020'}}).png().toBuffer();
  const output=await renderSocialArt(photo,'Ana & João <Teste>');
  const {data,info}=await sharp(output).removeAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(info.width,940);assert.equal(info.height,1673);
  const template=await sharp('public/presets/lap18.png').removeAlpha().raw().toBuffer();
  assert.deepEqual(data.subarray(0,940*500*3),template.subarray(0,940*500*3));
  assert.deepEqual(data.subarray(940*1450*3),template.subarray(940*1450*3));
  const p=(800*940+400)*3;
  assert.ok(data[p]>180&&data[p+1]<70,'Photo fills the opening');
});
test('invalid images are rejected',async()=>{
  await assert.rejects(()=>renderSocialArt(Buffer.from('not an image')));
});
