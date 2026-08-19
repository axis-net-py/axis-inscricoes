import { neon } from '@neondatabase/serverless';

export function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurada');
  return neon(process.env.DATABASE_URL);
}

export async function getEventBySlug(slug) {
  const sql = db();
  const events = await sql`SELECT * FROM events WHERE slug=${slug} AND status='published' LIMIT 1`;
  if (!events[0]) return null;
  const fields = await sql`SELECT * FROM event_form_fields WHERE event_id=${events[0].id} AND enabled=true ORDER BY sort_order,id`;
  return { ...events[0], fields };
}

export async function getDashboard(currentSlug='lap18') {
  const sql = db();
  const currentRows = await sql`SELECT e.*, (SELECT count(*) FROM registrations r WHERE r.event_id=e.id)::int registration_count FROM events e WHERE e.slug=${currentSlug} LIMIT 1`;
  const currentEvent = currentRows[0] || null;

  if (!currentEvent) {
    const previousEvents = await sql`SELECT e.*, (SELECT count(*) FROM registrations r WHERE r.event_id=e.id)::int registration_count FROM events e ORDER BY start_at DESC NULLS LAST`;
    return { currentEvent:null, stats:{contacts:0,events:0,registrations:0,confirmed_payments:0,pending_payments:0}, previousEvents, registrations:[] };
  }

  const [currentStats, previousEvents, registrations] = await Promise.all([
    sql`SELECT
      (SELECT count(DISTINCT r.contact_id) FROM registrations r WHERE r.event_id=${currentEvent.id})::int contacts,
      1::int events,
      (SELECT count(*) FROM registrations r WHERE r.event_id=${currentEvent.id})::int registrations,
      ((SELECT count(*) FROM payment_groups pg WHERE pg.event_id=${currentEvent.id} AND pg.status='confirmed') +
       (SELECT count(*) FROM payments p JOIN registrations r ON r.id=p.registration_id WHERE r.event_id=${currentEvent.id} AND p.status='confirmed'))::int confirmed_payments,
      ((SELECT count(*) FROM payment_groups pg WHERE pg.event_id=${currentEvent.id} AND pg.status='pending') +
       (SELECT count(*) FROM payments p JOIN registrations r ON r.id=p.registration_id WHERE r.event_id=${currentEvent.id} AND p.status='pending'))::int pending_payments`,
    sql`SELECT e.*, (SELECT count(*) FROM registrations r WHERE r.event_id=e.id)::int registration_count FROM events e WHERE e.id<>${currentEvent.id} ORDER BY start_at DESC NULLS LAST`,
    sql`SELECT r.id,r.status,r.created_at,c.first_name,c.last_name,c.phone,c.company,e.name event_name,e.slug,
      COALESCE(pg.status,p.status) payment_status,COALESCE(pg.amount,p.amount) amount,COALESCE(pg.currency,p.currency) currency,
      pg.payment_method,pg.code payment_code,pg.expected_participants,
      p.proof_url legacy_proof_url,pg.proof_url group_proof_url,pg.proof_filename
      FROM registrations r
      JOIN contacts c ON c.id=r.contact_id
      JOIN events e ON e.id=r.event_id
      LEFT JOIN payment_group_registrations pgr ON pgr.registration_id=r.id
      LEFT JOIN payment_groups pg ON pg.id=pgr.payment_group_id
      LEFT JOIN LATERAL (SELECT status,amount,currency,proof_url FROM payments p WHERE p.registration_id=r.id ORDER BY created_at DESC LIMIT 1) p ON true
      WHERE e.slug=${currentSlug}
      ORDER BY r.created_at DESC LIMIT 100`
  ]);
  return { stats: currentStats[0], currentEvent, previousEvents, registrations };
}

