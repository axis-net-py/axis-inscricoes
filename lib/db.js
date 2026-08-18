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

export async function getDashboard() {
  const sql = db();
  const [stats, events, registrations] = await Promise.all([
    sql`SELECT (SELECT count(*) FROM contacts)::int contacts,(SELECT count(*) FROM events)::int events,(SELECT count(*) FROM registrations)::int registrations,(SELECT count(*) FROM payments WHERE status='confirmed')::int confirmed_payments`,
    sql`SELECT e.*, (SELECT count(*) FROM registrations r WHERE r.event_id=e.id)::int registration_count FROM events e ORDER BY start_at DESC NULLS LAST`,
    sql`SELECT r.id,r.status,r.created_at,c.first_name,c.last_name,c.phone,c.company,e.name event_name,e.slug,p.status payment_status,p.amount,p.currency FROM registrations r JOIN contacts c ON c.id=r.contact_id JOIN events e ON e.id=r.event_id LEFT JOIN LATERAL (SELECT status,amount,currency FROM payments p WHERE p.registration_id=r.id ORDER BY created_at DESC LIMIT 1) p ON true ORDER BY r.created_at DESC LIMIT 100`
  ]);
  return { stats: stats[0], events, registrations };
}
