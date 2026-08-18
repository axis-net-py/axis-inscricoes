export function normalizePhone(value=''){
  const raw=String(value).trim();
  const digits=raw.replace(/\D/g,'');
  return raw.startsWith('+')?`+${digits}`:digits;
}

export function validateRegistration(input={}){
  const errors={};
  const required=['firstName','lastName','company','roleTitle','phone','discoverySource','accessibility','dietaryRestriction'];
  for(const key of required){if(!String(input[key]||'').trim())errors[key]='required';}
  const phone=normalizePhone(input.phone||'');
  if(phone.replace(/\D/g,'').length<8)errors.phone='invalid';
  const accepted=input.termsAccepted===true||input.termsAccepted==='true'||input.termsAccepted==='on';
  if(!accepted)errors.termsAccepted='required';
  return {valid:Object.keys(errors).length===0,errors,phone};
}
