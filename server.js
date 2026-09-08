const http=require('http');
const fs=require('fs');
const path=require('path');

const root=__dirname;
const port=Number(process.env.PORT)||3000;
const policyPath=path.join(root,'ai-policy.json');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json; charset=utf-8'};
const policyKeys=['foodBuffer','gardenCapacity','farmThreshold','marketThreshold','clinicThreshold','maternityThreshold','housingThreshold','birthTarget','comfortReserve','sellRatio','mayorRotationCycles'];

function validPolicy(policy){return policy&&policy.version===1&&policy.best&&policy.best.genome&&policyKeys.every(key=>Number.isFinite(policy.best.genome[key]))}
function reply(response,status,body,type='application/json; charset=utf-8'){response.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});response.end(body)}

http.createServer((request,response)=>{
  if(request.method==='POST'&&request.url==='/api/ai-policy'){
    let body='';
    request.on('data',chunk=>{body+=chunk;if(body.length>100000)request.destroy()});
    request.on('end',()=>{try{const policy=JSON.parse(body);if(!validPolicy(policy))return reply(response,400,JSON.stringify({ok:false,error:'invalid policy'}));fs.writeFileSync(policyPath,JSON.stringify(policy,null,2)+'\n','utf8');reply(response,200,JSON.stringify({ok:true,path:'ai-policy.json'}))}catch(error){reply(response,500,JSON.stringify({ok:false,error:error.message}))}});
    return;
  }
  if(request.method!=='GET'&&request.method!=='HEAD')return reply(response,405,'Method Not Allowed','text/plain; charset=utf-8');
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname),relative=pathname==='/'?'index.html':pathname.replace(/^\/+/,''),filePath=path.resolve(root,relative);
  if(!filePath.startsWith(root+path.sep))return reply(response,403,'Forbidden','text/plain; charset=utf-8');
  fs.readFile(filePath,(error,data)=>{if(error)return reply(response,error.code==='ENOENT'?404:500,'Not Found','text/plain; charset=utf-8');response.writeHead(200,{'Content-Type':mime[path.extname(filePath)]||'application/octet-stream','Cache-Control':'no-store'});if(request.method==='HEAD')response.end();else response.end(data)});
}).listen(port,'127.0.0.1',()=>console.log(`One Building local trainer: http://localhost:${port}`));
