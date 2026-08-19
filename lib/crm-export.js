import {db} from '@/lib/db';

export async function getCRMExportByEvents(filters={}) {
  const sql=db();
  const eventSlugs=Array.isArray(filters.eventSlugs)?filters.eventSlugs.map(v=>String(v).trim()).filter(Boolean):[];
  const eventSlugsJson=JSON.stringify(eventSlugs);
  const q=String(filters.q||'').trim();
  const company=String(filters.company||'').trim();
  const registrationStatus=String(filters.registrationStatus||'').trim();
  const paymentStatus=String(filters.paymentStatus||'').trim();
  const paymentMethod=String(filters.paymentMethod||'').trim();
  const likeQ=`%${q}%`;
  const likeCompany=`%${company}%`;

  return sql`SELECT r.id,r.status,r.created_at,c.first_name,c.last_name,c.phone,c.company,c.email,e.name event_name,e.slug,
    COALESCE(pg.status,p.status) payment_status,COALESCE(pg.amount,p.amount) amount,COALESCE(pg.currency,p.currency) currency,
    pg.payment_method,pg.code payment_code,pg.expected_participants,
    p.proof_url legacy_proof_url,pg.proof_url group_proof_url,pg.proof_filename
    FROM registrations r
    JOIN contacts c ON c.id=r.contact_id
    JOIN events e ON e.id=r.event_id
    LEFT JOIN payment_group_registrations pgr ON pgr.registration_id=r.id
    LEFT JOIN payment_groups pg ON pg.id=pgr.payment_group_id
    LEFT JOIN LATERAL (SELECT status,amount,currency,proof_url FROM payments p WHERE p.registration_id=r.id ORDER BY created_at DESC LIMIT 1) p ON true
    WHERE e.slug IN (SELECT jsonb_array_elements_text(${eventSlugsJson}::jsonb))
      AND (${q}='' OR concat_ws(' ',c.first_name,c.last_name) ILIKE ${likeQ} OR c.phone ILIKE ${likeQ} OR COALESCE(c.company,'') ILIKE ${likeQ} OR COALESCE(c.email,'') ILIKE ${likeQ})
      AND (${company}='' OR COALESCE(c.company,'') ILIKE ${likeCompany})
      AND (${registrationStatus}='' OR r.status=${registrationStatus})
      AND (${paymentStatus}='' OR COALESCE(pg.status,p.status,'')=${paymentStatus})
      AND (${paymentMethod}='' OR COALESCE(pg.payment_method,'')=${paymentMethod})
    ORDER BY e.start_at DESC NULLS LAST,r.created_at DESC`;
}
