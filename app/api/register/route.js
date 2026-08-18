import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { db, getEventBySlug } from '@/lib/db';
import { validateRegistration } from '@/lib/validation.mjs';

export async function POST(request){
  try{
    const form=await request.formData();
    const input=Object.fromEntries(form.entries());
    const event=await getEventBySlug(String(input.eventSlug||''));
    if(!event) return NextResponse.json({error:'Evento no disponible.'},{status:404});
    const check=validateRegistration(input);
    if(!check.valid) return NextResponse.json({error:'Revisa los campos obligatorios.',fields:check.errors},{status:400});
    const sql=db();
    const contacts=await sql`INSERT INTO contacts(first_name,last_name,phone,company,role_title) VALUES(${String(input.firstName).trim()},${String(input.lastName).trim()},${check.phone},${String(input.company).trim()},${String(input.roleTitle).trim()}) ON CONFLICT(phone) DO UPDATE SET first_name=EXCLUDED.first_name,last_name=EXCLUDED.last_name,company=EXCLUDED.company,role_title=EXCLUDED.role_title,updated_at=now() RETURNING id`;
    const regs=await sql`INSERT INTO registrations(event_id,contact_id,status,expectation,discovery_source,discovery_source_other,accessibility_required,accessibility_details,dietary_restriction,dietary_restriction_other,terms_accepted,utm_source,utm_medium,utm_campaign,utm_content,utm_term,referrer) VALUES(${event.id},${contacts[0].id},'new',${String(input.expectation||'')},${String(input.discoverySource||'')},${String(input.discoverySourceOther||'')},${String(input.accessibility||'').toLowerCase().startsWith('s')},${String(input.accessibilityDetails||'')},${String(input.dietaryRestriction||'')},${String(input.dietaryRestrictionOther||'')},true,${String(input.utm_source||'')},${String(input.utm_medium||'')},${String(input.utm_campaign||'')},${String(input.utm_content||'')},${String(input.utm_term||'')},${String(input.referrer||'')}) ON CONFLICT(event_id,contact_id) DO UPDATE SET expectation=EXCLUDED.expectation,discovery_source=EXCLUDED.discovery_source,discovery_source_other=EXCLUDED.discovery_source_other,accessibility_required=EXCLUDED.accessibility_required,accessibility_details=EXCLUDED.accessibility_details,dietary_restriction=EXCLUDED.dietary_restriction,dietary_restriction_other=EXCLUDED.dietary_restriction_other,terms_accepted=true,updated_at=now() RETURNING id`;
    const file=form.get('paymentProof');
    let proofUrl=null, proofFilename=null;
    if(file && typeof file==='object' && file.size>0){
      if(file.size>8*1024*1024) return NextResponse.json({error:'El comprobante supera 8 MB.'},{status:400});
      const blob=await put(`proofs/${event.slug}/${regs[0].id}-${file.name}`,file,{access:'private',addRandomSuffix:true}); proofUrl=blob.url; proofFilename=file.name;
    }
    await sql`INSERT INTO payments(registration_id,currency,amount,status,proof_url,proof_filename) VALUES(${regs[0].id},${event.currency_primary},${event.amount_primary},'pending',${proofUrl},${proofFilename})`;
    return NextResponse.json({ok:true,registrationId:regs[0].id});
  }catch(err){console.error(err);return NextResponse.json({error:'Error interno al registrar la inscripción.'},{status:500});}
}
