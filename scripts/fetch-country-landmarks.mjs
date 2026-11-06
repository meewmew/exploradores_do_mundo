import { readFile, writeFile } from 'node:fs/promises';
import { geoContains } from 'd3-geo';
const json=async f=>JSON.parse(await readFile(f,'utf8'));
const chosen=await json('data-src/points/country-landmarks.json'),geo=await json('data-src/geo/ne_50m_admin_0_countries.geojson'),spots=await json('data-src/country-tourist-spots.json');
const norm=s=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const previous=await json('data-src/points/wikidata-country-sites.json').catch(()=>({evidence:{}}));
const evidence=previous.evidence,unresolved=[];
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
for(const [countryId,[query,name]]of Object.entries(chosen)){
 if(evidence[countryId])continue;
 await delay(1800);
 const shape=geo.features.find(f=>f.properties.ADM0_A3===countryId),countryQ=shape.properties.WIKIDATAID;
 try{
 const searchUrl=`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json`;
 const response=await fetch(searchUrl,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);
 const search=await response.json();const exact=search.search?.find(item=>[item.label,item.match?.text].some(text=>text&&norm(text)===norm(query)));
 const result=exact||search.search?.[0];
 if(!result)throw new Error('Nenhuma entidade com nome exato');
 const url=`https://www.wikidata.org/wiki/Special:EntityData/${result.id}.json`,res=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!res.ok)throw new Error(`HTTP ${res.status}`);
 const entity=(await res.json()).entities[result.id],coordinates=entity.claims.P625?.filter(s=>s.rank!=='deprecated').map(s=>s.mainsnak.datavalue?.value).find(v=>v?.globe==='http://www.wikidata.org/entity/Q2');
 if(!coordinates)throw new Error('Sem coordenada terrestre');
 const countries=entity.claims.P17?.filter(s=>s.rank!=='deprecated').map(s=>s.mainsnak.datavalue?.value?.id)||[];
 if(!countries.includes(countryQ)&&!geoContains(shape,[coordinates.longitude,coordinates.latitude]))throw new Error(`País não confirmado: ${countries}`);
 const point={id:`wikidata-${result.id.toLowerCase()}`,nome:exact?name:(entity.labels.pt?.value||entity.labels.en?.value||result.label),descricaoCurta:`Este lugar fica em ${shape.properties.NAME_PT||shape.properties.NAME_EN}.`,coordenadas:{lat:coordinates.latitude,lng:coordinates.longitude},fontes:['wikidata-country-sites'],saibaMaisUrl:`https://www.wikidata.org/wiki/${result.id}`};
 spots.countries[countryId]=[point];
 evidence[countryId]={qid:result.id,query,searchUrl,entityDataUrl:url,revision:entity.lastrevid,label:entity.labels.en?.value,portugueseLabel:entity.labels.pt?.value,description:entity.descriptions.en?.value,countries,coordinateStatement:entity.claims.P625,countryStatements:entity.claims.P17,countryMatched:countryQ};
 console.log(`${countryId}: ${name} (${result.id})`);
 }catch(error){unresolved.push({countryId,query,reason:error.message});console.log(`${countryId}: ${error.message}`);}
}
spots.missing=Object.entries(spots.countries).filter(([,p])=>!p.length).map(([id])=>id);
await writeFile('data-src/points/wikidata-country-sites.json',JSON.stringify({version:1,retrievedOn:'2026-11-05',license:'CC0-1.0',evidence,unresolved},null,2)+'\n');
await writeFile('data-src/country-tourist-spots.json',JSON.stringify(spots,null,2)+'\n');
console.log('Sem local confirmado:',spots.missing.join(', '));
