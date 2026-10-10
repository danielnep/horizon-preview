/** Horizon — conexão explícita com Google Sheets. Instale na sua conta Google. */
const HORIZON_SHEETS = {
  spreadsheetId: 'COLE_O_ID_DA_SUA_PLANILHA',
  sheetName: 'Registros_Horizon',
  allowedOrigins: ['https://horizon-preview.danielxavier.chatgpt.site'],
  allowRealRecords: false // Primeiro valide o teste. Ative somente na solução real.
};

function doGet() {
  return HtmlService.createHtmlOutput('<p>Conexão Horizon. Os registros são recebidos por POST.</p>');
}

function doPost(e) {
  let payload, lock;
  try {
    const raw = e && e.parameter && e.parameter.payload;
    if (!raw || raw.length > 16000) throw new Error('Registro ausente ou grande demais.');
    payload = JSON.parse(raw);
    if (HORIZON_SHEETS.allowedOrigins.indexOf(payload.origin) < 0) throw new Error('Origem não configurada.');
    if (!/^[a-zA-Z0-9-]{12,80}$/.test(payload.requestId || '')) throw new Error('Solicitação inválida.');
    const record = payload.record || {};
    if (!/^[a-zA-Z0-9-]{8,100}$/.test(record.id || '')) throw new Error('Identificador inválido.');
    if (['teste','real'].indexOf(record.kind) < 0) throw new Error('Tipo de registro inválido.');
    if (record.kind === 'real' && !HORIZON_SHEETS.allowRealRecords) throw new Error('O recebimento de registros reais ainda está desativado.');
    if (!record.title || !record.owner) throw new Error('Título e responsável são obrigatórios.');
    if (!Number.isInteger(Number(record.quantity)) || Number(record.quantity) < 1 || Number(record.quantity) > 999999) throw new Error('Quantidade inválida.');
    if (HORIZON_SHEETS.spreadsheetId === 'COLE_O_ID_DA_SUA_PLANILHA') throw new Error('Configure o ID da planilha no Apps Script.');
    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    const spreadsheet = SpreadsheetApp.openById(HORIZON_SHEETS.spreadsheetId);
    const name = record.kind === 'teste' ? 'Teste_Horizon' : HORIZON_SHEETS.sheetName;
    const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
    if (!sheet.getLastRow()) sheet.appendRow(['ID','Tipo','Registro','Responsável','Quantidade','Observações','Atualizado em']);
    const row = [record.id,record.kind,safeCell(record.title,200),safeCell(record.owner,100),Number(record.quantity),safeCell(record.notes || '',1800),new Date()];
    const found = sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(record.id).matchEntireCell(true).findNext() : null;
    if (found) sheet.getRange(found.getRow(),1,1,row.length).setValues([row]);
    else sheet.appendRow(row);
    SpreadsheetApp.flush();
    return horizonReply(payload,{ok:true,recordId:record.id,message:'Gravação confirmada.'});
  } catch (error) {
    return horizonReply(payload,{ok:false,message:String(error.message || 'Falha ao gravar.').slice(0,240)});
  } finally {
    if (lock) lock.releaseLock();
  }
}

function safeCell(value,limit) {
  const text = String(value).slice(0,limit);
  return /^[=+@\-\t\r]/.test(text) ? "'" + text : text;
}

function horizonReply(payload,result) {
  if (!payload || HORIZON_SHEETS.allowedOrigins.indexOf(payload.origin) < 0) return HtmlService.createHtmlOutput('<p>Origem não configurada.</p>');
  const data = JSON.stringify(Object.assign({type:'horizon:sheets:ack',requestId:payload.requestId},result)).replace(/</g,'\\u003c');
  const origin = JSON.stringify(payload.origin).replace(/</g,'\\u003c');
  // HtmlService usa um iframe. A resposta percorre os ancestrais, mas só é entregue
  // à origem explicitamente autorizada, inclusive se o Preview estiver incorporado.
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><p>Resposta da planilha preparada.</p><script>var data='+data+';var target=window;for(var i=0;i<6;i++){try{target=target.parent;target.postMessage(data,'+origin+');if(target===target.parent)break;}catch(e){break;}}<\/script>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
