import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { Document, NodeIO } from '@gltf-transform/core';
import { geoAzimuthalEqualArea, geoCentroid, geoIdentity, geoStream } from 'd3-geo';
import { topology } from 'topojson-server';
import { feature } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';
import { BufferGeometry, BufferAttribute } from 'three';
import earcut from 'earcut';
import { sampleTerrain, tileDownloadCount } from './terrain-tiles.mjs';
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const R=6371000;
function polygons(geometry,projection){
 const result=[];let rings,ring;
 geoStream(geometry,projection.stream({polygonStart(){rings=[];},polygonEnd(){if(rings.length)result.push(rings);},lineStart(){ring=[];},lineEnd(){if(ring.length>=3)rings.push(ring);},point(x,y){ring.push([x,y]);}}));return result;
}
function triangulate(rings){const holes=[],flat=[];for(const [i,ring]of rings.entries()){if(i)holes.push(flat.length/2);for(const p of ring)flat.push(...p);}return {points:rings.flat(),indices:earcut(flat,holes,2)};}
export function barycentric(x,z,a,b,c){
 const d=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(d)<1e-9)return null;
 const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(z-c[1]))/d,v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(z-c[1]))/d;
 return [u,v,1-u-v];
}
export function prepareCountryGeometry(shape,spots=[],attempt=0){
 const center=geoCentroid(shape),projection=geoAzimuthalEqualArea().rotate([-center[0],-center[1]]).translate([0,0]).scale(R).precision(1000);
 const threshold=0.00015*2**attempt,t=presimplify(topology({shape:shape.geometry}));
 const simple=feature(simplify(t,threshold),t.objects.shape).geometry;
 const projected=polygons(simple,projection);
 if(!projected.length)throw new Error('Geometria insuficiente');
 const all=projected.flat(2),xs=all.map(p=>p[0]),zs=all.map(p=>p[1]),xmin=Math.min(...xs),xmax=Math.max(...xs),zmin=Math.min(...zs),zmax=Math.max(...zs);
 const origin=[(xmin+xmax)/2,(zmin+zmax)/2],radius=Math.max(...all.map(p=>Math.hypot(p[0]-origin[0],p[1]-origin[1])));
 // Roughly 500 cells over the bounding box; adapt before relaxing any budget.
 const step=Math.max(100,Math.sqrt((xmax-xmin)*(zmax-zmin)/300)*1.12**attempt);
 const xy=[],triangles=[],index=new Map();
 const vertex=(x,z)=>{const key=`${Math.round(x*100)},${Math.round(z*100)}`;if(index.has(key))return index.get(key);const i=xy.length;xy.push([x,z]);index.set(key,i);return i;};
 const triangle=(a,b,c)=>{if(a===b||b===c||a===c)return;const [pa,pb,pc]=[a,b,c].map(i=>xy[i]);const area=(pb[0]-pa[0])*(pc[1]-pa[1])-(pb[1]-pa[1])*(pc[0]-pa[0]);if(Math.abs(area)<0.1)return;triangles.push(a,...(area>0?[c,b]:[b,c]));};
 for(const rings of projected){
  const pp=rings.flat(),minx=Math.min(...pp.map(p=>p[0])),maxx=Math.max(...pp.map(p=>p[0])),minz=Math.min(...pp.map(p=>p[1])),maxz=Math.max(...pp.map(p=>p[1]));
  const polygon={type:'Polygon',coordinates:rings.map(r=>[...r,r[0]])};
  for(let x=Math.floor(minx/step)*step;x<maxx;x+=step)for(let z=Math.floor(minz/step)*step;z<maxz;z+=step){
   const clipped=polygons(polygon,geoIdentity().clipExtent([[x,z],[x+step,z+step]]));
   for(const part of clipped){const mesh=triangulate(part),vertices=mesh.points.map(p=>vertex(...p));for(let i=0;i<mesh.indices.length;i+=3)triangle(...mesh.indices.slice(i,i+3).map(n=>vertices[n]));}
  }
 }
 const anchors=[];
 for(const spot of spots){
  const position=projection([spot.coordenadas.lng,spot.coordenadas.lat]);let found=false;
  for(let i=0;i<triangles.length;i+=3){const ids=triangles.slice(i,i+3),w=barycentric(...position,...ids.map(n=>xy[n]));if(!w||w.some(n=>n<-1e-7))continue;
   const v=vertex(...position);if(!ids.includes(v)){triangles.splice(i,3);triangle(ids[0],ids[1],v);triangle(ids[1],ids[2],v);triangle(ids[2],ids[0],v);}anchors.push({spot,index:v});found=true;break;
  }
  // Coastal/island points can lie outside the simplified 1:50m silhouette.
  // Keep the fact in the text list; do not invent a surface anchor.
  if(!found)anchors.push({spot,index:null});
 }
 const edges=new Map();for(let i=0;i<triangles.length;i+=3){const f=triangles.slice(i,i+3);for(let e=0;e<3;e++){const a=f[e],b=f[(e+1)%3],key=a<b?`${a},${b}`:`${b},${a}`;if(edges.has(key))edges.get(key).count++;else edges.set(key,{a,b,count:1});}}
 const boundary=[...edges.values()].filter(e=>e.count===1),bottom=[];
 for(const rings of projected){const part=triangulate(rings),vertices=part.points.map(p=>vertex(...p));for(let i=0;i<part.indices.length;i+=3)bottom.push(...part.indices.slice(i,i+3).map(n=>vertices[n]));}
 const boundaryVertices=new Set(boundary.flatMap(e=>[e.a,e.b]));
 const estimatedBytes=xy.length*27+triangles.length*2+boundaryVertices.size*2*24+(boundary.length*6+bottom.length)*2+bottom.length*8+3500;
 return {center,projection,origin,radius,step,threshold,xy,triangles,boundary,bottom,anchors,estimatedBytes};
}
function elevationColor(height){const h=Math.max(0,height),stops=[[0,[.24,.46,.23]],[500,[.43,.58,.27]],[1500,[.65,.57,.31]],[3000,[.56,.40,.25]],[5000,[.85,.83,.74]]];let i=stops.findIndex(s=>s[0]>=h);if(i<0)i=stops.length-1;if(!i)return stops[0][1];const [a,ac]=stops[i-1],[b,bc]=stops[i],t=Math.min(1,(h-a)/(b-a));return ac.map((v,n)=>v+(bc[n]-v)*t);}
async function buildOne(country,continentId,shape,spots,online){
 let mesh;for(let attempt=0;attempt<15;attempt++){mesh=prepareCountryGeometry(shape,spots,attempt);const triangles=mesh.triangles.length/3+mesh.boundary.length*2+mesh.bottom.length/3;if(mesh.estimatedBytes<=58*1024&&triangles<=2900)break;if(attempt===14)throw new Error(`Sem malha no orçamento: ${country.id}`);}
 const inputHash=hash({version:1,shape:shape.geometry,xy:mesh.xy,points:spots});
 const snapshotFile=`data-src/dem/countries/${country.id}.json`;
 let snapshot=await json(snapshotFile).catch(error=>{if(error.code!=='ENOENT')throw error;return null;});
 if(!snapshot||snapshot.inputHash!==inputHash){
  if(!online)throw new Error(`DEM ausente/desatualizado para ${country.id}; execute node scripts/build-country-terrain.mjs --fetch --country ${country.id}`);
  const zoom=Math.max(6,Math.min(12,Math.ceil(Math.log2(156543.03392804097/Math.max(80,mesh.step/4)))));
  const samples=[],tiles=new Map();
  // Bounded batches avoid a request per vertex and preserve sample order.
  for(let start=0;start<mesh.xy.length;start+=12){
   const batch=await Promise.all(mesh.xy.slice(start,start+12).map(async p=>{const [lng,lat]=mesh.projection.invert(p),s=await sampleTerrain(lng,lat,zoom);tiles.set(s.tile.url,s.tile);return {lng,lat,elevation:s.elevation,resolutionMeters:s.resolutionMeters,tile:s.tile.url,pixel:s.pixel};}));samples.push(...batch);
  }
  snapshot={version:1,countryId:country.id,inputHash,dataset:'Mapzen Terrain Tiles — DEM composto',sourceId:'mapzen-terrain',retrievedOn:'2026-11-05',format:'Terrarium',sourceProjection:'EPSG:3857',coordinateSystem:'WGS84 longitude/latitude',elevationUnits:'m',zoom,sampling:'pixel mais próximo, sem interpolação ou preenchimento de lacunas',nodata:'interromper geração; nenhuma altitude fabricada',nativeResolution:'variável conforme as fontes do mosaico; resolução de pixel abaixo não é precisão de medição',tiles:[...tiles.values()].sort((a,b)=>a.url.localeCompare(b.url)),samples};
  await mkdir('data-src/dem/countries',{recursive:true});await writeFile(snapshotFile,JSON.stringify(snapshot)+'\n');
 }
 if(snapshot.samples.length!==mesh.xy.length)throw new Error('Amostragem DEM incompleta');
 const rawHeights=snapshot.samples.map(s=>s.elevation);if(rawHeights.some(h=>!Number.isFinite(h)))throw new Error('DEM com lacunas');
 const coastSegments=(shape.coastlines||[]).flatMap(line=>line.slice(1).map((p,i)=>[mesh.projection(line[i]),mesh.projection(p)]));
 const coastalClampedVertexIndices=[];
 const heights=rawHeights.map((height,index)=>{
  if(height>=0)return height;
  const p=mesh.xy[index],tolerance=snapshot.samples[index].resolutionMeters*2;
  const nearBoundary=coastSegments.some(([v,w])=>{const dx=w[0]-v[0],dz=w[1]-v[1],length=dx*dx+dz*dz,t=length?Math.max(0,Math.min(1,((p[0]-v[0])*dx+(p[1]-v[1])*dz)/length)):0;return Math.hypot(p[0]-v[0]-t*dx,p[1]-v[1]-t*dz)<=tolerance;});
  if(nearBoundary){coastalClampedVertexIndices.push(index);return 0;}
  return height;
 });
 const minimum=Math.min(0,...heights),maximum=Math.max(...heights),scale=.94/mesh.radius;
 const exaggeration=Math.max(1,Math.min(160,.32/Math.max(1e-12,(maximum-minimum)*scale)));
 const base=.018;let positions=mesh.xy.flatMap(([x,z],i)=>[(x-mesh.origin[0])*scale,base+(heights[i]-minimum)*scale*exaggeration,(z-mesh.origin[1])*scale]);
 const radius=Math.max(...mesh.xy.map((_,i)=>Math.hypot(...positions.slice(i*3,i*3+3)))),fit=radius>1?1/radius:1;
 positions=positions.map(v=>v*fit);
 const colors=heights.flatMap(h=>elevationColor(h).map(v=>Math.round(v*255)));
 const sidePositions=[],sideIndices=[],sideMap=new Map();
 const sideVertex=(top,bottom)=>{const key=`${top}/${bottom}`;if(sideMap.has(key))return sideMap.get(key);const i=sidePositions.length/3;sidePositions.push(positions[top*3],bottom?0:positions[top*3+1],positions[top*3+2]);sideMap.set(key,i);return i;};
 for(const {a,b}of mesh.boundary){const at=sideVertex(a,false),bt=sideVertex(b,false),ab=sideVertex(a,true),bb=sideVertex(b,true);sideIndices.push(at,bb,bt,at,ab,bb);}
 for(let i=0;i<mesh.bottom.length;i+=3){const ids=mesh.bottom.slice(i,i+3),p=ids.map(n=>mesh.xy[n]),area=(p[1][0]-p[0][0])*(p[2][1]-p[0][1])-(p[1][1]-p[0][1])*(p[2][0]-p[0][0]);sideIndices.push(...(area>0?ids:[ids[0],ids[2],ids[1]]).map(n=>sideVertex(n,true)));}
 const doc=new Document(),buffer=doc.createBuffer(),topMat=doc.createMaterial('Terreno DEM').setRoughnessFactor(.95),baseMat=doc.createMaterial('Base cartográfica').setBaseColorFactor([.34,.26,.16,1]).setRoughnessFactor(1);
 function primitive(values,indices,mat,color){const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(new Float32Array(values),3));g.setIndex(indices);g.computeVertexNormals();const p=doc.createPrimitive().setMaterial(mat).setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(new Float32Array(values)).setBuffer(buffer)).setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.getAttribute('normal').array)).setBuffer(buffer)).setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint16Array(indices)).setBuffer(buffer));if(color)p.setAttribute('COLOR_0',doc.createAccessor().setType('VEC3').setNormalized(true).setArray(new Uint8Array(color)).setBuffer(buffer));g.dispose();return p;}
 const model=doc.createMesh(`${country.nome} — terreno DEM`).addPrimitive(primitive(positions,mesh.triangles,topMat,colors)).addPrimitive(primitive(sidePositions,sideIndices,baseMat));
 doc.createScene(country.id).addChild(doc.createNode(country.id).setMesh(model));
 doc.getRoot().getAsset().copyright='Terrain data Mapzen/AWS Open Data and providers; see /licenses/mapzen-terrain-attribution.md. Country boundaries: Natural Earth (public domain).';
 const bytes=await new NodeIO().writeBinary(doc),triangles=(mesh.triangles.length+sideIndices.length)/3;
 if(bytes.length>60*1024||triangles>3000)throw new Error(`${country.id}: orçamento excedido (${bytes.length}, ${triangles})`);
 const points=mesh.anchors.filter(a=>a.index!==null).map(({spot,index})=>({...spot,posicao:positions.slice(index*3,index*3+3).map(Math.fround)}));
 const metadata={version:1,countryId:country.id,continentId,file:country.modelo.arquivo,sourceIds:['natural-earth','mapzen-terrain'],verticalExaggeration:exaggeration,projection:{name:'Azimutal equivalente de Lambert, esfera',rotate:[-mesh.center[0],-mesh.center[1]],sphereRadiusMeters:R,axes:{x:'leste',y:'elevação',z:'sul'}},normalization:{projectedOriginMeters:mesh.origin,horizontalScale:scale*fit,elevationScale:scale*exaggeration*fit,baseHeight:base*fit,minimumDatumMeters:minimum},dem:{dataset:snapshot.dataset,zoom:snapshot.zoom,pixelResolutionMeters:{min:Math.min(...snapshot.samples.map(s=>s.resolutionMeters)),max:Math.max(...snapshot.samples.map(s=>s.resolutionMeters))},nativeResolution:snapshot.nativeResolution,sampling:snapshot.sampling,nodata:snapshot.nodata,elevationUnits:'m',minimumSampleMeters:Math.min(...rawHeights),maximumSampleMeters:Math.max(...rawHeights),displayedMinimumMeters:Math.min(...heights),displayedMaximumMeters:maximum,coastalClampedVertexIndices,coastalTreatment:'Amostras negativas a até dois pixels do litoral externo Natural Earth (excluindo fronteiras políticas) normalizadas ao nível do mar (0 m), para evitar batimetria da costa generalizada. Depressões internas preservadas; valores DEM originais permanecem no snapshot.',sha256:hash(await readFile(snapshotFile,'utf8')),inputHash,referencePeriod:'variável entre as fontes do mosaico; não informado por pixel'},mesh:{stepMeters:mesh.step,simplification:mesh.threshold,topVertexCount:mesh.xy.length,topTriangleCount:mesh.triangles.length/3,sourceGeometrySha256:hash(shape.geometry),omittedPointIds:mesh.anchors.filter(a=>a.index===null).map(a=>a.spot.id)},limits:{triangles,bytes:bytes.length,materials:2,textures:0},points,textOnlyPoints:mesh.anchors.filter(a=>a.index===null).map(a=>a.spot)};
 await mkdir('src/data/generated/countries',{recursive:true});await mkdir('public/content/countries',{recursive:true});
 await writeFile(`public/${country.modelo.arquivo}`,bytes);const serialized=JSON.stringify(metadata,null,2)+'\n';await writeFile(`src/data/generated/countries/${country.id}-terrain.json`,serialized);await writeFile(`public/content/countries/${country.id}-terrain.json`,serialized);
 console.log(`${country.id}: ${triangles} triângulos, ${(bytes.length/1024).toFixed(1)} KB, ${points.length} pins; tiles baixados: ${tileDownloadCount()}`);
 return {id:country.id,tipo:'pais',arquivo:country.modelo.arquivo,triangulos:triangles,tamanhoKb:Number((bytes.length/1024).toFixed(2)),fontes:metadata.sourceIds,relevo:true};
}
export function countryCoastlines(geo){
 const world=topology({world:geo}),counts=new Map();
 const references=g=>g.arcs.flat(Infinity).map(i=>i<0?~i:i);
 for(const geometry of world.objects.world.geometries)for(const i of new Set(references(geometry)))counts.set(i,(counts.get(i)||0)+1);
 return new Map(world.objects.world.geometries.map(geometry=>[geometry.properties.ADM0_A3,references(geometry).filter(i=>counts.get(i)===1).map(i=>world.arcs[i])]));
}
export async function buildCountryTerrains({online=false,only}={}){
 const geo=await json('data-src/geo/ne_50m_admin_0_countries.geojson'),source=await json('data-src/country-tourist-spots.json'),reports=[];
 const coastlines=countryCoastlines(geo);
 for(const continentId of ['america','africa','asia','europa','oceania']){
  const c=await json(`src/data/continents/${continentId}.json`);
  for(const country of c.paises.filter(p=>p.modelo&&(!only||p.id===only))){
   const shape=geo.features.find(f=>f.properties.ADM0_A3===country.id);if(!shape)throw new Error(`Sem geometria: ${country.id}`);
   reports.push(await buildOne(country,continentId,{...shape,coastlines:coastlines.get(country.id)||[]},source.countries[country.id]||[],online));
  }
 }
 return reports;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const only=process.argv.includes('--country')?process.argv[process.argv.indexOf('--country')+1]:undefined;
 const updated=await buildCountryTerrains({online:process.argv.includes('--fetch'),only});
 const reports=await json('models-report.json'),byId=new Map(updated.map(r=>[r.id,r]));await writeFile('models-report.json',JSON.stringify(reports.map(r=>r.tipo==='pais'&&byId.has(r.id)?byId.get(r.id):r),null,2)+'\n');
}
