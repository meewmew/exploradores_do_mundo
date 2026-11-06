import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { PNG } from 'pngjs';
const directory='.cache/terrain-tiles';
const promises=new Map();
let downloaded=0;
export function terrainPixel(lng,lat,zoom){
 if(!Number.isFinite(lng)||!Number.isFinite(lat)||Math.abs(lat)>85.05112878)throw new Error('Coordenada fora da cobertura Web Mercator');
 const size=256*2**zoom,latitude=lat*Math.PI/180;
 return {x:((lng+180)/360*size%size+size)%size,y:Math.max(0,Math.min(size-1,(1-Math.asinh(Math.tan(latitude))/Math.PI)/2*size))};
}
export function decodeTerrarium(r,g,b){return r*256+g+b/256-32768;}
export async function sampleTerrain(lng,lat,zoom){
 const pixel=terrainPixel(lng,lat,zoom),tx=Math.floor(pixel.x/256),ty=Math.floor(pixel.y/256),key=`${zoom}-${tx}-${ty}`;
 if(!promises.has(key))promises.set(key,(async()=>{
  const file=`${directory}/${key}.png`,url=`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${zoom}/${tx}/${ty}.png`;
  let bytes;try{bytes=await readFile(file);}catch(error){if(error.code!=='ENOENT')throw error;
   const response=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!response.ok)throw new Error(`DEM HTTP ${response.status}: ${url}`);
   bytes=Buffer.from(await response.arrayBuffer());await mkdir(directory,{recursive:true});await writeFile(file,bytes);downloaded++;
  }
  const png=PNG.sync.read(bytes);if(png.width!==256||png.height!==256)throw new Error('Tile DEM fora do formato Terrarium 256');
  return {png,url,sha256:createHash('sha256').update(bytes).digest('hex')};
 })());
 const tile=await promises.get(key),column=Math.floor(pixel.x)%256,row=Math.floor(pixel.y)%256,i=(row*256+column)*4;
 if(tile.png.data[i+3]!==255)throw new Error(`DEM sem dado em ${lng},${lat}`);
 const elevation=decodeTerrarium(...tile.png.data.slice(i,i+3));
 if(!Number.isFinite(elevation)||elevation<-12000||elevation>9000)throw new Error('Elevação DEM inválida');
 return {elevation,tile:{url:tile.url,sha256:tile.sha256},pixel:[column,row],resolutionMeters:156543.03392804097*Math.cos(lat*Math.PI/180)/2**zoom};
}
export function tileDownloadCount(){return downloaded;}
