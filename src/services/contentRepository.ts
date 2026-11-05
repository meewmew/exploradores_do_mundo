import type { Activity, Continent, SchoolYear } from '../types/continent';
import { continentSchema, validateOverrides, type ContentOverrides } from './contentSchema';
import { defaultActivities } from './activities';
import sourcesText from '../../SOURCES.md?raw';
export const sourceIds=[...sourcesText.matchAll(/^## \[([^\]]+)\]/gm)].map(m=>m[1]);
const modules=import.meta.glob('../data/continents/*.json',{eager:true,import:'default'});
export const baseContinents=Object.values(modules).map(c=>{
 const parsed=continentSchema.safeParse(c);if(!parsed.success)throw new Error(`Dados de continente inválidos: ${parsed.error.message}`);
 return c as Continent;
}).sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
export interface ContentRepository {load():Promise<{continents:Continent[];activities:Activity[];warning?:string}>}
export function applyOverrides(base:Continent[],overrides:ContentOverrides|null){
 const continents=base.map(c=>{
  const patch=overrides?.continents[c.id];
  return {...c,...patch,
   fichaCurta:{...c.fichaCurta,...patch?.fichaCurta},
   ...(patch?.dicaQr?{dicaQr:{...c.dicaQr,...patch.dicaQr}}:{}),
   ...(patch?.variantesPorAno?{variantesPorAno:{...c.variantesPorAno,...patch.variantesPorAno}}:{}),
   ...(patch?.saibaMais?{saibaMais:{...c.saibaMais,...patch.saibaMais}}:{}),
   paises:c.paises.map(p=>{const countryPatch=overrides?.countries?.[p.id];return {...p,...countryPatch,...(countryPatch?.saibaMais?{saibaMais:{...p.saibaMais,...countryPatch.saibaMais}}:{})};}),
  } as Continent;
 });
 const defaults=continents.flatMap(c=>defaultActivities(c,continents));
 const custom=overrides?.activities||[];
 return {continents,activities:[...defaults.filter(a=>!custom.some(c=>c.id===a.id)),...custom]};
}
export class StaticContentRepository implements ContentRepository {
 async load(){
  let overrides:ContentOverrides|null=null,warning:string|undefined;
  const controller=new AbortController();
  let timeout:ReturnType<typeof setTimeout>|undefined;
  try{
   const {response,json}=await Promise.race([
    fetch(`${import.meta.env.BASE_URL}content/overrides.json`,{signal:controller.signal}).then(async response=>({response,json:response.ok?await response.json():null})),
    new Promise<never>((_,reject)=>{timeout=setTimeout(()=>{reject(new Error('Tempo de carregamento esgotado.'));controller.abort();},5000);}),
   ]);
   if(response.ok){overrides=validateOverrides(json,sourceIds);if(!overrides)warning='Conteúdo personalizado inválido: usando as fichas originais.';}
   else if(response.status!==404)warning='Não foi possível carregar o conteúdo personalizado.';
  }catch{warning='Conteúdo personalizado indisponível: usando as fichas originais.';}
  finally{if(timeout!==undefined)clearTimeout(timeout);}
  return {...applyOverrides(baseContinents,overrides),warning};
 }
}
export const descriptionForYear=(c:Continent,year:SchoolYear)=>c.variantesPorAno?.[year]?.descricao||c.variantesPorAno?.geral?.descricao||c.descricao;
export const asset=(path:string)=>`${import.meta.env.BASE_URL}${path}`;
