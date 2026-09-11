const http=require('http');
const fs=require('fs');
const path=require('path');

const root=__dirname;
const port=Number(process.env.PORT)||3000;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json; charset=utf-8'};
function reply(response,status,body,type='application/json; charset=utf-8'){response.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});response.end(body)}

http.createServer((request,response)=>{
  if(request.method!=='GET'&&request.method!=='HEAD')return reply(response,405,'Method Not Allowed','text/plain; charset=utf-8');
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname),relative=pathname==='/'?'index.html':pathname.replace(/^\/+/,''),filePath=path.resolve(root,relative);
  if(!filePath.startsWith(root+path.sep))return reply(response,403,'Forbidden','text/plain; charset=utf-8');
  fs.readFile(filePath,(error,data)=>{if(error)return reply(response,error.code==='ENOENT'?404:500,'Not Found','text/plain; charset=utf-8');response.writeHead(200,{'Content-Type':mime[path.extname(filePath)]||'application/octet-stream','Cache-Control':'no-store'});if(request.method==='HEAD')response.end();else response.end(data)});
}).listen(port,'127.0.0.1',()=>console.log(`One Building local server: http://localhost:${port}`));
