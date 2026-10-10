import test from 'node:test';
import assert from 'node:assert/strict';
import { DemoStore, toolStats } from '../dist/core/store.js';
import { Demonstration } from '../dist/core/demonstration.js';
import { TOOL_IDS } from '../dist/core/tools.js';
import { suggestTools, readDocument, answerMessage } from '../dist/core/assistants.js';

const now=()=>new Date('2026-10-10T12:00:00Z');

test('as 255 combinações executam a demonstração com os dados das ferramentas escolhidas',()=>{
  for(let mask=1;mask<256;mask++){
    const tools=TOOL_IDS.filter((_,index)=>mask&(1<<index));
    const store=new DemoStore({tools,now});
    const demo=new Demonstration(tools);
    for(const step of demo.steps){
      assert.ok(tools.includes(step.tool));
      const result=demo.run(store);
      assert.equal(result.tool,step.tool);
      assert.ok(result.result.length>0);
    }
    assert.equal(demo.finished,true);
    assert.equal(demo.run(store),null);
    if(tools.length===1&&tools[0]==='indicadores')continue;
    for(const [tool,collection] of Object.entries({servicos:'services',agendamentos:'appointments',etapas:'approvals',ocorrencias:'incidents',comprovantes:'proofs',planilhas:'rows',checklists:'inspections'})){
      if(!tools.includes(tool))assert.equal(store.state[collection].length,0,'Não ativada: '+tool+' na combinação '+tools.join(','));
      else assert.ok(store.state[collection].length>0);
    }
    if(tools.includes('planilhas'))assert.ok(store.state.rows.some(item=>item.title===demo.title));
    if(tools.includes('checklists')&&tools.includes('servicos')){
      assert.equal(store.state.inspections[0].serviceId,demo.ids.service);
      assert.equal(store.state.services.find(item=>item.id===demo.ids.service).status,'concluido');
    }
    if(tools.includes('comprovantes')&&tools.includes('servicos'))assert.equal(store.state.proofs[0].serviceId,demo.ids.service);
  }
});

test('agenda, aprovações e ocorrências atualizam a mesma linha de planilha sem duplicar',()=>{
  const store=new DemoStore({tools:['agendamentos','etapas','ocorrencias','planilhas','indicadores'],now});
  const appointment=store.addAppointment({title:'Visita',company:'Norte',owner:'Lucas',date:'2026-10-10',time:'14:30'});
  store.appointmentAction(appointment.id,'concluir');
  const approval=store.addApproval({title:'Compra',owner:'Lucas'});store.approvalAction(approval.id,'avancar');store.approvalAction(approval.id,'avancar');
  const incident=store.addIncident({title:'Falha',owner:'Lucas',place:'Norte'});store.incidentAction(incident.id);store.incidentAction(incident.id);
  for(const [record,status] of [[appointment,'concluido'],[approval,'concluido'],[incident,'resolvido']]){
    const matches=store.state.rows.filter(row=>row.id===record.id);assert.equal(matches.length,1);assert.equal(matches[0].status,status);
  }
  assert.equal(toolStats(store.state).services,0);
  assert.throws(()=>store.addService({title:'Não selecionado',owner:'X',client:'Y'}));
});

test('comprovante e checklist funcionam sozinhos e após restauração',()=>{
  const store=new DemoStore({tools:['checklists','comprovantes'],now});
  store.state.inspection.items.forEach(item=>store.toggleInspectionItem(item.id));store.completeInspection();
  store.addProof({title:'Conferência independente',owner:'Lucas',notes:'Execução conferida.'});
  assert.equal(store.state.services.length,0);assert.equal(store.state.rows.length,0);
  assert.equal(store.state.proofs[0].title,'Conferência independente');
  store.reset();store.newInspection();assert.equal(store.state.services.length,0);
});

test('simuladores de IA usam os nomes atuais e permitem confirmar a extração',()=>{
  assert.deepEqual(readDocument('Empresa: Norte\nMaterial: Lâmpadas\nQuantidade: 12\nResponsável: Lucas'),{company:'Norte',title:'Lâmpadas',quantity:'12',owner:'Lucas'});
  const suggestion=suggestTools('Estoque manual de materiais');assert.ok(suggestion.tools.includes('planilhas'));assert.ok(suggestion.tools.every(id=>TOOL_IDS.includes(id)));
  assert.equal(suggestTools('abcdef').tools.length,0);
  assert.ok(answerMessage('Quero agendar uma visita').includes('data desejada'));
});
