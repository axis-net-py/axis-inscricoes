import sharp from 'sharp';
import path from 'node:path';

let prepared;
async function prepareTemplate() {
  const {data, info} = await sharp(path.join(process.cwd(), 'public/presets/lap18.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const {width,height}=info;
  // Only the connected white photo opening is transparent. The badge stays on top.
  const seen=new Uint8Array(width*height), queue=new Int32Array(width*height);
  let head=0,tail=0;
  queue[tail++]=800*width+400; seen[queue[0]]=1;
  while(head<tail){
    const p=queue[head++], i=p*4;
    if(Math.min(data[i],data[i+1],data[i+2])<220) continue;
    data[i+3]=0;
    const x=p%width,y=Math.floor(p/width);
    for(const n of [x>0?p-1:-1,x<width-1?p+1:-1,y>0?p-width:-1,y<height-1?p+width:-1]){
      if(n>=0&&!seen[n]){seen[n]=1;queue[tail++]=n;}
    }
  }
  return {overlay:await sharp(data,{raw:{width,height,channels:4}}).png().toBuffer(),width,height};
}

export async function renderSocialArt(photo, name='') {
  prepared ??= prepareTemplate();
  const {overlay,width,height}=await prepared;
  const source=await sharp(photo,{limitInputPixels:40000000}).rotate().png().toBuffer();
  const backdrop=await sharp(source).resize(700,770,{fit:'cover'}).blur(24).png().toBuffer();
  const fitted=await sharp(source).resize(700,770,{fit:'contain',background:'#00000000'}).png().toBuffer();
  const portrait=await sharp(backdrop).composite([{input:fitted}]).png().toBuffer();
  const safeName=String(name).trim().slice(0,80).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const fontSize=Math.min(36,Math.max(16,600/Math.max(1,String(name).length)*1.6));
  const label=Buffer.from(`<svg width="${width}" height="${height}"><text x="470" y="1380" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="${fontSize}" fill="#10223c">${safeName}</text></svg>`);
  return sharp({create:{width,height,channels:4,background:'#ffffff'}})
    .composite([{input:portrait,left:115,top:555},{input:overlay},{input:label}]).png().toBuffer();
}
