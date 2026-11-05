import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { Document, NodeIO } from '@gltf-transform/core';
import { dedup, prune, weld } from '@gltf-transform/functions';
import { geoAzimuthalEqualArea, geoEqualEarth, geoPath, geoStream, geoArea, geoCentroid } from 'd3-geo';
import { topology } from 'topojson-server';
import { merge, feature } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';
import { Shape, Path, ExtrudeGeometry, ShapeUtils } from 'three';
import earcut from 'earcut';
import { META, IMPLEMENTED_CONTINENTS } from './config.mjs';
import { removeCollapsedMapRings } from './map-path.mjs';
import { buildContinentTerrains } from './build-africa-terrain.mjs';

const json = async path => JSON.parse(await readFile(path, 'utf8'));
const geo = await json('data-src/geo/ne_50m_admin_0_countries.geojson');
const mapping = await json('data-src/country-continent.json');
const parts = await json('data-src/geographic-parts.json');
const sovereigns = new Set(await json('data-src/un-sovereign-codes.json'));
const io = new NodeIO();
const reports = [];
const minimumIslandArea=Number(process.env.MODEL_MIN_ISLAND_SR||0.0000001);
const microstateArea=Number(process.env.MODEL_MICROSTATE_SR||0.00000025);
if(!Number.isFinite(minimumIslandArea)||minimumIslandArea<0||!Number.isFinite(microstateArea)||microstateArea<0)throw new Error('Limiares de área devem ser finitos e não negativos.');
await Promise.all(['public/models/countries','public/images/silhouettes','src/data/generated'].map(p=>mkdir(p,{recursive:true})));
ShapeUtils.triangulateShape = (contour, holes) => {
  const rings = [contour, ...holes];
  const vertices = rings.flatMap(r=>r.flatMap(p=>[p.x,p.y]));
  let n = contour.length;
  const holeIndices = holes.map(h=>{const index=n;n+=h.length;return index;});
  const triangles=earcut(vertices,holeIndices,2);
  return Array.from({length:triangles.length/3},(_,i)=>triangles.slice(i*3,i*3+3));
};
function projection(id, geometry) {
  const [lon,lat] = META[id].center;
  return geoAzimuthalEqualArea().rotate([-lon,-lat]).clipAngle(150).precision(0.15).fitExtent([[10,10],[230,230]],geometry);
}
function projectedPolygons(geometry, proj) {
  const polygons=[];
  let polygon, ring;
  geoStream(geometry, proj.stream({
    polygonStart(){polygon=[];}, polygonEnd(){if(polygon?.length)polygons.push(polygon);},
    lineStart(){ring=[];}, lineEnd(){if(ring?.length>=3)polygon?.push(ring);},
    point(x,y){ring?.push([x,y]);}, sphere(){},
  }));
  return polygons;
}
function cleanGeometry(geometry, threshold) {
  const t = presimplify(topology({shape:geometry}));
  const simple = feature(simplify(t,threshold), t.objects.shape).geometry;
  const polygons = simple.type === 'Polygon' ? [simple.coordinates] : simple.coordinates;
  // 0.0000001 sr ~= 4 km²; dimensão cartográfica, não área oficial.
  const kept = polygons.filter(p=>geoArea({type:'Polygon',coordinates:p})>minimumIslandArea && p[0].length>=4);
  return {type:'MultiPolygon',coordinates:kept};
}
async function writeModel(id, geometry, color, country=false) {
  const maxTriangles = country?3000:20000, maxKb=country?60:400;
  let threshold=country?0.015:0.003;
  let binary, triangles, usedGeometry;
  for(let attempt=0;attempt<12;attempt++) {
    usedGeometry=cleanGeometry(geometry,threshold);
    if (!usedGeometry.coordinates.length) return null;
    const proj=projection(id,usedGeometry);
    const polygons=projectedPolygons(usedGeometry,proj);
    const points=polygons.flat(2);
    if(!points.length)return null;
    const xs=points.map(p=>p[0]), ys=points.map(p=>p[1]);
    const cx=(Math.min(...xs)+Math.max(...xs))/2, cy=(Math.min(...ys)+Math.max(...ys))/2;
    const radius=Math.max(...points.map(p=>Math.hypot(p[0]-cx,p[1]-cy)));
    const doc=new Document(); const buffer=doc.createBuffer();
    const material=doc.createMaterial('cor sólida').setBaseColorFactor([...color.match(/\w\w/g).map(v=>parseInt(v,16)/255),1]).setMetallicFactor(0).setRoughnessFactor(0.8).setDoubleSided(false);
    const mesh=doc.createMesh(); triangles=0;
    for(const rings of polygons) {
      const convert=r=>r.map(([x,y])=>[(x-cx)/radius*0.98,-(y-cy)/radius*0.98]);
      const outer=convert(rings[0]);
      const shape=new Shape(); shape.moveTo(...outer[0]);outer.slice(1).forEach(p=>shape.lineTo(...p));shape.closePath();
      for(const hole of rings.slice(1)){const h=convert(hole); const path=new Path();path.moveTo(...h[0]);h.slice(1).forEach(p=>path.lineTo(...p));path.closePath();shape.holes.push(path);}
      const g=new ExtrudeGeometry(shape,{depth:0.06,steps:1,bevelEnabled:true,bevelSegments:1,bevelSize:0.002,bevelThickness:0.004,curveSegments:1});
      g.rotateX(-Math.PI/2);g.translate(0,0.004,0);g.computeVertexNormals();
      const p=g.getAttribute('position'), n=g.getAttribute('normal');
      triangles+=p.count/3;
      mesh.addPrimitive(doc.createPrimitive().setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(new Float32Array(p.array)).setBuffer(buffer)).setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(new Float32Array(n.array)).setBuffer(buffer)).setMaterial(material));
      g.dispose();
    }
    doc.createScene().addChild(doc.createNode().setMesh(mesh));
    await doc.transform(weld(),dedup(),prune());
    binary=await io.writeBinary(doc);
    if(triangles<=maxTriangles && binary.length/1024<=maxKb)break;
    threshold*=2;
    if(attempt===11)throw new Error(`Orçamento excedido: ${country||id}`);
  }
  const file=country?`models/countries/${country}.glb`:`models/${id}.glb`;
  await writeFile(`public/${file}`,binary);
  const report={id:country||id,tipo:country?'pais':'continente',arquivo:file,triangulos:triangles,tamanhoKb:Number((binary.length/1024).toFixed(2)),simplificacao:threshold};
  reports.push(report);
  if(!country){
    const path=geoPath(projection(id,usedGeometry))(usedGeometry);
    await writeFile(`public/images/silhouettes/${id}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><path d="${path}" fill="#b7a9db" stroke="#39334f" stroke-width="1.5" stroke-linejoin="round"/></svg>`);
  }
  return report;
}
// A topologia dissolve fronteiras internas antes da extrusão.
const geographic={type:'FeatureCollection',features:geo.features.flatMap(f=>{
 const code=f.properties.ADM0_A3;
 const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
 const groups={};
 for(const polygon of polys){
  let rings=polygon;
  if(code==='ATA')rings=rings.map(r=>{const clean=r.filter(p=>p[1]>-89.9);if(clean.length&&JSON.stringify(clean[0])!==JSON.stringify(clean.at(-1)))clean.push(clean[0]);return clean;});
  if(!rings[0]?.length)continue;
  const center=geoCentroid({type:'Polygon',coordinates:rings});
  const override=parts.regras.find(r=>r.pais===code&&center[0]<r.longitudeMenorQue&&center[1]<r.latitudeMenorQue);
  const group=override?.continente||mapping[code];
  (groups[group]??=[]).push(rings);
 }
 return Object.entries(groups).map(([group,polygons])=>({type:'Feature',properties:{...f.properties,group},geometry:{type:'MultiPolygon',coordinates:polygons}}));
})};
const topo=topology({world:geographic});
const mapTopo=simplify(presimplify(topo),0.04);
const mapProjection=geoEqualEarth().fitExtent([[15,15],[985,480]],geo);
const map=[];
for(const id of IMPLEMENTED_CONTINENTS){
  const geometries=topo.objects.world.geometries.filter(g=>g.properties.group===id);
  const continent=merge(topo,geometries);
  const report=await writeModel(id,continent,META[id].cor);
  if(!report)throw new Error(`Sem geometria: ${id}`);
  const dataPath=`src/data/continents/${id}.json`, data=await json(dataPath);
  data.modelo.tamanhoKb=report.tamanhoKb;
  for(const c of [...data.paises,...data.territorios]){
    if(!sovereigns.has(c.id)){delete c.modelo;continue;}
    const f=geo.features.find(f=>f.properties.ADM0_A3===c.id);
    // Microestados têm fallback explícito em vez de uma silhueta sem significado.
    if(!f || geoArea(f)<microstateArea){delete c.modelo;continue;}
    const generated=await writeModel(id,f.geometry,META[id].cor,c.id);
    if(generated)c.modelo={arquivo:generated.arquivo};else delete c.modelo;
  }
  await writeFile(dataPath,JSON.stringify(data,null,2)+'\n');
  const mapShape=merge(mapTopo,mapTopo.objects.world.geometries.filter(g=>g.properties.group===id));
  map.push({id,nome:META[id].nome,cor:META[id].cor,d:removeCollapsedMapRings(geoPath(mapProjection)(mapShape)),label:META[id].label});
  console.log(`${id}: ${report.triangulos} triângulos, ${report.tamanhoKb} KB`);
}
// Mesmo na Etapa 1 há seis alvos no mapa, com os ainda não implementados inativos.
for(const id of Object.keys(META).filter(id=>!IMPLEMENTED_CONTINENTS.includes(id))){const c=merge(mapTopo,mapTopo.objects.world.geometries.filter(g=>g.properties.group===id));map.push({id,nome:META[id].nome,cor:META[id].cor,d:removeCollapsedMapRings(geoPath(mapProjection)(c)),label:META[id].label});}
await writeFile('src/data/generated/map.json',JSON.stringify(map));
await writeFile('public/images/world-map.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500">${map.map(c=>`<path id="${c.id}" d="${c.d}" fill="${c.cor}" stroke="#5c3a45" stroke-width="0.5"/>`).join('')}</svg>`);
reports.push(...await buildContinentTerrains(IMPLEMENTED_CONTINENTS));
await writeFile('models-report.json',JSON.stringify(reports,null,2)+'\n');
console.log(`${reports.length} modelos gerados; sem compressão externa ou texturas.`);
