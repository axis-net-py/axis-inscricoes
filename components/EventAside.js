'use client';
import {useEffect,useState} from 'react';
import LapPricingPanel from '@/components/LapPricingPanel';

export default function EventAside({event,mapUrl,lap=false}){
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
 return <aside className="event-aside">
   <section className="info-panel">
     <span className="kicker">{pt?'EXPERIÊNCIA LAP':'EXPERIENCIA LAP'}</span>
     <h2>{pt?'Informações do':'Información del'} <em>{pt?'treinamento':'entrenamiento'}</em></h2>
     <p className="intro">{pt?'Imersão presencial intensiva de liderança, perfil DISC, comunicação e inteligência emocional.':'Inmersión presencial intensiva de liderazgo, perfil DISC, comunicación e inteligencia emocional.'}</p>
     <div className="detail"><span className="detail-icon">◷</span><div><small>{pt?'HORÁRIO':'HORARIO'}</small><strong>19:00 a 23:00</strong></div></div>
     <div className="detail"><span className="detail-icon">⌖</span><div><small>{pt?'LOCALIZAÇÃO':'UBICACIÓN'}</small><strong>{event.venue_name}</strong><p>{event.venue_address}</p>{mapUrl&&<a className="map-link" href={mapUrl} target="_blank" rel="noopener noreferrer">{pt?'Abrir no Google Maps →':'Abrir en Google Maps →'}</a>}</div></div>
     <div className="investment"><small>{pt?'INVESTIMENTO':'INVERSIÓN'}</small><strong>{Number(event.amount_primary).toLocaleString('es-PY')} {event.currency_primary}</strong><span>{pt?'ou':'o'} <em>{Number(event.amount_secondary).toLocaleString('en-US')} {event.currency_secondary}</em></span></div>
     {lap&&<LapPricingPanel placement="desktop"/>}
   </section>
   <section className="bank-panel bank-panel-compact">
     <span className="kicker gold">{pt?'PAGAMENTO POR TRANSFERÊNCIA':'PAGO POR TRANSFERENCIA'}</span>
     <h3>{pt?'Transferência':'Transferencia'} <em>{pt?'bancária':'bancaria'}</em></h3>
     <p>{pt?'Ao escolher transferência no formulário, você verá os dados bancários oficiais e poderá anexar seu comprovante em imagem ou PDF.':'Al elegir transferencia en el formulario, verás los datos bancarios oficiales y podrás adjuntar tu comprobante en imagen o PDF.'}</p>
     <span className="bank-hint">{pt?'Os dados são exibidos no momento do pagamento':'Los datos se muestran en el momento del pago'}</span>
   </section>
 </aside>;
}
