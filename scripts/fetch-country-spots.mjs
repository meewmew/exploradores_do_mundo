import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { geoContains } from 'd3-geo';
const base = 'https://data.unesco.org/api/explore/v2.1/catalog/datasets/whc001/records';
const fields = 'id_no,name_en,iso_codes,geo_point_2d,coordinates,category,date_inscribed';
const all=[];const requests=[];
for(let offset=0;;offset+=100){
 const url=`${base}?select=${fields}&limit=100&offset=${offset}`;
 const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw new Error(`UNESCO HTTP ${response.status}: ${url}`);
 const raw=await response.text(),data=JSON.parse(raw);all.push(...data.results);
 requests.push({url,sha256:createHash('sha256').update(raw).digest('hex')});
 if(all.length>=data.total_count)break;
}
const geo=JSON.parse(await readFile('data-src/geo/ne_50m_admin_0_countries.geojson','utf8'));
const previous=await jsonOrEmpty('data-src/country-tourist-spots.json');
async function jsonOrEmpty(file){try{return JSON.parse(await readFile(file,'utf8'));}catch{return {countries:{}};}}
const countries={},missing=[];
const existing=JSON.parse(await readFile('data-src/tourist-spots.json','utf8'));
// Keep the already-reviewed landmark names in Portuguese where available.
const selected={BRA:[['Rio de Janeiro: Carioca Landscapes between the Mountain and the Sea','Rio de Janeiro: paisagens cariocas'],['Iguaçu National Park','Parque Nacional do Iguaçu']]};
for(const continent of ['africa','america','asia','europa','oceania']){
 const data=JSON.parse(await readFile(`src/data/continents/${continent}.json`,'utf8'));
 for(const country of data.paises){
  const shape=geo.features.find(f=>f.properties.ADM0_A3===country.id),iso=shape?.properties.ISO_A2_EH;
  const candidates=all.filter(site=>site.iso_codes?.includes(iso)&&site.geo_point_2d&&site.name_en?.length<=120).flatMap(site=>{
   const locations=site.coordinates?.geometry?.coordinates||[[site.geo_point_2d.lon,site.geo_point_2d.lat]];
   const inside=locations.find(p=>geoContains(shape,p));
   // A transnational site's representative location must actually be in this country.
   if(!inside&&site.iso_codes.length>1)return [];
   const [lon,lat]=inside||locations[0];return [{...site,geo_point_2d:{lon,lat}}];
  }).sort((a,b)=>Number(a.id_no)-Number(b.id_no));
  const priority=selected[country.id]||[];
  candidates.sort((a,b)=>{const ai=priority.findIndex(p=>p[0]===a.name_en),bi=priority.findIndex(p=>p[0]===b.name_en);return (ai<0?99:ai)-(bi<0?99:bi);});
  const spots=candidates.slice(0,2).map(site=>({id:`unesco-${site.id_no}`,nome:priority.find(p=>p[0]===site.name_en)?.[1]||site.name_en,descricaoCurta:'Este lugar faz parte do Patrimônio Mundial da UNESCO.',coordenadas:{lat:site.geo_point_2d.lat,lng:site.geo_point_2d.lon},fontes:['unesco-country-sites'],saibaMaisUrl:`https://whc.unesco.org/en/list/${site.id_no}/`}));
  // Existing reviewed continent landmarks are valid country candidates when inside that country.
  const reviewed=Object.values(existing.continents).flat().filter(spot=>geoContains(shape,[spot.coordenadas.lng,spot.coordenadas.lat]));
  for(const spot of reviewed.slice().reverse()){
   if(spots.some(p=>p.nome===spot.nome||Math.hypot(p.coordenadas.lat-spot.coordenadas.lat,p.coordenadas.lng-spot.coordenadas.lng)<0.05))continue;
   spots.unshift(spot);if(spots.length>2)spots.pop();
  }
  const supplemental=previous.countries?.[country.id]?.filter(p=>p.fontes.some(source=>['wikidata-country-sites','tourism-official-sites'].includes(source)));
  countries[country.id]=supplemental?.length?supplemental:spots;if(!countries[country.id].length)missing.push(country.id);
 }
}
await mkdir('data-src/points',{recursive:true});
await writeFile('data-src/points/unesco-country-sites.json',JSON.stringify({version:1,retrievedOn:'2026-11-05',license:'CC-BY-SA-4.0',source:'https://data.unesco.org/explore/assets/whc001/',requests,records:all},null,2)+'\n');
await writeFile('data-src/country-tourist-spots.json',JSON.stringify({version:1,retrievedOn:'2026-11-05',countries,missing},null,2)+'\n');
console.log(`${Object.values(countries).filter(p=>p.length).length} países com pontos; sem ponto confirmado: ${missing.join(', ')}`);
