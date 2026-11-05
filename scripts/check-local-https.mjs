import https from 'node:https';
function read(path){return new Promise((resolve,reject)=>{https.get({hostname:'localhost',port:5173,path,rejectUnauthorized:false},response=>{const chunks=[];response.on('data',c=>chunks.push(c));response.on('end',()=>resolve({status:response.statusCode,body:Buffer.concat(chunks)}));}).on('error',reject);});}
// A exceção TLS se limita a este servidor de desenvolvimento em loopback.
for(const path of ['/','/src/main.tsx','/ar/scene.html?continente=africa&model=models/africa.glb','/ar/domain.js','/vendor/camera_para.dat','/models/africa.glb','/print/oceania-A4.pdf','/content/overrides.json']){
 const result=await read(path);if(result.status!==200)throw Error(`${path}: HTTP ${result.status}`);console.log(`HTTPS ${path}: 200 (${result.body.length} bytes)`);
}
console.log('Resposta HTTP verificada; execução de React, câmera e WebGL no navegador não validada.');
