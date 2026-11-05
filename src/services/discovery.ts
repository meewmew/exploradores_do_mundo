import type { CollectionRepository } from './collectionRepository';
import { isContinentId } from './collectionRepository';
import type { ContinentId } from '../types/continent';
export function validateQR(text:string,selected:ContinentId,baseUrl:string):{ok:true;id:ContinentId}|{ok:false;reason:string}{
 try {
  const url=new URL(text),base=new URL(baseUrl),id=url.searchParams.get('continente');
  if(url.origin!==base.origin||url.pathname!==base.pathname||!isContinentId(id)||url.searchParams.getAll('continente').length!==1)return {ok:false,reason:'Este QR não pertence a esta exploração.'};
  if(id!==selected)return {ok:false,reason:'Este QR é de outro continente.'};
  return {ok:true,id};
 }catch{return {ok:false,reason:'Não foi possível ler um endereço válido. Tente novamente.'};}
}
export async function discoverFromQR(repo:CollectionRepository,text:string,selected:ContinentId,baseUrl:string){const result=validateQR(text,selected,baseUrl);if(result.ok)await repo.unlock(result.id);return result;}
export async function discoverFromMarker(repo:CollectionRepository,selected:ContinentId,payload:unknown){
 if(!payload||typeof payload!=='object')return false;
 const p=payload as Record<string,unknown>;
 if(p.continentId!==selected||typeof p.stableMs!=='number'||!Number.isFinite(p.stableMs)||p.stableMs<500)return false;
 await repo.unlock(selected);return true;
}
export function continentFromURL(search:string):ContinentId|undefined{const id=new URLSearchParams(search).get('continente');return isContinentId(id)?id:undefined;}
