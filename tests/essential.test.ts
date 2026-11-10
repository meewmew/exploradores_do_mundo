import { describe, it, expect } from 'vitest';
import { readFile, stat } from 'node:fs/promises';
import { NodeIO } from '@gltf-transform/core';
import { CONTINENT_IDS, type ContinentId } from '../src/types/continent';
import { LocalStorageRepository, type StoragePort } from '../src/services/collectionRepository';
import { discoverFromMarker, discoverFromQR, continentFromURL } from '../src/services/discovery';
import { receiveARMessage } from '../src/services/arBridge';
import { IMPLEMENTED_CONTINENTS } from '../scripts/config.mjs';
import { continentSchema, validateOverrides } from '../src/services/contentSchema';
import { activityContinents, answerActivity, defaultActivities, isExplorationComplete } from '../src/services/activities';
import type { Continent } from '../src/types/continent';
import { verifyOrganizerPassword } from '../src/services/organizerAuth';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { runInNewContext } from 'node:vm';
// Leitura dos arquivos gerados em Node não equivale à validação de câmera física.
import { createRequire } from 'node:module';
import { safePreference } from '../src/services/preferences';
class MemoryStorage implements StoragePort {data=new Map<string,string>();getItem(k:string){return this.data.get(k)||null;}setItem(k:string,v:string){this.data.set(k,v);}removeItem(k:string){this.data.delete(k);}}
const data=async(id:string)=>JSON.parse(await readFile(`src/data/continents/${id}.json`,'utf8')) as Continent;
describe('Verificações essenciais da especificação',()=>{
 it('os seis QR gerados podem ser decodificados e os barcodes são distintos',async()=>{
  const context={module:{exports:{}},exports:{}};runInNewContext(await readFile('public/vendor/jsQR-1.4.0.js','utf8'),context);
  const decode=context.module.exports as (data:Uint8ClampedArray,w:number,h:number)=>{data:string}|null;
  const require=createRequire(import.meta.url);const {PNG}=require('pngjs') as {PNG:{sync:{read:(b:Buffer)=>{width:number;height:number;data:Buffer}}}};
  const barcodes:string[]=[];
  for(const id of IMPLEMENTED_CONTINENTS){const png=PNG.sync.read(await readFile(`public/markers/${id}-qr.png`));const qr=decode(new Uint8ClampedArray(png.data),png.width,png.height);expect(qr).not.toBeNull();expect(new URL(qr!.data).searchParams.get('continente')).toBe(id);barcodes.push((await readFile(`public/markers/${id}-ar.png`)).toString('base64'));}
  expect(new Set(barcodes).size).toBe(IMPLEMENTED_CONTINENTS.length);
 },15000);
 it('valida hash PBKDF2 sem guardar uma senha de Organizador no código',async()=>{
  const password=randomBytes(16).toString('hex'),salt=randomBytes(16).toString('hex');
  const expected=pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex');
  const encoded=`pbkdf2:sha256:100000:${salt}:${expected}`;
  expect(await verifyOrganizerPassword(password,encoded)).toBe(true);expect(await verifyOrganizerPassword(password+'x',encoded)).toBe(false);expect(await verifyOrganizerPassword(password,'invalido')).toBe(false);
 });
 it('persiste descobertas e atividades sem duplicar, valida storage e usa memória se bloqueado',async()=>{
  const storage=new MemoryStorage(),r=new LocalStorageRepository(storage);await r.unlock('africa');await r.unlock('africa');await r.completeActivity('africa-formato');await r.completeActivity('africa-formato');
  const reload=new LocalStorageRepository(storage);expect(await reload.getUnlocked()).toEqual(['africa']);expect(await reload.getCompletedActivities()).toEqual(['africa-formato']);
  storage.setItem(r.key,JSON.stringify({unlocked:['africa','invalido'],activities:[],profile:{anoEscolar:'99'}}));expect(await reload.getUnlocked()).toEqual(['africa']);expect(await reload.getProfile()).toEqual({});
  const blocked=new LocalStorageRepository({getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}});await blocked.unlock('africa');expect(blocked.isPersistent).toBe(false);expect(await blocked.isUnlocked('africa')).toBe(true);
  safePreference('teste:intro:v1','1');expect(safePreference('teste:intro:v1')).toBe('1');
 });
 it('URL só seleciona; QR exige endereço correto e continente selecionado',async()=>{
  const r=new LocalStorageRepository(new MemoryStorage()),base='https://example.org/jogo/';expect(continentFromURL('?continente=africa')).toBe('africa');expect(await r.getUnlocked()).toEqual([]);
  for(const text of ['https://example.org/jogo/?continente=asia','https://outro.org/jogo/?continente=africa','invalido','https://example.org/jogo/','https://example.org/errado/?continente=africa'])expect((await discoverFromQR(r,text,'africa',base)).ok).toBe(false);
  expect(await r.getUnlocked()).toEqual([]);expect((await discoverFromQR(r,`${base}?continente=africa`,'africa',base)).ok).toBe(true);expect(await r.getUnlocked()).toEqual(['africa']);
 });
 it('somente marcador correspondente com estabilidade mínima descobre',async()=>{
  const r=new LocalStorageRepository(new MemoryStorage());expect(await discoverFromMarker(r,'africa',undefined)).toBe(false);expect(await discoverFromMarker(r,'africa',{continentId:'asia',stableMs:800})).toBe(false);expect(await discoverFromMarker(r,'africa',{continentId:'africa',stableMs:499})).toBe(false);expect(await r.getUnlocked()).toEqual([]);
  expect(await discoverFromMarker(r,'africa',{continentId:'africa',stableMs:500})).toBe(true);expect(await r.getUnlocked()).toEqual(['africa']);
 });
 it('ponte AR exige origem, janela, versão e payload esperados',()=>{
  const source={} as Window;const input={origin:'https://example.org',source,data:{app:'exploradores-ar',version:1,type:'ar:marker-found',payload:{continentId:'africa',stableMs:500}}};
  expect(receiveARMessage(input as MessageEvent,source,input.origin,'africa')).not.toBeNull();expect(receiveARMessage({...input,origin:'https://outro.org'} as MessageEvent,source,input.origin,'africa')).toBeNull();expect(receiveARMessage({...input,source:{}} as MessageEvent,source,input.origin,'africa')).toBeNull();expect(receiveARMessage({...input,data:{...input.data,payload:{}}} as MessageEvent,source,input.origin,'africa')).toBeNull();
 });
 it('dados e fontes dos continentes implementados são completos e arquivos existem',async()=>{
  expect(CONTINENT_IDS).toEqual(['africa','america','antartida','asia','europa','oceania']);const sources=await readFile('SOURCES.md','utf8');const sourceIds=[...sources.matchAll(/^## \[([^\]]+)\]/gm)].map(m=>m[1]);
  for(const id of IMPLEMENTED_CONTINENTS){const c=await data(id);expect(continentSchema.safeParse(c).success).toBe(true);for(const key of ['descricao','caracteristicasGeograficas','climas','faunaFlora','cultura','curiosidades'] as const){expect(c.fontesTexto[key]?.length).toBeGreaterThan(0);c.fontesTexto[key]?.forEach(s=>expect(sourceIds).toContain(s));}for(const n of [c.areaKm2,c.populacao,c.quantidadePaises,...c.paises.flatMap(p=>[p.areaKm2,p.populacao])]){expect(sourceIds).toContain(n.fonte);if(n.valor===null)expect(n.verificar).toBe(true);}for(const p of c.paises){if(p.capital)expect(sourceIds).toContain(p.capital.fonte);}await stat(`public/${c.fichaCurta.ilustracao}`);await stat(`public/print/${id}-A4.pdf`);await stat(`public/markers/${id}-qr.png`);if(id==='antartida')expect(c.paises).toEqual([]);if(id==='africa')expect(c.paises.find(p=>p.id==='SDS')?.capital).toEqual({valor:'Juba',fonte:'undata-south-sudan'});}
 });
 it('GLB parseia e respeita orçamento, materiais sem textura e normalização',async()=>{
  const reports=JSON.parse(await readFile('models-report.json','utf8')) as {id:string;tipo:string;arquivo:string;triangulos:number}[];const io=new NodeIO();
  expect(reports.filter(r=>r.tipo==='continente').map(r=>r.id).sort()).toEqual([...IMPLEMENTED_CONTINENTS].sort());
  for(const r of reports){const bytes=await readFile(`public/${r.arquivo}`);expect(bytes.length).toBeLessThanOrEqual((r.tipo==='pais'?60:400)*1024);const doc=await io.readBinary(bytes);expect(doc.getRoot().listMaterials().length).toBeLessThanOrEqual(2);expect(doc.getRoot().listTextures()).toHaveLength(0);let triangles=0,minY=Infinity,maxRadius=0;for(const mesh of doc.getRoot().listMeshes())for(const primitive of mesh.listPrimitives()){triangles+=(primitive.getIndices()?.getCount()||primitive.getAttribute('POSITION')!.getCount())/3;const values=primitive.getAttribute('POSITION')!.getArray()!;for(let i=0;i<values.length;i+=3){minY=Math.min(minY,values[i+1]);maxRadius=Math.max(maxRadius,Math.hypot(values[i],values[i+1],values[i+2]));}}expect(minY).toBeGreaterThanOrEqual(-0.00001);expect(maxRadius).toBeLessThanOrEqual(1.005);expect(triangles).toBeLessThanOrEqual(r.tipo==='pais'?3000:20000);}
 });
 it('override inválido é rejeitado e conclusão exige seis descobertas',()=>{
  expect(validateOverrides({version:1,continents:{africa:{descricao:'Texto sem fonte'}},activities:[]},['autoral'])).toBeNull();expect(validateOverrides({version:1,continents:{},activities:[]},['autoral'])).not.toBeNull();expect(isExplorationComplete(['africa'])).toBe(false);expect(isExplorationComplete([...CONTINENT_IDS])).toBe(true);
 });
 it('erro e resposta revelada não concluem; acertos têm contagem separada por continente',async()=>{
  const c=await data('africa'),activities=defaultActivities(c,[c,{...c,id:'asia',nome:'Ásia'},{...c,id:'america',nome:'América'},{...c,id:'europa',nome:'Europa'}]);const r=new LocalStorageRepository(new MemoryStorage());
  for(const a of activities){expect(await answerActivity(r,a,'errado')).toBe(false);expect(await answerActivity(r,a,a.respostaCorretaId,true)).toBe(true);}expect(await r.getCompletedActivities()).toEqual([]);for(const a of activities)await answerActivity(r,a,a.respostaCorretaId);expect(activityContinents(await r.getCompletedActivities())).toEqual(['africa']);expect(await r.getUnlocked()).toEqual([]);
 });
});
