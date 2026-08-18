const COPY={
 es:{form:'Formulario de inscripción',trainingInfo:'Información del entrenamiento',schedule:'Horario',location:'Ubicación',investment:'Inversión',bank:'Datos para transferencia',bankName:'Banco',accountType:'Tipo de cuenta',accountPYG:'Cuenta PYG',accountUSD:'Cuenta USD',holder:'Titular',identification:'Identificación',firstName:'Nombre',lastName:'Apellido',other:'Otro — especifica aquí',accessibilityDetails:'Si respondiste Sí, detalla aquí',submit:'Enviar inscripción',sending:'Enviando…',success:'Inscripción recibida',error:'No fue posible enviar la inscripción.',days:'15, 16 y 17 de septiembre de 2026',edition:'Edición 18 · Saltos del Guairá'},
 pt:{form:'Formulário de inscrição',trainingInfo:'Informações do treinamento',schedule:'Horário',location:'Localização',investment:'Investimento',bank:'Dados para transferência',bankName:'Banco',accountType:'Tipo de conta',accountPYG:'Conta PYG',accountUSD:'Conta USD',holder:'Titular',identification:'Identificação',firstName:'Nome',lastName:'Sobrenome',other:'Outro — especifique aqui',accessibilityDetails:'Se respondeu Sim, detalhe aqui',submit:'Enviar inscrição',sending:'Enviando…',success:'Inscrição recebida',error:'Não foi possível enviar a inscrição.',days:'15, 16 e 17 de setembro de 2026',edition:'Edição 18 · Saltos del Guairá'}
};
const PT_HELP_FALLBACK={phone:'Inclua o código do país. Ex.: +595 ou +55'};
export function copyFor(lang){return COPY[lang==='pt'?'pt':'es']}
export function fieldText(field,lang){
 const l=lang==='pt'?'pt':'es';
 const label=field[`label_${l}`]||field.label_es||'';
 const help=l==='pt'?(field.help_text_pt||PT_HELP_FALLBACK[field.field_key]||''):(field.help_text_es||'');
 return {label,help};
}
