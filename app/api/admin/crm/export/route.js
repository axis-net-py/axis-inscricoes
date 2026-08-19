import {cookies} from 'next/headers';
import ExcelJS from 'exceljs';
import {COOKIE,validSession} from '@/lib/session';
import {getCRMExport} from '@/lib/db';

export const runtime='nodejs';

function statusLabel(value){
  const map={new:'Novo',confirmed:'Confirmado',pending:'Pendente',cancelled:'Cancelado',published:'Publicado'};
  return map[value]||value||'—';
}

function methodLabel(value){
  if(value==='transfer')return 'Transferência';
  if(value==='cash')return 'Dinheiro em espécie';
  return '—';
}

function safeFilenamePart(value){
  return String(value||'crm').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'crm';
}

export async function GET(request){
  const jar=await cookies();
  if(!validSession(jar.get(COOKIE)?.value||'')){
    return new Response('Não autorizado',{status:401});
  }

  const url=new URL(request.url);
  const filters={
    eventSlug:url.searchParams.get('event')||'',
    q:url.searchParams.get('q')||'',
    company:url.searchParams.get('company')||'',
    registrationStatus:url.searchParams.get('registrationStatus')||'',
    paymentStatus:url.searchParams.get('paymentStatus')||'',
    paymentMethod:url.searchParams.get('paymentMethod')||''
  };
  const rows=await getCRMExport(filters);

  const workbook=new ExcelJS.Workbook();
  workbook.creator='AXIS CRM';
  workbook.created=new Date();
  const sheet=workbook.addWorksheet('CRM',{views:[{state:'frozen',ySplit:1}]});
  sheet.columns=[
    {header:'Participante',key:'participant',width:30},
    {header:'Telefone',key:'phone',width:20},
    {header:'E-mail',key:'email',width:32},
    {header:'Empresa',key:'company',width:26},
    {header:'Evento',key:'event',width:34},
    {header:'Data da inscrição',key:'createdAt',width:20},
    {header:'Status da inscrição',key:'registrationStatus',width:22},
    {header:'Método de pagamento',key:'paymentMethod',width:24},
    {header:'Status do pagamento',key:'paymentStatus',width:22},
    {header:'Valor',key:'amount',width:15},
    {header:'Moeda',key:'currency',width:12},
    {header:'Código do pagamento',key:'paymentCode',width:24},
    {header:'Comprovante',key:'proof',width:34}
  ];

  for(const row of rows){
    sheet.addRow({
      participant:[row.first_name,row.last_name].filter(Boolean).join(' '),
      phone:row.phone||'',
      email:row.email||'',
      company:row.company||'',
      event:row.event_name||'',
      createdAt:row.created_at?new Date(row.created_at):null,
      registrationStatus:statusLabel(row.status),
      paymentMethod:methodLabel(row.payment_method),
      paymentStatus:statusLabel(row.payment_status),
      amount:row.amount===null||row.amount===undefined?'':Number(row.amount),
      currency:row.currency||'',
      paymentCode:row.payment_code||'',
      proof:row.proof_filename||(row.group_proof_url||row.legacy_proof_url?'Comprovante disponível':'')
    });
  }

  const header=sheet.getRow(1);
  header.height=24;
  header.font={bold:true,color:{argb:'FFFFFFFF'}};
  header.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF0E1A33'}};
  header.alignment={vertical:'middle'};
  header.eachCell(cell=>{cell.border={bottom:{style:'thin',color:{argb:'FFC9A24B'}}};});
  sheet.autoFilter={from:'A1',to:'M1'};
  sheet.getColumn('phone').numFmt='@';
  sheet.getColumn('createdAt').numFmt='dd/mm/yyyy hh:mm';
  sheet.getColumn('amount').numFmt='#,##0.00';
  sheet.eachRow((row,rowNumber)=>{
    if(rowNumber===1)return;
    row.alignment={vertical:'top'};
    if(rowNumber%2===0){
      row.eachCell(cell=>{cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF5F7FA'}};});
    }
  });

  const buffer=await workbook.xlsx.writeBuffer();
  const today=new Date().toISOString().slice(0,10);
  const scope=filters.eventSlug?safeFilenamePart(filters.eventSlug):'todos-eventos';
  const filename=`axis-crm-${scope}-${today}.xlsx`;

  return new Response(buffer,{
    status:200,
    headers:{
      'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':`attachment; filename="${filename}"`,
      'Cache-Control':'no-store'
    }
  });
}
