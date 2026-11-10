import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {startServer} from '../server.mjs';

test('isolated Studio serves PWA and live VPS registry without institutional site',async()=>{
 const server=startServer({listenPort:0,background:false});
 await once(server,'listening');
 const base='http://127.0.0.1:'+server.address().port;
 try{
  const health=await fetch(base+'/health');
  assert.equal(health.status,200);
  assert.equal((await health.json()).service,'horizon-studio');
  const root=await fetch(base+'/',{redirect:'manual'});
  assert.equal(root.status,308);
  assert.equal(root.headers.get('location'),'/central/');
  const html=await fetch(base+'/central/');
  assert.equal(html.status,200);
  assert.match(await html.text(),/Horizon Studio/);
  const catalog=await fetch(base+'/central/api/studio/apps');
  assert.equal(catalog.status,200);
  const data=await catalog.json();
  assert.equal(data.source,'vps');
  assert.equal(data.apps.find(app=>app.id==='ronda-pro').url,'https://maxvel.hzsys.tech/');
  assert.ok(data.apps.every(app=>!app.url.includes('github')));
  const unknown=await fetch(base+'/central/api/studio/preview?appId=unknown');
  assert.equal((await unknown.json()).ready,false);
  const missing=await fetch(base+'/mcp');
  assert.equal(missing.status,404);
 }finally{
  server.closeAllConnections?.();
  await new Promise(resolve=>server.close(resolve));
 }
});
