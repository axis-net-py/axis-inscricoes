import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {COOKIE,validSession} from '@/lib/session';
import {db} from '@/lib/db';
import {renderSocialArt} from '@/lib/social-art.mjs';

export const runtime='nodejs';
export const maxDuration=60;
export async function GET(request){
  const jar=await cookies();
  if(!validSession(jar.get(COOKIE)?.value||'')) return NextResponse.json({error:'Não autorizado.'},{status:401});
  const id=new URL(request.url).searchParams.get('registrationId');
  if(!id||!/^[a-zA-Z0-9-]{1,64}$/.test(id)) return NextResponse.json({error:'Registro inválido.'},{status:400});
  try{
    const sql=db();
    const rows=await sql`SELECT r.answers->>'photoUrl' photo_url,e.slug,c.first_name,c.last_name FROM registrations r JOIN events e ON e.id=r.event_id JOIN contacts c ON c.id=r.contact_id WHERE r.id=${id} LIMIT 1`;
    const row=rows[0];
    if(!row?.photo_url) return NextResponse.json({error:'Foto não encontrada.'},{status:404});
    const url=new URL(row.photo_url);
    if(url.protocol!=='https:'||!url.hostname.endsWith('.public.blob.vercel-storage.com')) throw new Error('Invalid photo origin');
    const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!response.ok) throw new Error('Photo unavailable');
    const reader=response.body.getReader(); const chunks=[]; let size=0;
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>10*1024*1024){await reader.cancel();throw new Error('Photo too large');}chunks.push(value);}
    const original=Buffer.concat(chunks);
    const art=row.slug==='lap18'?await renderSocialArt(original,`${row.first_name} ${row.last_name}`):original;
    return new NextResponse(art,{headers:{'Content-Type':row.slug==='lap18'?'image/png':response.headers.get('content-type')||'application/octet-stream','Content-Disposition':`attachment; filename="${row.slug==='lap18'?'lap18-euvou':'foto'}-${id}${row.slug==='lap18'?'.png':''}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }catch(error){console.error('Social art download failed',error.message);return NextResponse.json({error:'Não foi possível gerar a arte. Tente novamente.'},{status:500});}
}
