import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { Activity, Continent, ContinentId, SchoolYear } from '../types/continent';
import { CONTINENT_IDS } from '../types/continent';
import { LocalStorageRepository } from '../services/collectionRepository';
import { StaticContentRepository, baseContinents, applyOverrides } from '../services/contentRepository';
import type { ContentOverrides } from '../services/contentSchema';
import { isOrganizerSession, subscribeOrganizerSession } from '../services/organizerSession';
import { adminProgress } from '../services/adminProgress';
export const repository=new LocalStorageRepository();
interface AppState {continents:Continent[];activities:Activity[];unlocked:ContinentId[];completed:string[];year:SchoolYear;ready:boolean;warning:string;organizerPreview:boolean;progressPersistent:boolean;refresh:()=>Promise<void>;setYear:(year:SchoolYear)=>Promise<void>;previewDraft:(draft:ContentOverrides)=>void}
const AppContext=createContext<AppState|null>(null);
export function AppProvider({children}:{children:ReactNode}){
 const organizerPreview=useSyncExternalStore(subscribeOrganizerSession,isOrganizerSession,()=>false);
 const [content,setContent]=useState<{continents:Continent[];activities:Activity[]}>(()=>applyOverrides(baseContinents,null));
 const [unlocked,setUnlocked]=useState<ContinentId[]>([]),[completed,setCompleted]=useState<string[]>([]),[year,saveYear]=useState<SchoolYear>('geral');
 const [contentReady,setContentReady]=useState(false),[progressReady,setProgressReady]=useState(false),[contentWarning,setContentWarning]=useState(''),[progressPersistent,setProgressPersistent]=useState(repository.isPersistent);
 const refreshVersion=useRef(0);
 const refresh=useCallback(async()=>{
  const version=++refreshVersion.current,preview=isOrganizerSession(),current=preview?adminProgress:repository;
  const [saved,activities,profile]=await Promise.all([current.getUnlocked(),current.getCompletedActivities(),current.getProfile()]);
  // Uma leitura iniciada no ADM não pode substituir o progresso depois de sair.
  if(version!==refreshVersion.current||preview!==isOrganizerSession())return;
  setUnlocked(preview?[...CONTINENT_IDS]:saved);setCompleted(activities);saveYear(profile.anoEscolar||'geral');setProgressPersistent(repository.isPersistent);setProgressReady(true);
 },[]);
 useEffect(()=>{
  let active=true;
  void new StaticContentRepository().load().then(c=>{if(active){setContent(c);setContentWarning(c.warning||'');}}).catch(()=>{if(active)setContentWarning('Não foi possível carregar as alterações da turma. Usando as fichas originais.');}).finally(()=>{if(active)setContentReady(true);});
  return()=>{active=false;};
 },[]);
 useEffect(()=>{
  void refresh();
  const storage=(event:StorageEvent)=>{if(event.key===null||event.key===repository.key)void refresh();};
  window.addEventListener('storage',storage);const unsubscribe=subscribeOrganizerSession(()=>void refresh());
  return()=>{++refreshVersion.current;window.removeEventListener('storage',storage);unsubscribe();};
 },[refresh]);
 const setYear=async(value:SchoolYear)=>{await activeCollectionRepository().setProfile({anoEscolar:value});await refresh();};
 const warning=[contentWarning,!progressPersistent&&'Seu progresso não será salvo ao fechar este navegador.'].filter(Boolean).join(' ');
 return <AppContext.Provider value={{...content,unlocked,completed,year,ready:contentReady&&progressReady,warning,organizerPreview,progressPersistent,refresh,setYear,previewDraft:d=>{setContent(applyOverrides(baseContinents,d));}}}>{children}</AppContext.Provider>;
}
export function useApp(){const context=useContext(AppContext);if(!context)throw new Error('AppProvider ausente');return context;}
export const activeCollectionRepository=()=>isOrganizerSession()?adminProgress:repository;
export { safePreference } from '../services/preferences';
