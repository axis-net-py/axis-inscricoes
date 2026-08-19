import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {COOKIE,validSession} from '@/lib/session';
import {getCRM} from '@/lib/db';

function qp(params,overrides={}){
  const out=new URLSearchParams();
  for(const [key,value] of Object.entries({...params,...overrides})){
    if(value!==undefined&&value!==null&&String(value)!=='')out.set(key,String(value));
  }
  return out.toString();
}

function PaymentCell({r}){
  const method=r.payment_method==='cash'?'Dinheiro em espécie':r.payment_method==='transfer'?'Transferência':'—';
  const hasProof=Boolean(r.group_proof_url||r.legacy_proof_url);
  return <div className="admin-payment"><strong>{r.payment_status||'—'}</strong><span>{method}{r.payment_code?` · ${r.payment_code}`:''}</span>{hasProof&&<a className="proof-link" href={`/api/admin/proof?registrationId=${encodeURIComponent(r.id)}`} target="_blank" rel="noopener noreferrer">Ver comprovante ↗</a>}</div>;
}

export default async function CRM({searchParams}){
  const jar=await cookies();
  if(!validSession(jar.get(COOKIE)?.value||''))redirect('/admin/login');
  const raw=await searchParams;
  const params={
    event:String(raw?.event||''),q:String(raw?.q||''),company:String(raw?.company||''),
    registrationStatus:String(raw?.registrationStatus||''),paymentStatus:String(raw?.paymentStatus||''),
    paymentMethod:String(raw?.paymentMethod||''),page:String(raw?.page||'1')
  };
  const d=await getCRM({eventSlug:params.event,q:params.q,company:params.company,registrationStatus:params.registrationStatus,paymentStatus:params.paymentStatus,paymentMethod:params.paymentMethod,page:params.page,limit:25});
  const filtered=Boolean(params.event||params.q||params.company||params.registrationStatus||params.paymentStatus||params.paymentMethod);
  const exportQuery=qp(params,{page:undefined});

  return <div className="admin-shell">
    <header className="admin-top"><div className="admin-wrap admin-top-inner"><div><span className="admin-kicker">GESTÃO DE ALTA PERFORMANCE</span><div className="admin-brand">AXIS <span>CRM</span></div></div><nav className="adminnav"><a href="/admin">Dashboard</a><a className="active" href="/admin/crm">CRM</a><a href="/lap18" target="_blank">Ver LAP 18</a><form method="post" action="/api/admin/logout"><button className="admin-logout">Sair</button></form></nav></div></header>
    <main className="admin-wrap admin-main">
      <section className="admin-crm-head"><div><span className="admin-kicker">BASE DE RELACIONAMENTO</span><h1>Inscritos <em>e contatos</em></h1><p>Consulte participantes de todos os eventos, refine a base e acesse pagamentos e comprovantes sem perder o contexto histórico.</p></div><div className="admin-crm-head-actions"><div className="admin-crm-total"><strong>{d.total}</strong><span>resultados</span></div><a className="admin-export-xlsx" href={`/api/admin/crm/export?${exportQuery}`}>Exportar planilha</a></div></section>

      <section className="admin-filter-panel">
        <form method="get" className="admin-filters">
          <label className="admin-filter-wide"><span>Buscar</span><input name="q" defaultValue={params.q} placeholder="Nome, telefone, e-mail ou empresa"/></label>
          <label><span>Evento</span><select name="event" defaultValue={params.event}><option value="">Todos os eventos</option>{d.events.map(e=><option key={e.id} value={e.slug}>{e.name} ({e.registration_count})</option>)}</select></label>
          <label><span>Empresa</span><input name="company" defaultValue={params.company} placeholder="Empresa"/></label>
          <label><span>Status inscrição</span><select name="registrationStatus" defaultValue={params.registrationStatus}><option value="">Todos</option><option value="new">Novo</option><option value="confirmed">Confirmado</option><option value="cancelled">Cancelado</option></select></label>
          <label><span>Status pagamento</span><select name="paymentStatus" defaultValue={params.paymentStatus}><option value="">Todos</option><option value="pending">Pendente</option><option value="confirmed">Confirmado</option><option value="cancelled">Cancelado</option></select></label>
          <label><span>Método</span><select name="paymentMethod" defaultValue={params.paymentMethod}><option value="">Todos</option><option value="transfer">Transferência</option><option value="cash">Dinheiro</option></select></label>
          <div className="admin-filter-actions"><button className="admin-filter-submit" type="submit">Aplicar filtros</button>{filtered&&<a className="admin-filter-clear" href="/admin/crm">Limpar</a>}</div>
        </form>
      </section>

      <section className="admin-panel admin-crm-panel"><div className="admin-panel-head"><div><span className="admin-kicker">CRM</span><h2>{params.event?'Base filtrada':'Base completa'} <em>{d.total} resultados</em></h2></div><span className="admin-count">Página {d.page} de {d.pages}</span></div>
        {d.rows.length?<div className="admin-table-wrap"><table className="admin-table admin-crm-table"><thead><tr><th>Participante</th><th>Evento</th><th>Empresa</th><th>Inscrição</th><th>Pagamento</th></tr></thead><tbody>{d.rows.map(r=><tr key={r.id}><td><strong>{r.first_name} {r.last_name}</strong><small>{r.phone}{r.email?` · ${r.email}`:''}</small></td><td><strong>{r.event_name}</strong><small>{new Date(r.created_at).toLocaleDateString('pt-BR')}</small></td><td>{r.company||'—'}</td><td><span className={`admin-pill admin-pill-${r.status||'new'}`}>{r.status||'new'}</span></td><td><PaymentCell r={r}/></td></tr>)}</tbody></table></div>:<div className="admin-empty"><strong>Nenhum registro encontrado.</strong><span>Ajuste ou limpe os filtros para consultar outra parte da base.</span></div>}
        {d.pages>1&&<nav className="admin-pagination" aria-label="Paginação do CRM">{d.page>1?<a href={`/admin/crm?${qp(params,{page:d.page-1})}`}>← Anterior</a>:<span/>}<span>Página <strong>{d.page}</strong> de {d.pages}</span>{d.page<d.pages?<a href={`/admin/crm?${qp(params,{page:d.page+1})}`}>Próxima →</a>:<span/>}</nav>}
      </section>
    </main>
  </div>;
}
