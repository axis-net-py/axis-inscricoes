import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {get} from '@vercel/blob';
import {COOKIE,validSession} from '@/lib/session';
import {db} from '@/lib/db';

export async function GET(request){
  const jar=await cookies();
  if(!validSession(jar.get(COOKIE)?.value||'')) return NextResponse.json({error:'Não autorizado.'},{status:401});
  const registrationId=new URL(request.url).searchParams.get('registrationId');
  if(!registrationId) return NextResponse.json({error:'Registro não informado.'},{status:400});

  const sql=db();
  const rows=await sql`SELECT COALESCE(pg.proof_url,p.proof_url) proof_url,pg.proof_filename
    FROM registrations r
    LEFT JOIN payment_group_registrations pgr ON pgr.registration_id=r.id
    LEFT JOIN payment_groups pg ON pg.id=pgr.payment_group_id
    LEFT JOIN LATERAL (SELECT proof_url FROM payments p WHERE p.registration_id=r.id ORDER BY created_at DESC LIMIT 1) p ON true
    WHERE r.id=${registrationId} LIMIT 1`;
  const proof=rows[0];
  if(!proof?.proof_url) return NextResponse.json({error:'Comprovante não encontrado.'},{status:404});

  const result=await get(proof.proof_url,{access:'private'});
  if(result?.statusCode!==200) return new NextResponse('Comprovante não encontrado.',{status:404});
  const fallback=result.blob.pathname?.split('/').pop()||'comprovante';
  const filename=String(proof.proof_filename||fallback).replace(/["\r\n]/g,'_');
  return new NextResponse(result.stream,{headers:{
    'Content-Type':result.blob.contentType||'application/octet-stream',
    'Content-Disposition':`inline; filename="${filename}"`,
    'X-Content-Type-Options':'nosniff',
    'Cache-Control':'private, no-store'
  }});
}
