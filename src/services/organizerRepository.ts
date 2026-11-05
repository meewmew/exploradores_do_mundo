import { validateOverrides, type ContentOverrides } from './contentSchema';
import type { Activity, Continent, Country, SchoolYear } from '../types/continent';
import { defaultActivities } from './activities';
export const emptyOverrides=():ContentOverrides=>({version:1,continents:{},countries:{},activities:[]});
export function descriptionForEditing(continent:Continent,draft:ContentOverrides,year:SchoolYear){
 const patch=draft.continents[continent.id];
 return patch?.variantesPorAno?.[year]?.descricao||(year!=='geral'?continent.variantesPorAno?.[year]?.descricao:undefined)||patch?.variantesPorAno?.geral?.descricao||patch?.descricao||continent.variantesPorAno?.geral?.descricao||continent.descricao;
}
export function activitiesForEditing(continent:Continent,continents:Continent[],published:Activity[],draft:ContentOverrides){
 const candidates=[...draft.activities,...published,...defaultActivities(continent,continents)].filter(a=>a.continentId===continent.id);
 return candidates.filter((activity,index)=>candidates.findIndex(a=>a.id===activity.id)===index);
}
export function sourcesForCountryDraft(country:Country,draft:ContentOverrides,additional:string[]){
 return mergeSources(draft.countries?.[country.id]?.fontes??country.fontes,additional);
}
export function mergeSources(existing:string[]|undefined,additional:string[]){
 return [...new Set([...(existing??[]),...additional])];
}
const key='exploradores:organizer:v1';
export function loadDraft(sources:string[]):{draft:ContentOverrides;warning?:string}{
 try{const text=localStorage.getItem(key);if(!text)return {draft:emptyOverrides()};const draft=validateOverrides(JSON.parse(text),sources);return draft?{draft}:{draft:emptyOverrides(),warning:'O rascunho salvo era inválido e foi ignorado.'};}
 catch{return {draft:emptyOverrides(),warning:'O navegador não permite guardar o rascunho local.'};}
}
export function saveDraft(draft:ContentOverrides){try{localStorage.setItem(key,JSON.stringify(draft));return true;}catch{return false;}}
export function exportDraft(draft:ContentOverrides){const url=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='content-overrides.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
