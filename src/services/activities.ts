import type { Activity, Continent, ContinentId, SchoolYear } from '../types/continent';
import type { CollectionRepository } from './collectionRepository';
export function defaultActivities(c:Continent,continents:Continent[]):Activity[]{
 const i=continents.findIndex(x=>x.id===c.id),alternatives=[c,continents[(i+1)%continents.length],continents[(i+3)%continents.length]].filter((x,index,a)=>a.indexOf(x)===index).sort((a,b)=>a.id.localeCompare(b.id));
 const base:Activity[]=[{id:`${c.id}-formato`,continentId:c.id,anosEscolares:['geral'],tipo:'reconhecer-formato',enunciado:'Qual continente você acabou de conhecer?',opcoes:alternatives.map(x=>({id:x.id,texto:x.nome,silhueta:`images/silhouettes/${x.id}.svg`})),respostaCorretaId:c.id,dica:c.fichaCurta.localizacao,explicacao:`Este é o formato de ${c.nome}. ${c.fichaCurta.curiosidade}`,fontes:['natural-earth']},
 {id:`${c.id}-mapa`,continentId:c.id,anosEscolares:['geral'],tipo:'localizar-no-mapa',enunciado:`Toque no mapa onde fica ${c.nome}.`,opcoes:[],respostaCorretaId:c.id,dica:c.fichaCurta.localizacao,explicacao:`Você localizou ${c.nome}! ${c.fichaCurta.localizacao}`,fontes:['natural-earth']}];
 const years:SchoolYear[]=['1','2','3','4','5','6','7','8','9'];
 return [...base,...years.map((year):Activity=>Number(year)<=3?{...base[0],id:`${c.id}-ano-${year}`,anosEscolares:[year]}:Number(year)<=6?{...base[1],id:`${c.id}-ano-${year}`,anosEscolares:[year]}:{...base[0],id:`${c.id}-ano-${year}`,anosEscolares:[year],tipo:'multipla-escolha',enunciado:`Qual informação descreve ${c.nome}?`,opcoes:alternatives.map(x=>({id:x.id,texto:x.fichaCurta.curiosidade})),dica:c.fichaCurta.localizacao,fontes:c.fontesTexto.curiosidades||['natural-earth']})];
}
export const forYear=(activities:Activity[],year:SchoolYear)=>activities.filter(a=>a.anosEscolares.includes(year)||a.anosEscolares.includes('geral'));
export async function answerActivity(repo:CollectionRepository,activity:Activity,answer:string,revealed=false){const correct=answer===activity.respostaCorretaId;if(correct&&!revealed)await repo.completeActivity(activity.id);return correct;}
export function activityContinents(ids:string[]):ContinentId[]{return [...new Set(ids.map(id=>id.split('-')[0]).filter((id):id is ContinentId=>['africa','america','antartida','asia','europa','oceania'].includes(id)))];}
export const isExplorationComplete=(ids:ContinentId[])=>new Set(ids).size===6;
