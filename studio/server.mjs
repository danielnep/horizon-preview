import http from 'node:http';
import {handleCentral} from './central/controller.mjs';
export function startServer({listenPort=Number(process.env.PORT||3000),background=false}={}){
 const server=http.createServer(async(req,res)=>{
  const path=(req.url||'/').split('?')[0];
  if(path==='/health'){res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({status:'ok',service:'horizon-studio'}));return;}
  if(path==='/'||path==='/index.html'){res.writeHead(308,{'location':'/central/','cache-control':'no-store'});res.end();return;}
  if(path==='/central'||path.startsWith('/central/')){await handleCentral(req,res);return;}
  res.writeHead(404,{'content-type':'text/plain'});res.end('Não encontrado');
 });
 server.listen(listenPort,'0.0.0.0');return server;
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href)startServer();
