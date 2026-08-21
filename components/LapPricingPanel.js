'use client';
import {useEffect,useState} from 'react';

export default function LapPricingPanel({placement='mobile'}){
 const [lang,setLang]=useState('es');
 useEffect(()=>{
   const read=()=>{const saved=localStorage.getItem('axis-lang');setLang(saved==='pt'?'pt':'es')};
   read();
   const onLang=e=>setLang(e.detail==='pt'?'pt':'es');
   window.addEventListener('axis-language-change',onLang);
   window.addEventListener('storage',read);
   return()=>{window.removeEventListener('axis-language-change',onLang);window.removeEventListener('storage',read)};
 },[]);
 const pt=lang==='pt';
 return <section className={`lap-pricing-panel lap-pricing-${placement}`}><div className="lap-pricing-head"><span className="kicker gold">{pt?'PLANOS ESPECIAIS':'PLANES ESPECIALES'}</span><h3>{pt?'Tabela de investimento corporativo':'Tabla de inversión corporativa'}</h3><p>{pt?'Valores especiais para casais e grupos da mesma empresa.':'Valores especiales para parejas y grupos de la misma empresa.'}</p></div><div className="lap-pricing-table-wrap"><table className="lap-pricing-table"><thead><tr><th>{pt?'Categoria':'Categoría'}</th><th>{pt?'Desconto':'Descuento'}</th><th>{pt?'Valor final':'Valor final'}</th></tr></thead><tbody><tr><td>{pt?'1 pessoa':'1 persona'}</td><td>—</td><td><strong>USD $350</strong></td></tr><tr><td>3 colaboradores<small>{pt?'Mesma empresa':'Misma empresa'}</small></td><td>USD $15</td><td><strong>USD $335</strong><small>{pt?'por pessoa':'por persona'}</small></td></tr><tr><td>4 a 5 colaboradores<small>{pt?'Mesma empresa':'Misma empresa'}</small></td><td>USD $25</td><td><strong>USD $325</strong><small>{pt?'por pessoa':'por persona'}</small></td></tr><tr><td>{pt?'6 ou mais colaboradores':'6 o más colaboradores'}<small>{pt?'Mesma empresa':'Misma empresa'}</small></td><td>USD $35</td><td><strong>USD $315</strong><small>{pt?'por pessoa':'por persona'}</small></td></tr><tr className="lap-pricing-couple"><td>{pt?'Casal':'Pareja'}</td><td>USD $35</td><td><strong>USD $315</strong><small>{pt?'por pessoa':'por persona'}</small></td></tr></tbody></table></div><div className="lap-pricing-highlight"><span>👫</span><div><small>{pt?'VALOR PARA CASAIS':'VALOR PARA PAREJAS'}</small><strong>2 × USD $315 = USD $630</strong><p>{pt?'Benefício exclusivo de USD $35 de desconto por participante.':'Beneficio exclusivo de USD $35 de descuento por participante.'}</p></div></div></section>
}
