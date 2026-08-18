export function normalizePaymentCode(value=''){
  return String(value).trim().toUpperCase().replace(/\s+/g,'');
}

export function validatePaymentInput(input={}){
  const errors={};
  const paymentMethod=String(input.paymentMethod||'').trim();
  const paymentScope=String(input.paymentScope||'').trim();
  const paymentCode=normalizePaymentCode(input.paymentCode||'');
  if(!['cash','transfer'].includes(paymentMethod)) errors.paymentMethod='required';
  if(!['individual','group'].includes(paymentScope)) errors.paymentScope='required';
  const joiningExisting=paymentScope==='group' && Boolean(paymentCode);
  if(paymentScope==='group' && !joiningExisting){
    if(!String(input.payerCompany||'').trim()) errors.payerCompany='required';
    const count=Number.parseInt(String(input.expectedParticipants||''),10);
    if(!Number.isInteger(count)||count<2) errors.expectedParticipants='required';
  }
  return {valid:Object.keys(errors).length===0,errors,paymentMethod,paymentScope,paymentCode,joiningExisting,requiresProof:paymentMethod==='transfer'&&!joiningExisting};
}