export async function getCRM(filters={}) {
  const sql=db();
  const eventSlug=String(filters.eventSlug||'').trim();
  const q=String(filters.q||'').trim();
  const company=String(filters.company||'').trim();
  const registrationStatus=String(filters.registrationStatus||'').trim();
  const paymentStatus=String(filters.paymentStatus||'').trim();
  const paymentMethod=String(filters.paymentMethod||'').trim();
  const page=Math.max(1,Number.parseInt(filters.page||'1',10)||1);
  const limit=Math.min(100,Math.max(10,Number.parseInt(filters.limit||'25',10)||25));
  const offset=(page-1)*limit;
  const likeQ=`%${q}%`;
  const likeCompany=`%${company}%`;

  const baseFrom=sql`FROM registrations r
    JOIN contacts c ON c.id=r.contact_id
    JOIN events e ON e.id=r.event_id
    LEFT JOIN payment_group_registrations pgr ON pgr.registration_id=r.id
    LEFT JOIN payment_groups pg ON pg.id=pgr.payment_group_id
    LEFT JOIN LATERAL (SELECT status,amount,currency,proof_url FROM payments p WHERE p.registration_id=r.id ORDER BY created_at DESC LIMIT 1) p ON true`;

  const [events,rows,totalRows]=await Promise.all([
    sql`SELECT id,name,slug,status,start_at,(SELECT count(*) FROM registrations r WHERE r.event_id=events.id)::int registration_count FROM events ORDER BY start_at DESC NULLS LAST,name`,
    sql`SELECT r.id,r.status,r.created_at,c.first_name,c.last_name,c.phone,c.company,c.email,e.name event_name,e.slug,
      COALESCE(pg.status,p.status) payment_status,COALESCE(pg.amount,p.amount) amount,COALESCE(pg.currency,p.currency) currency,
      pg.payment_method,pg.code payment_code,pg.expected_participants,
      p.proof_url legacy_proof_url,pg.proof_url group_proof_url,pg.proof_filename
      FROM registrations r
      JOIN contacts c ON c.id=r.contact_id
      JOIN events e ON e.id=r.event_id
      LEFT JOIN payment_group_registrations pgr ON pgr.registration_id=r.id
      LEFT JOIN payment_groups pg ON pg.id=pgr.payment_group_id
      LEFT JOIN LATERAL (SELECT status,amount,currency,proof_url FROM payments p WHERE p.registration_id=r.id ORDER BY created_at DESC LIMIT 1) p ON true
      WHERE (${eventSlug}='' OR e.slug=${eventSlug})
        AND (${q}='' OR concat_ws(' ',c.first_name,c.last_name) ILIKE ${likeQ} OR c.phone ILIKE ${likeQ} OR COALESCE(c.company,'') ILIKE ${likeQ} OR COALESCE(c.email,'') ILIKE ${likeQ})
        AND (${company}='' OR COALESCE(c.company,'') ILIKE ${likeCompany})
        AND (${registrationStatus}='' OR r.status=${registrationStatus})
        AND (${paymentStatus}='' OR COALESCE(pg.status,p.status,'')=${paymentStatus})
        AND (${paymentMethod}='' OR COALESCE(pg.payment_method,'')=${paymentMethod})
      ORDER BY r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}`,
    sql`SELECT count(*)::int total
      FROM registrations r
      JOIN contacts c ON c.id=r.contact_id
      JOIN events e ON e.id=r.event_id
      LEFT JOIN payment_group_registrations pgr ON pgr.registration_id=r.id
      LEFT JOIN payment_groups pg ON pg.id=pgr.payment_group_id
      LEFT JOIN LATERAL (SELECT status FROM payments p WHERE p.registration_id=r.id ORDER BY created_at DESC LIMIT 1) p ON true
      WHERE (${eventSlug}='' OR e.slug=${eventSlug})
        AND (${q}='' OR concat_ws(' ',c.first_name,c.last_name) ILIKE ${likeQ} OR c.phone ILIKE ${likeQ} OR COALESCE(c.company,'') ILIKE ${likeQ} OR COALESCE(c.email,'') ILIKE ${likeQ})
        AND (${company}='' OR COALESCE(c.company,'') ILIKE ${likeCompany})
        AND (${registrationStatus}='' OR r.status=${registrationStatus})
        AND (${paymentStatus}='' OR COALESCE(pg.status,p.status,'')=${paymentStatus})
        AND (${paymentMethod}='' OR COALESCE(pg.payment_method,'')=${paymentMethod})`
  ]);

  const total=totalRows[0]?.total||0;
  return {events,rows,total,page,limit,pages:Math.max(1,Math.ceil(total/limit)),filters:{eventSlug,q,company,registrationStatus,paymentStatus,paymentMethod}};
}
