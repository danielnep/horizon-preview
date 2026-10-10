// Teste de composição e eventos em DOM simulado. Não é uma inspeção visual de navegador.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { localDay } from '../dist/core/store.js';
import { TOOL_IDS } from '../dist/core/tools.js';
import { Demonstration } from '../dist/core/demonstration.js';
function harness(){
  const nodes=new Map(),documentHandlers=new Map(),windowHandlers=new Map(),opens=[],downloads=[],snapshots={};
  const url=new URL('https://horizon-preview.danielxavier.chatgpt.site/?parceiro=Michelle#inicio');
  const decode=value=>value.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  const attributes=markup=>Object.fromEntries([...markup.matchAll(/([\w-]+)="([^"]*)"/g)].map(match=>[match[1],decode(match[2])]));
  class Node{
    constructor(id='',tag='div'){this.id=id;this.tag=tag;this.dataset={};this.fields={};this.children=[];this.hidden=false;this.open=false;this.value='';this.textContent='';this.style={};const classes=new Set();this.classList={add:name=>classes.add(name),remove:name=>classes.delete(name),toggle:(name,force)=>{const next=force??!classes.has(name);next?classes.add(name):classes.delete(name);return next;},contains:name=>classes.has(name)};this.handlers={};}
    set innerHTML(value){this._html=value;for(const match of value.matchAll(/<([a-z]+)([^>]*\sid="[^"]+"[^>]*)>/g)){const attrs=attributes(match[2]);const node=nodes.get(attrs.id)||new Node(attrs.id,match[1]);node.value=attrs.value??node.value;node.name=attrs.name||'';node.type=attrs.type||'';node.dataset=Object.fromEntries(Object.entries(attrs).filter(([key])=>key.startsWith('data-')).map(([key,val])=>[key.slice(5),val]));nodes.set(attrs.id,node);} }
    get innerHTML(){return this._html||'';}
    setAttribute(name,value){this[name]=value;}
    addEventListener(kind,handler){this.handlers[kind]=handler;}
    querySelectorAll(){return Object.entries(this.fields).map(([name,value])=>({name,value}));}
    closest(selector){if(selector==='[data-action]')return this.dataset.action?this:null;if(selector.startsWith('a['))return null;if(selector==='#request-form')return this.form?.id==='request-form'?this.form:null;return null;}
    reportValidity(){return true;}focus(){document.activeElement=this;}select(){this.selected=true;}setSelectionRange(){}showModal(){this.open=true;}close(){this.open=false;}append(...items){this.children.push(...items);}remove(){}click(){if(this.download)downloads.push({filename:this.download,blob:blobs.get(this.href)});}getBoundingClientRect(){return {top:0,left:0,right:500,bottom:700};}
  }
  const callbacks=(map,kind,handler)=>{const existing=map.get(kind)||[];existing.push(handler);map.set(kind,existing);};
  globalThis.document={body:new Node('body'),documentElement:{scrollHeight:1400},activeElement:{id:''},getElementById:id=>nodes.get(id)||null,querySelector:selector=>selector==='.custom-nav'?customNav:null,createElement:tag=>new Node('',tag),addEventListener:(kind,handler)=>callbacks(documentHandlers,kind,handler)};
  const customNav=new Node('custom');
  const index=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');new Node().innerHTML=index;
  const memory=new Map();globalThis.window={innerWidth:390,localStorage:{getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)},location:url,scrollTo(){},addEventListener:(kind,handler)=>callbacks(windowHandlers,kind,handler),open:(link)=>opens.push(link)};window.parent=window;
  globalThis.location=url;globalThis.history={replaceState:(state,title,link)=>{const next=new URL(link,url);url.href=next.href;}};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async value=>{navigator.copied=value;}}}});
  globalThis.FormData=class{constructor(form){this.entries=Object.entries(form.fields);}[Symbol.iterator](){return this.entries[Symbol.iterator]();}};
  const blobs=new Map();URL.createObjectURL=blob=>{const key='blob:qa-'+blobs.size;blobs.set(key,blob);return key;};URL.revokeObjectURL=()=>{};
  async function emit(kind,target,extra={}){for(const handler of documentHandlers.get(kind)||[])await handler({target,preventDefault(){},...extra});}
  return {
    opens,downloads,memory,snapshots,nodes,
    html:()=>nodes.get('conteudo').innerHTML,
    modal:()=>nodes.get('modal-content').innerHTML,
    navigate(id){url.hash=id;(windowHandlers.get('hashchange')||[]).forEach(handler=>handler());snapshots[id]=this.html();},
    async click(action,id=''){const button=new Node('', 'button');button.dataset={action,id};await emit('click',button);},
    async change(dataset){const input=new Node('', 'input');input.dataset=dataset;await emit('change',input);},
    async submit(id,fields){const form=nodes.get(id);assert.ok(form,'Formulário existente: '+id);form.fields=fields;await emit('submit',form);},
    async input(id,value){const input=nodes.get(id);input.value=value;await emit('input',input);},
    async toolbar(id){await nodes.get(id).handlers.click({});}
  };
}
test('telas, navegação e eventos executam os fluxos; não inclui layout visual',async()=>{
  const ui=harness();await import('../dist/app.js');
  assert.ok(ui.html().includes('Sua empresa,'));
  assert.ok(ui.html().includes('seu sistema.'));
  assert.equal((ui.html().match(/class="tool-card /g)||[]).length,8);
  for(const id of [...TOOL_IDS,'ferramentas','solucao','personalizada']){ui.navigate(id);assert.ok(ui.html().length>500);assert.ok(!ui.html().includes('undefined'),'Sem campos indefinidos: '+id);}
  ui.navigate('ferramentas');await ui.input('tool-search','checklist');assert.ok(ui.nodes.get('tool-gallery').innerHTML.includes('Inspeções e checklists'));assert.ok(!ui.nodes.get('tool-gallery').innerHTML.includes('Agendamentos e retornos'));await ui.input('tool-search','');
  ui.navigate('planilhas');await ui.submit('record-form',{title:'Registro de UI',owner:'Dani',quantity:'2'});assert.ok(ui.html().includes('Registro de UI'));await ui.click('export-rows');assert.equal(ui.downloads.at(-1).filename,'horizon-planilha-demonstracao.csv');assert.ok((await ui.downloads.at(-1).blob.text()).includes('Registro de UI'));
  ui.navigate('servicos');await ui.click('start-service','srv-101');assert.ok(ui.html().includes('Em andamento'));await ui.click('complete-service','srv-101');assert.ok(ui.html().includes('Concluído'));await ui.click('service-history','srv-101');assert.ok(ui.modal().includes('Revisão do ar-condicionado'));await ui.click('close-modal');
  ui.navigate('checklists');for(const id of ['area','itens','equipamentos','divergencias'])await ui.change({inspection:id});assert.ok(ui.html().includes('100%'));await ui.click('complete-inspection');assert.ok(ui.html().includes('Conferência concluída.'));ui.navigate('planilhas');assert.ok(ui.html().includes('Checklist'));ui.navigate('indicadores');assert.ok(ui.html().includes('Checklist concluído'));await ui.click('export-report');assert.equal(ui.downloads.at(-1).filename,'horizon-relatorio-demonstracao.csv');
  ui.navigate('agendamentos');await ui.submit('appointment-form',{title:'Retorno de UI',owner:'Dani',company:'Empresa teste',date:localDay(),time:'09:00',kind:'Retorno'});assert.ok(ui.html().includes('Retorno de UI'));
  ui.navigate('etapas');await ui.submit('approval-form',{title:'Aprovação de UI',owner:'Lucas'});assert.ok(ui.html().includes('Aprovação de UI'));await ui.click('approval-advance','ap-101');await ui.click('approval-adjust','ap-101');
  ui.navigate('ocorrencias');await ui.submit('incident-form',{title:'Ocorrência de UI',place:'Centro',owner:'Marina',priority:'alta'});assert.ok(ui.html().includes('Ocorrência de UI'));await ui.click('incident-next','oc-101');
  ui.navigate('comprovantes');await ui.submit('proof-form',{serviceId:'srv-104',owner:'Dani',notes:'Registro de execução de UI.'});assert.ok(ui.html().includes('Registro de execução de UI.'));await ui.click('view-proof','cp-101');assert.ok(ui.modal().includes('Manutenção do portão'));await ui.click('download-proof','cp-101');assert.equal(ui.downloads.at(-1).filename,'horizon-comprovante-demonstracao.html');
  ui.navigate('solucao');await ui.click('example-solution');assert.ok(ui.html().includes('Ver demonstração'));assert.ok(!ui.html().includes('Conexão demonstrada.'));await ui.click('launch-demo');ui.navigate('demo-checklists');assert.ok(ui.html().includes('Minha operação'));assert.ok(ui.html().includes('Concluir checklist'));assert.ok(!ui.html().includes('href="#demo-agendamentos"'));assert.ok(ui.nodes.get('navigation').innerHTML.includes('href="#demo-planilhas"'));assert.ok(!ui.nodes.get('navigation').innerHTML.includes('Ocorrências'));for(const id of ['area','itens','equipamentos','divergencias'])await ui.change({inspection:id});await ui.click('complete-inspection');ui.navigate('demo-planilhas');assert.ok(ui.html().includes('Checklist'));await ui.submit('record-form',{title:'Registro no aplicativo montado',owner:'Cliente',quantity:'3'});assert.ok(ui.html().includes('Registro no aplicativo montado'));await ui.click('export-rows');assert.ok((await ui.downloads.at(-1).blob.text()).includes('Registro no aplicativo montado'));ui.navigate('demo-indicadores');assert.ok(ui.html().includes('Checklist concluído'));ui.navigate('solucao');ui.navigate('planilhas');assert.ok(!ui.html().includes('Registro no aplicativo montado'));ui.navigate('demo-planilhas');assert.ok(ui.html().includes('Registro no aplicativo montado'));ui.navigate('solucao');
  ui.navigate('personalizada');const fields={name:'Dani',company:'Empresa & Filhos',role:'Gestor',need:'Preciso acompanhar visitas e fotos.'};await ui.submit('request-form',fields);const url=new URL(ui.opens.at(-1));assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/5537999437884');const message=url.searchParams.get('text');for(const value of Object.values(fields))assert.ok(message.includes(value));assert.ok(message.includes('Indicação: Michelle'));assert.ok(message.includes('Inspeções e checklists'));assert.ok(ui.nodes.get('whatsapp-fallback').innerHTML.includes('Confirme o envio'));assert.ok(!ui.nodes.get('whatsapp-fallback').innerHTML.includes('Mensagem enviada'));
  await ui.toolbar('share-button');await ui.click('copy-link');assert.equal(new URL(navigator.copied).searchParams.get('parceiro'),'Michelle');assert.ok(new URL(navigator.copied).searchParams.get('f').includes('checklists'));
  assert.ok(fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8').includes('Horizon Preview'));
  ui.navigate('inicio');assert.equal((ui.html().match(/data-action="demo-tool"/g)||[]).length,8);
  // Cada exemplo individual permanece funcional, sem expor ferramentas não escolhidas.
  const chosenBefore=JSON.parse(ui.memory.get('horizon-preview:demo:v1')).selected;
  for(const id of TOOL_IDS){
    await ui.click('demo-tool',id);
    assert.ok(ui.html().includes('Veja o exemplo funcionar'));
    const nav=ui.nodes.get('navigation').innerHTML;
    for(const other of TOOL_IDS)assert.equal(nav.includes('href="#demo-'+other+'"'),other===id);
    for(const step of new Demonstration([id]).steps){await ui.click('guide-next');assert.ok(ui.html().includes('guide-result'),'Resultado visível de '+step.action);}
    assert.ok(ui.html().includes('Agora, experimente do seu jeito.'));
    const demo=JSON.parse(ui.memory.get('horizon-preview:demo:v1:solution:v2:'+id));
    if(id==='planilhas')assert.ok(demo.rows.some(row=>row.title==='Conferência da Unidade Norte'));
    if(id==='comprovantes'){assert.ok(ui.html().includes('id="title"'));assert.ok(!ui.html().includes('id="serviceId"'));await ui.submit('proof-form',{title:'Atividade independente',owner:'Marina',notes:'Conferência realizada.'});assert.ok(ui.html().includes('Atividade independente'));}
    assert.ok(!ui.html().includes('Apps Script'));
    ui.navigate('inicio');
  }
  assert.deepEqual(JSON.parse(ui.memory.get('horizon-preview:demo:v1')).selected,chosenBefore);
  ui.navigate('solucao');for(const id of TOOL_IDS.filter(id=>!chosenBefore.includes(id)))await ui.change({select:id});await ui.click('launch-guided');
  for(const step of new Demonstration(TOOL_IDS).steps)await ui.click('guide-next');
  assert.ok(ui.html().includes('Agora, experimente do seu jeito.'));
  ui.navigate('demo-planilhas');assert.ok(ui.html().includes('Conferência da Unidade Norte'));
  await ui.click('export-rows');const integrated=await ui.downloads.at(-1).blob.text();
  for(const type of ['Agendamento','Aprovação','Ocorrência','Comprovante','Checklist'])assert.ok(integrated.includes(type),'Linha conectada: '+type);
  await ui.click('request-workspace');assert.ok(ui.html().includes('id="request-form"'));await ui.submit('request-form',fields);
  const combinedMessage=new URL(ui.opens.at(-1)).searchParams.get('text');for(const id of TOOL_IDS)assert.ok(combinedMessage.includes((await import('../dist/core/tools.js')).TOOL_BY_ID[id].name));
  ui.navigate('automacoes');await ui.submit('ai-form',{text:'Quero agendar uma visita.'});assert.ok(ui.nodes.get('ai-result').innerHTML.includes('Resposta simulada'));
  await ui.click('ai-tab','documentos');await ui.submit('ai-form',{text:'Empresa: Exemplo\nMaterial: Lâmpadas LED\nQuantidade: 12\nResponsável: Lucas'});
  assert.equal(ui.nodes.get('ai-title').value,'Lâmpadas LED');await ui.click('ai-register');assert.ok(ui.html().includes('Lâmpadas LED'));
  ui.navigate('automacoes');await ui.click('ai-tab','sugestao');await ui.submit('ai-form',{text:'Preciso conferir meu estoque e registrar os materiais recebidos.'});assert.ok(ui.nodes.get('ai-result').innerHTML.includes('Planilhas'));await ui.click('apply-ai-tools');assert.ok(ui.html().includes('Montar solução'));
  await ui.click('reset');assert.ok(ui.modal().includes('serão removidos'));await ui.click('confirm-reset');ui.navigate('planilhas');assert.ok(!ui.html().includes('Registro de UI'));
  // Snapshots de HTML para inspeção estrutural; nenhuma imagem estática é entregue.
  for(const id of ['inicio',...TOOL_IDS,'ferramentas','solucao','personalizada','automacoes']){ui.navigate(id);assert.ok(!ui.html().includes('Horizon Demonstração'));assert.ok(!ui.html().includes('guia.html'));}
  const path=process.env.HORIZON_QA_DIR;if(path){fs.mkdirSync(path,{recursive:true});for(const [id,markup] of Object.entries(ui.snapshots))fs.writeFileSync(path+'/'+id+'.html',markup);}
});
