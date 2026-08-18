import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { db, getEventBySlug } from '@/lib/db';
import { validateRegistration } from '@/lib/validation.mjs';
import { validatePaymentInput } from '@/lib/payment.mjs';

export async function POST(request){
  try{
    const form=await request.formData();
    const input=Object.fromEntries(form.entries());
    const event=await getEventBySlug(String(input.eventSlug||''));
    if(!event) return NextResponse.json({error:'Evento no disponible.'},{status:404});
    const check=validateRegistration(input);
    if(!check.valid) return NextResponse.json({error:'Revisa los campos obligatorios.',fields:check.errors},{status:400});
    const pay=validatePaymentInput(input);
    if(!pay.valid) return NextResponse.json({error:'Revisa los datos de pago.',fields:pay.errors},{status:400});
    const sql=db();
    const contacts=await sql`INSERT INTO contacts(first_name,last_name,phone,company,role_title) VALUES(${String(input.firstName).trim()},${String(input.lastName).trim()},${check.phone},${String(input.company).trim()},${String(input.roleTitle).trim()}) ON CONFLICT(phone) DO UPDATE SET first_name=EXCLUDED.first_name,last_name=EXCLUDED.last_name,company=EXCLUDED.company,role_title=EXCLUDED.role_title,updated_at=now() RETURNING id`;
    const regs=await sql`INSERT INTO registrations(event_id,contact_id,status,expectation,discovery_source,discovery_source_other,accessibility_required,accessibility_details,dietary_restriction,dietary_restriction_other,terms_accepted,utm_source,utm_medium,utm_campaign,utm_content,utm_term,referrer,answers) VALUES(${event.id},${contacts[0].id},'new',${String(input.expectation||'')},${String(input.discoverySource||'')},${String(input.discoverySourceOther||'')},${String(input.accessibility||'').toLowerCase().startsWith('s')},${String(input.accessibilityDetails||'')},${String(input.dietaryRestriction||'')},${String(input.dietaryRestrictionOther||'')},true,${String(input.utm_source||'')},${String(input.utm_medium||'')},${String(input.utm_campaign||'')},${String(input.utm_content||'')},${String(input.utm_term||'')},${String(input.referrer||'')},${JSON.stringify({language:String(input.language||'es'),paymentScope:pay.paymentScope})}::jsonb) ON CONFLICT(event_id,contact_id) DO UPDATE SET expectation=EXCLUDED.expectation,discovery_source=EXCLUDED.discovery_source,discovery_source_other=EXCLUDED.discovery_source_other,accessibility_required=EXCLUDED.accessibility_required,accessibility_details=EXCLUDED.accessibility_details,dietary_restriction=EXCLUDED.dietary_restriction,dietary_restriction_other=EXCLUDED.dietary_restriction_other,terms_accepted=true,answers=EXCLUDED.answers,updated_at=now() RETURNING id`;

    let group;
    if(pay.joiningExisting){
      const rows=await sql`SELECT * FROM payment_groups WHERE event_id=${event.id} AND code=${pay.paymentCode} LIMIT 1`;
      if(!rows[0]) return NextResponse.json({error:'Código de pago no encontrado para este evento.'},{status:400});
      group=rows[0];
    }else{
      const file=form.get('paymentProof');
      let proofUrl=null,proofFilename=null;
      if(pay.requiresProof){
        if(!file||typeof file!=='object'||file.size<=0) return NextResponse.json({error:'Adjunta el comprobante de transferencia.'},{status:400});
        if(file.size>8*1024*1024) return NextResponse.json({error:'El comprobante supera 8 MB.'},{status:400});
        const blob=await put(`proofs/${event.slug}/groups/${randomUUID()}-${file.name}`,file,{access:'private',addRandomSuffix:true});
        proofUrl=blob.url;proofFilename=file.name;
      }
      const code=pay.paymentScope==='group'?`${event.slug.toUpperCase().replace(/[^A-Z0-9]/g,'')}-EMP-${randomUUID().slice(0,6).toUpperCase()}`:`${event.slug.toUpperCase().replace(/[^A-Z0-9]/g,'')}-IND-${randomUUID().slice(0,6).toUpperCase()}`;
      const expected=pay.paymentScope==='group'?Number.parseInt(String(input.expectedParticipants),10):1;
      const payerCompany=pay.paymentScope==='group'?String(input.payerCompany||'').trim():String(input.company||'').trim();
      const amount=event.amount_primary?Number(event.amount_primary)*expected:null;
      const rows=await sql`INSERT INTO payment_groups(event_id,code,payment_method,status,payer_company,expected_participants,currency,amount,proof_url,proof_filename) VALUES(${event.id},${code},${pay.paymentMethod},'pending',${payerCompany},${expected},${event.currency_primary},${amount},${proofUrl},${proofFilename}) RETURNING *`;
      group=rows[0];
    }
    await sql`INSERT INTO payment_group_registrations(payment_group_id,registration_id) VALUES(${group.id},${regs[0].id}) ON CONFLICT(registration_id) DO UPDATE SET payment_group_id=EXCLUDED.payment_group_id`;
    return NextResponse.json({ok:true,registrationId:regs[0].id,paymentCode:pay.paymentScope==='group'?group.code:''});
  }catch(err){console.error(err);return NextResponse.json({error:'Error interno al registrar la inscripción.'},{status:500});}
}
