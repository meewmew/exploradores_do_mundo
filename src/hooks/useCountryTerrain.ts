import { useEffect, useState } from 'react';
import { COUNTRY_TERRAIN_VERSION } from '../services/countryTerrainVersion';
import { asset } from '../services/contentRepository';
import { parseCountryTerrain, type CountryTerrainConfig } from '../services/countryTerrain';
import type { Country, Continent } from '../types/continent';
export function useCountryTerrain(continent:Continent|undefined,country:Country|undefined){
 const [attempt,setAttempt]=useState(0);
 const [result,setResult]=useState<{key:string;config?:CountryTerrainConfig;error?:string}>({key:''});
 const key=country?.modelo&&continent?`${continent.id}/${country.id}/${country.modelo.arquivo}`:'';
 useEffect(()=>{
  if(!key||!country||!continent)return;
  let active=true;const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),10000);
  void fetch(asset(`content/countries/${country.id}-terrain.json`)+`?v=${COUNTRY_TERRAIN_VERSION}`,{signal:controller.signal}).then(async response=>{
   if(!response.ok)throw new Error('Metadados do relevo indisponíveis');
   const config=parseCountryTerrain(await response.json(),country,continent.id);
   if(!config)throw new Error('Dados do relevo inválidos');if(active)setResult({key,config});
  }).catch(()=>{if(active)setResult({key,error:'Não foi possível carregar os detalhes do relevo. Tente novamente.'});}).finally(()=>clearTimeout(timer));
  return()=>{active=false;controller.abort();clearTimeout(timer);};
 },[key,attempt,continent,country]);
 const current=result.key===key?result:undefined;
 return {config:current?.config,error:current?.error,loading:!!key&&!current,retry:()=>{setResult({key:''});setAttempt(n=>n+1);}};
}
