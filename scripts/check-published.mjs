import { loadEnv } from 'vite';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { KNOWN_CONTINENTS } from './config.mjs';
const env={...loadEnv('production',process.cwd(),''),...process.env};
const base=new URL(env.VITE_PUBLIC_URL);
const get=async path=>{const url=new URL(path,base),r=await fetch(url);if(r.status!==200)throw Error(`${url}: HTTP ${r.status}`);return Buffer.from(await r.arrayBuffer());};
const html=(await get('')).toString('utf8');
if(!html.includes('Exploradores do Mundo')||!html.includes(`${base.pathname}assets/`))throw Error('HTML não corresponde ao app/base configurados.');
const entry=html.match(/src="([^"]+\/assets\/[^\"]+\.js)"/)?.[1];if(!entry)throw Error('Entrada JavaScript ausente.');const entrySource=(await get(new URL(entry,base).href)).toString('utf8');
const organizerChunk=entrySource.match(/assets\/Organizer-[A-Za-z0-9_-]+\.js/)?.[0];
if(!organizerChunk)throw Error('Chunk do Organizador ausente.');
const organizerSource=(await get(organizerChunk)).toString('utf8');
if(!organizerSource.includes('pbkdf2:sha256:210000:'))throw Error('Hash do Organizador ainda não chegou ao deploy.');
console.log('Organizador publicado com hash PBKDF2 configurado (sem senha em texto).');
const sha=buffer=>createHash('sha256').update(buffer).digest('hex');
for(const id of KNOWN_CONTINENTS){
 const [model,qr,marker,pdf]=await Promise.all([get(`models/${id}.glb`),get(`markers/${id}-qr.png`),get(`markers/${id}-ar.png`),get(`print/${id}-A4.pdf`)]);
 if(sha(model)!==sha(await readFile(`public/models/${id}.glb`)))throw Error(`GLB publicado diferente: ${id}`);
 if(!pdf.subarray(0,5).equals(Buffer.from('%PDF-'))||qr.readUInt32BE(0)!==0x89504e47||marker.readUInt32BE(0)!==0x89504e47)throw Error(`Artefato inválido: ${id}`);
 console.log(`${id}: GLB idêntico, QR, marcador e PDF HTTP 200`);
}
for(const file of ['ar/scene.html','ar/scene.js','ar/domain.js','vendor/aframe-1.6.0.min.js','vendor/ar-3.4.7.js','vendor/model-viewer-4.0.0.min.js','vendor/jsQR-1.4.0.js','vendor/camera_para.dat','content/overrides.json','fontes.html'])await get(file);
console.log(`${base.href} — página, JavaScript e recursos locais publicados respondem. Câmera, interface e WebGL não executados por esta checagem.`);
