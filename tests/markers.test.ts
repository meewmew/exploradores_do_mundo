import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { CONTINENT_IDS, type Continent, type ContinentId } from '../src/types/continent';
import { validateQR } from '../src/services/discovery';
import { META, IMPLEMENTED_CONTINENTS } from '../scripts/config.mjs';

interface MarkerManifest {
 id:ContinentId;
 barcode:number;
 url:string;
 pdf:string;
 markerMm:number;
}
interface PngImage {width:number;height:number;data:Buffer}
const require=createRequire(import.meta.url);
const {PNG}=require('pngjs') as {PNG:{sync:{read:(buffer:Buffer)=>PngImage}}};
const manifest=async()=>JSON.parse(await readFile('public/markers/manifest.json','utf8')) as MarkerManifest[];

// Células dos PNGs oficiais 0.png a 5.png, sem reproduzir a fórmula do gerador:
// https://github.com/artoolkit/artoolkit5/tree/master/doc/patterns/Matrix%20code%203x3%20(72dpi)
// Referência conferida por leitura dos pixels; 1 = preto, 0 = branco.
const officialCells=[
 [[1,0,0],[0,0,0],[1,0,0]],
 [[1,0,0],[0,0,0],[1,1,0]],
 [[1,0,0],[0,0,1],[1,0,0]],
 [[1,0,0],[0,0,1],[1,1,0]],
 [[1,0,0],[0,1,0],[1,0,0]],
 [[1,0,0],[0,1,0],[1,1,0]],
];

describe('QRs e marcadores gerados',()=>{
 it('mantém os seis IDs e barcodes iguais no manifesto, nos dados e na cena AR',async()=>{
  const entries=await manifest(),scene=await readFile('public/ar/scene.js','utf8');
  const sceneList=scene.match(/const ids\s*=\s*(\[[^\]]+\])/);
  expect(sceneList).not.toBeNull();
  const sceneIds=JSON.parse(sceneList![1].replaceAll("'",'"')) as string[];
  expect(entries.map(entry=>entry.id)).toEqual(CONTINENT_IDS);
  expect(IMPLEMENTED_CONTINENTS).toEqual(CONTINENT_IDS);
  expect(Object.keys(META)).toEqual(CONTINENT_IDS);
  expect(sceneIds).toEqual(CONTINENT_IDS);
  for(const [barcode,entry] of entries.entries()){
   const continent=JSON.parse(await readFile(`src/data/continents/${entry.id}.json`,'utf8')) as Continent;
   expect(continent.id).toBe(entry.id);
   expect(entry.barcode).toBe(barcode);
   expect(continent.marcador).toEqual({tipo:'barcode',id:barcode,arquivo:`markers/${entry.id}-ar.svg`});
   expect(sceneIds.indexOf(entry.id)).toBe(barcode);
   expect(entry.pdf).toBe(`print/${entry.id}-A4.pdf`);
   expect(entry.markerMm).toBeGreaterThanOrEqual(80);
  }
 });

 it('decodifica cada QR com a URL completa e só o aceita para o continente correspondente',async()=>{
  const entries=await manifest(),base=new URL(entries[0].url);
  base.search='';base.hash='';
  expect(base.protocol).toBe('https:');expect(base.pathname.endsWith('/')).toBe(true);
  const context={module:{exports:{}},exports:{}};
  runInNewContext(await readFile('public/vendor/jsQR-1.4.0.js','utf8'),context);
  const decode=context.module.exports as (pixels:Uint8ClampedArray,width:number,height:number)=>{data:string}|null;
  for(const entry of entries){
   const expected=new URL(base);expected.searchParams.set('continente',entry.id);
   expect(entry.url).toBe(expected.href);
   const png=PNG.sync.read(await readFile(`public/markers/${entry.id}-qr.png`));
   const decoded=decode(new Uint8ClampedArray(png.data),png.width,png.height);
   expect(decoded).not.toBeNull();expect(decoded!.data).toBe(entry.url);
   expect(validateQR(decoded!.data,entry.id,base.href)).toEqual({ok:true,id:entry.id});
   for(const other of CONTINENT_IDS)if(other!==entry.id)expect(validateQR(decoded!.data,other,base.href).ok).toBe(false);
  }
 },15000);

 it('preserva nos PNGs as nove células e a borda preta dos barcodes oficiais 0 a 5',async()=>{
  for(const entry of await manifest()){
   const png=PNG.sync.read(await readFile(`public/markers/${entry.id}-ar.png`));
   expect(png.width).toBe(png.height);
   const pixel=(x:number,y:number)=>{
    const offset=(Math.floor(y*png.height)*png.width+Math.floor(x*png.width))*4;
    expect(png.data[offset+1]).toBe(png.data[offset]);
    expect(png.data[offset+2]).toBe(png.data[offset]);
    expect(png.data[offset+3]).toBe(255);
    expect([0,255]).toContain(png.data[offset]);
    return png.data[offset]===0?1:0;
   };
   const cells=Array.from({length:3},(_,y)=>Array.from({length:3},(_,x)=>pixel(.25+(x+.5)/6,.25+(y+.5)/6)));
   expect(cells).toEqual(officialCells[entry.barcode]);
   for(const [x,y] of [[.125,.5],[.875,.5],[.5,.125],[.5,.875]])expect(pixel(x,y)).toBe(1);
  }
 });
});
