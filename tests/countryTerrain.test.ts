import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { expect, it } from 'vitest';
import { createRequire } from 'node:module';
interface Projection {rotate(value:number[]):Projection;translate(value:number[]):Projection;scale(value:number):Projection;invert(point:number[]):number[]|null}
const {geoAzimuthalEqualArea}=createRequire(import.meta.url)('d3-geo') as {geoAzimuthalEqualArea:()=>Projection};
import { countryCoastlines } from '../scripts/build-country-terrain.mjs';
import { decodeTerrarium, terrainPixel } from '../scripts/terrain-tiles.mjs';
import { parseCountryTerrain } from '../src/services/countryTerrain';
import { continentSchema } from '../src/services/contentSchema';
import { CONTINENT_IDS, type Continent } from '../src/types/continent';
const json=async (file:string)=>JSON.parse(await readFile(file,'utf8'));
it('decodifica metros Terrarium e preserva antimeridiano, sem valores fabricados',()=>{
 expect(decodeTerrarium(137,219,68)).toBe(2523.265625);
 expect(decodeTerrarium(128,0,0)).toBe(0);
 expect(terrainPixel(-180,0,6)).toEqual(terrainPixel(180,0,6));
 expect(()=>terrainPixel(0,90,6)).toThrow();
});
it('todos os países com modelo têm terreno DEM dentro do orçamento e até dois locais com fonte',async()=>{
 const io=new NodeIO(),sourceIds=new Set([...(await readFile('SOURCES.md','utf8')).matchAll(/^## \[([^\]]+)\]/gm)].map(m=>m[1]));
 let count=0;
 for(const continentId of CONTINENT_IDS){
  const continent=await json(`src/data/continents/${continentId}.json`) as Continent;
  expect(continentSchema.safeParse(continent).success).toBe(true);
  for(const country of continent.paises){
   expect(country.pontosTuristicos!.length).toBeGreaterThanOrEqual(1);
   expect(country.pontosTuristicos!.length).toBeLessThanOrEqual(2);
   for(const point of country.pontosTuristicos||[])for(const source of point.fontes)expect(sourceIds.has(source),`${country.id}: ${source}`).toBe(true);
   if(!country.modelo)continue;count++;
   const metadata=await json(`src/data/generated/countries/${country.id}-terrain.json`);
   expect(await json(`public/content/countries/${country.id}-terrain.json`)).toEqual(metadata);
   expect(parseCountryTerrain(metadata,country,continentId)).not.toBeNull();
   const raw=await readFile(`data-src/dem/countries/${country.id}.json`,'utf8'),snapshot=JSON.parse(raw);
   expect(createHash('sha256').update(raw).digest('hex')).toBe(metadata.dem.sha256);
   const binary=await readFile(`public/${country.modelo.arquivo}`),doc=await io.readBinary(binary);
   expect(binary.length).toBeLessThanOrEqual(60*1024);
   expect(metadata.limits.triangles).toBeLessThanOrEqual(3000);
   expect(doc.getRoot().listMaterials()).toHaveLength(2);expect(doc.getRoot().listTextures()).toHaveLength(0);
   const top=doc.getRoot().listMeshes()[0].listPrimitives()[0].getAttribute('POSITION')!.getArray()!;
   expect(top.length/3).toBe(snapshot.samples.length);
   const n=metadata.normalization;
   const projection=geoAzimuthalEqualArea().rotate(metadata.projection.rotate).translate([0,0]).scale(metadata.projection.sphereRadiusMeters);
   for(let i=0;i<snapshot.samples.length;i++){
    const sample=snapshot.samples[i],actual=top.slice(i*3,i*3+3);
    const coastal=metadata.dem.coastalClampedVertexIndices.includes(i);
    if(coastal)expect(sample.elevation).toBeLessThan(0);
    const displayedHeight=coastal?0:sample.elevation;
    expect(actual[1]).toBeCloseTo(n.baseHeight+(displayedHeight-n.minimumDatumMeters)*n.elevationScale,6);
    expect(Math.hypot(...actual)).toBeLessThanOrEqual(1.000001);
    const coordinate=projection.invert!([actual[0]/n.horizontalScale+n.projectedOriginMeters[0],actual[2]/n.horizontalScale+n.projectedOriginMeters[1]])!;
    const longitudeDifference=Math.abs(((coordinate[0]-sample.lng+540)%360)-180);
    expect(longitudeDifference).toBeLessThan(.002);expect(coordinate[1]).toBeCloseTo(sample.lat,3);
   }
   for(const pin of metadata.points){
    const index=snapshot.samples.findIndex((s:{lng:number;lat:number})=>Math.abs(s.lng-pin.coordenadas.lng)<1e-7&&Math.abs(s.lat-pin.coordenadas.lat)<1e-7);
    expect(index,`${country.id}.${pin.id}`).toBeGreaterThanOrEqual(0);
    expect(Array.from(top.slice(index*3,index*3+3))).toEqual(pin.posicao);
   }
  }
 }
 expect(count).toBe(177);
},30000);
it('rejeita metadados de outro país, posições inválidas e mais de dois pontos',async()=>{
 const continent=await json('src/data/continents/america.json'),country=continent.paises.find((p:{id:string})=>p.id==='BRA'),m=await json('public/content/countries/BRA-terrain.json');
 expect(parseCountryTerrain({...m,countryId:'ARG'},country,'america')).toBeNull();
 expect(parseCountryTerrain({...m,points:[...m.points,m.points[0]]},country,'america')).toBeNull();
 expect(parseCountryTerrain({...m,points:[{...m.points[0],posicao:[NaN,0,0]}]},country,'america')).toBeNull();
 expect(parseCountryTerrain({...m,points:[{...m.points[0],coordenadas:{lat:0,lng:0}}]},country,'america')).toBeNull();
});

it('a máscara costeira usa apenas litoral e não confunde fronteiras nacionais com mar',async()=>{
 const geo=await json('data-src/geo/ne_50m_admin_0_countries.geojson');
 const coast=countryCoastlines(geo);
 expect(coast.get('NPL')).toHaveLength(0);
 expect(coast.get('AND')).toHaveLength(0);
 expect(coast.get('CHE')).toHaveLength(0);
 expect(coast.get('BRA')!.length).toBeGreaterThan(0);
 const jordan=await json('public/content/countries/JOR-terrain.json');
 expect(jordan.dem.displayedMinimumMeters).toBeLessThan(-300);
});
