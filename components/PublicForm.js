'use client';
import {useState} from 'react';

function Radios({name,options,required}){return <div className="options">{options.map(o=><label className="option" key={o}><input type="radio" name={name} value={o} required={required}/>{o}</label>)}</div>}
export default function PublicForm({event}){
 const [state,setState]=useState({loading:false,error:'',success:false});
 async function submit(e){e.preventDefault();setState({loading:true,error:'',success:false});const form=new FormData(e.currentTarget); const q=new URLSearchParams(location.search); ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(k=>form.set(k,q.get(k)||'')); form.set('referrer',document.referrer||''); const r=await fetch('/api/register',{method:'POST',body:form}); const data=await r.json().catch(()=>({})); if(!r.ok){setState({loading:false,error:data.error||'No fue posible enviar la inscripción.',success:false});return;} setState({loading:false,error:'',success:true}); e.currentTarget.reset(); window.scrollTo({top:0,behavior:'smooth'});}
 if(state.success)return <div className="card"><h2>Inscripción recibida</h2><p>{event.confirmation_message}</p></div>;
 const fields=event.fields;
 return <form className="card" onSubmit={submit} encType="multipart/form-data">
   <input type="hidden" name="eventSlug" value={event.slug}/>
   {fields.map(f=>{
     const opts=Array.isArray(f.options)?f.options:[];
     if(f.field_key==='full_name') return <div className="grid" key={f.id}><div className="field"><label>Nombre *</label><input name="firstName" required/></div><div className="field"><label>Apellido *</label><input name="lastName" required/></div></div>;
     if(f.field_key==='company') return <div className="field" key={f.id}><label>{f.label_es} *</label><input name="company" required/></div>;
     if(f.field_key==='role_title') return <div className="field" key={f.id}><label>{f.label_es} *</label><input name="roleTitle" required/></div>;
     if(f.field_key==='phone') return <div className="field" key={f.id}><label>{f.label_es} *</label><input name="phone" type="tel" placeholder="+595 981 123456" required/><small className="muted">{f.help_text_es}</small></div>;
     if(f.field_key==='expectation') return <div className="field" key={f.id}><label>{f.label_es}</label><textarea name="expectation"/></div>;
     if(f.field_key==='discovery_source') return <div className="field" key={f.id}><span className="label">{f.label_es} *</span><Radios name="discoverySource" options={opts} required/><input name="discoverySourceOther" placeholder="Otro — especifica aquí"/></div>;
     if(f.field_key==='accessibility') return <div className="field" key={f.id}><span className="label">{f.label_es} *</span><Radios name="accessibility" options={opts} required/><textarea name="accessibilityDetails" placeholder="Si respondiste Sí, detalla aquí"/></div>;
     if(f.field_key==='dietary_restriction') return <div className="field" key={f.id}><span className="label">{f.label_es} *</span><Radios name="dietaryRestriction" options={opts} required/><input name="dietaryRestrictionOther" placeholder="Otro — especifica aquí"/></div>;
     if(f.field_key==='payment_proof') return <div className="field" key={f.id}><label>{f.label_es} *</label><input name="paymentProof" type="file" accept="image/*,.pdf" required/></div>;
     if(f.field_key==='terms') return <div className="field" key={f.id}><label className="option"><input type="checkbox" name="termsAccepted" required/> {f.help_text_es}</label></div>;
     return null;
   })}
   {state.error&&<div className="notice error">{state.error}</div>}
   <button className="button" disabled={state.loading}>{state.loading?'Enviando…':'Enviar inscripción'}</button>
 </form>
}
