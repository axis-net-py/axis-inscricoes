import {cookies} from 'next/headers';
import ExcelJS from 'exceljs';
import {COOKIE,validSession} from '@/lib/session';
import {getCRMExport} from '@/lib/db';
export const runtime='nodejs';
function statusLabel(value){const map={new:'Novo',confirmed:'Confirmado',pending:'Pendente',cancelled:'Cancelado',published:'Publicado'};return map[value]||value||'—';}
function methodLabel(value){if(value==='transfer')return 'Transferência';if(value==='cash')return 'Dinheiro em espécie';return '—';}
function safeFilenamePart(value){return String(value||'crm').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'crm';}
const COLUMN_DEFINITIONS=[
 {header:'Participante',key:'participant',width:30,value:r=>[r.first_name,r.last_name].filter(Boolean).join(' ')},
 {header:'Telefone',key:'phone',width:20,value:r=>r.phone||'',numFmt:'@'},
 {header:'E-mail',key:'email',width:32,value:r=>r.email||''},
 {header:'Empresa',key:'company',width:26,value:r=>r.company||''},
 {header:'Evento',key:'event',width:34,value:r=>r.event_name||''},
 {header:'Data da inscrição',key:'createdAt',width:20,value:r=>r.created_at?new Date(r.created_at):null,numFmt:'dd/mm/yyyy hh:mm'},
 {header:'Status da inscrição',key:'registrationStatus',width:22,value:r=>statusLabel(r.status)},
 {header:'Método de pagamento',key:'paymentMethod',width:24,value:r=>methodLabel(r.payment_method)},
 {header:'Status do pagamento',key:'paymentStatus',width:22,value:r=>statusLabel(r.payment_status)},
 {header:'Valor',key:'amount',width:15,value:r=>r.amount==null?'':Number(r.amount),numFmt:'#,##0.00'},
 {header:'Moeda',key:'currency',width:12,value:r=>r.currency||''},
 {header:'Código do pagamento',key:'paymentCode',width:24,value:r=>r.payment_code||''},
 {header:'Comprovante',key:'proof',width:34,value:r=>r.proof_filename||(r.group_proof_url||r.legacy_proof_url?'Comprovante disponível':'')}
];
export async function GET(request){
 const jar=await cookies();if(!validSession(jar.get(COOKIE)?.value||''))return new Response('Não autorizado',{status:401});
 const url=new URL(request.url);const eventSlugs=url.searchParams.getAll('events').map(v=>v.trim()).filter(Boolean);if(!eventSlugs.length)return new Response('Nenhum evento selecionado',{status:400});
 const filters={eventSlugs,q:url.searchParams.get('q')||'',company:url.searchParams.get('company')||'',registrationStatus:url.searchParams.get('registrationStatus')||'',paymentStatus:url.searchParams.get('paymentStatus')||'',paymentMethod:url.searchParams.get('paymentMethod')||''};
 const requested=url.searchParams.getAll('columns');const selectedColumns=COLUMN_DEFINITIONS.filter(column=>requested.includes(column.key));if(!selectedColumns.length)return new Response('Nenhuma coluna selecionada',{status:400});
 const rows=await getCRMExport(filters);const workbook=new ExcelJS.Workbook();workbook.creator='AXIS CRM';workbook.created=new Date();const sheet=workbook.addWorksheet('CRM',{views:[{state:'frozen',ySplit:1}]});sheet.columns=selectedColumns.map(({header,key,width})=>({header,key,width}));
 for(const row of rows){const data={};for(const column of selectedColumns)data[column.key]=column.value(row);sheet.addRow(data);}
 const header=sheet.getRow(1);header.height=24;header.font={bold:true,color:{argb:'FFFFFFFF'}};header.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF0E1A33'}};header.alignment={vertical:'middle'};header.eachCell(cell=>{cell.border={bottom:{style:'thin',color:{argb:'FFC9A24B'}}};});
 if(selectedColumns.length)sheet.autoFilter={from:{row:1,column:1},to:{row:1,column:selectedColumns.length}};for(const column of selectedColumns){if(column.numFmt)sheet.getColumn(column.key).numFmt=column.numFmt;}sheet.eachRow((row,rowNumber)=>{if(rowNumber===1)return;row.alignment={vertical:'top'};if(rowNumber%2===0)row.eachCell(cell=>{cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF5F7FA'}};});});
 const buffer=await workbook.xlsx.writeBuffer();const today=new Date().toISOString().slice(0,10);const scope=eventSlugs.length===1?safeFilenamePart(eventSlugs[0]):`${eventSlugs.length}-eventos`;const filename=`axis-crm-${scope}-${today}.xlsx`;return new Response(buffer,{status:200,headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="${filename}"`,'Cache-Control':'no-store'}});
}
