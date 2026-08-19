import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {COOKIE,validSession} from '@/lib/session';
import {getDashboard} from '@/lib/db';

function PaymentCell({r}){
  const method=r.payment_method==='cash'?'Dinheiro em espécie':r.payment_method==='transfer'?'Transferência':'—';
  const hasProof=Boolean(r.group_proof_url||r.legacy_proof_url);
  return <div className="admin-payment"><strong>{r.payment_status||'—'}</strong><span>{method}{r.payment_code?` · ${r.payment_code}`:''}</span>{r.expected_participants>1&&<small>{r.expected_participants} participantes</small>}{hasProof?<a className="proof-link" href={`/api/admin/proof?registrationId=${encodeURIComponent(r.id)}`} target="_blank" rel="noopener noreferrer">Ver comprovante ↗</a>:r.payment_method==='cash'?<small>Comprovante não aplicável</small>:null}</div>
}

export default async function Admin(){
  const jar=await cookies();
  if(!validSession(jar.get(COOKIE)?.value||''))redirect('/admin/login');
  const d=await getDashboard('lap18');
  return <div className="admin-shell">
    <header className="admin-top"><div className="admin-wrap admin-top-inner"><div><span className="admin-kicker">GESTÃO DE ALTA PERFORMANCE</span><div className="admin-brand">AXIS <span>CRM</span></div></div><nav className="adminnav"><a href="/admin">Dashboard</a><a href="/lap18" target="_blank">Ver LAP 18</a><form method="post" action="/api/admin/logout"><button className="admin-logout">Sair</button></form></nav></div></header>
    <main className="admin-wrap admin-main">
      <section className="admin-hero"><div className="admin-hero-copy"><span className="admin-kicker">PAINEL ADMINISTRATIVO</span><h1>Método LAP 18 <em>Liderança em Alta Performance</em></h1><p>Inscrições, pagamentos e operação do evento atual em uma única visão.</p></div><div className="admin-event-status"><span>EVENTO ATUAL</span><strong>{d.currentEvent?.status==='PUBLISHED'?'Publicado':d.currentEvent?.status||'—'}</strong></div></section>

      <section className="admin-stats">
        <article className="admin-stat-card"><span>Inscrições</span><strong>{d.stats.registrations}</strong><small>evento atual</small></article>
        <article className="admin-stat-card"><span>Contatos</span><strong>{d.stats.contacts}</strong><small>participantes únicos</small></article>
        <article className="admin-stat-card"><span>Pagamentos confirmados</span><strong>{d.stats.confirmed_payments}</strong><small>evento atual</small></article>
        <article className="admin-stat-card admin-stat-attention"><span>Pagamentos pendentes</span><strong>{d.stats.pending_payments}</strong><small>aguardando validação</small></article>
      </section>

      <section className="admin-panel"><div className="admin-panel-head"><div><span className="admin-kicker">LAP 18</span><h2>Inscrições <em>do evento atual</em></h2></div><span className="admin-count">{d.registrations.length} registro{d.registrations.length===1?'':'s'}</span></div>
        {d.registrations.length?<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Participante</th><th>Empresa</th><th>Status</th><th>Pagamento</th></tr></thead><tbody>{d.registrations.map(r=><tr key={r.id}><td><strong>{r.first_name} {r.last_name}</strong><small>{r.phone}</small></td><td>{r.company||'—'}</td><td><span className={`admin-pill admin-pill-${r.status||'new'}`}>{r.status||'new'}</span></td><td><PaymentCell r={r}/></td></tr>)}</tbody></table></div>:<div className="admin-empty"><strong>Nenhuma inscrição registrada até o momento.</strong><span>Novos participantes aparecerão aqui automaticamente.</span></div>}
      </section>

      <details className="admin-archive"><summary><span><strong>Eventos <em>anteriores</em></strong><small>Histórico preservado e recolhido para manter o foco no LAP 18.</small></span><span className="admin-archive-count">{d.previousEvents.length}</span></summary><div className="admin-archive-body">{d.previousEvents.length?<table className="admin-table"><thead><tr><th>Evento</th><th>Status</th><th>Inscrições</th><th>Link</th></tr></thead><tbody>{d.previousEvents.map(e=><tr key={e.id}><td><strong>{e.name}</strong></td><td><span className="admin-pill">{e.status}</span></td><td>{e.registration_count}</td><td><a href={`/${e.slug}`} target="_blank">/{e.slug}</a></td></tr>)}</tbody></table>:<div className="admin-empty"><span>Nenhum evento anterior cadastrado.</span></div>}</div></details>
    </main>
  </div>
}
