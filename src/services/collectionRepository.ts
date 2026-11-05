import { CONTINENT_IDS, SCHOOL_YEARS, type ContinentId, type SchoolYear } from '../types/continent';
export interface CollectionRepository {
 getUnlocked():Promise<ContinentId[]>;isUnlocked(id:ContinentId):Promise<boolean>;unlock(id:ContinentId):Promise<void>;
 completeActivity(activityId:string):Promise<void>;getCompletedActivities():Promise<string[]>;
 getProfile():Promise<{anoEscolar?:SchoolYear}>;setProfile(p:{anoEscolar:SchoolYear}):Promise<void>;reset():Promise<void>;
}
export interface StoragePort {getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void}
interface Progress {unlocked:ContinentId[];activities:string[];profile:{anoEscolar?:SchoolYear}}
const empty = ():Progress=>({unlocked:[],activities:[],profile:{}});
export const isContinentId=(value:unknown):value is ContinentId=>typeof value==='string'&&(CONTINENT_IDS as readonly string[]).includes(value);
export class LocalStorageRepository implements CollectionRepository {
 readonly key='exploradores:v1'; private memory:Progress=empty(); private storage?:StoragePort;
 isPersistent=true;
 constructor(storage?:StoragePort) {
  try {this.storage=storage??globalThis.localStorage;if(!this.storage){this.isPersistent=false;return;}this.read();this.storage?.setItem('exploradores:probe','1');this.storage?.removeItem('exploradores:probe');}
  catch {this.isPersistent=false;this.storage=undefined;}
 }
 private read():Progress {
  if(!this.storage)return this.memory;
  let text:string|null;
  try {text=this.storage.getItem(this.key);}
  catch {this.storage=undefined;this.isPersistent=false;return this.memory;}
  try {
   const raw:unknown=JSON.parse(text||'null');
   if(!raw||typeof raw!=='object'){this.memory=empty();return this.memory;}
   const o=raw as Record<string,unknown>;const p=o.profile as Record<string,unknown>|undefined;
   this.memory={unlocked:Array.isArray(o.unlocked)?[...new Set(o.unlocked.filter(isContinentId))]:[],activities:Array.isArray(o.activities)?[...new Set(o.activities.filter((a):a is string=>typeof a==='string'&&/^[a-z0-9-]{1,100}$/.test(a)))]:[],profile:p&&typeof p.anoEscolar==='string'&&(SCHOOL_YEARS as readonly string[]).includes(p.anoEscolar)?{anoEscolar:p.anoEscolar as SchoolYear}:{}};
   return this.memory;
  }catch{return this.memory;}
 }
 private write(progress:Progress){this.memory=progress;try{this.storage?.setItem(this.key,JSON.stringify(progress));}catch{this.storage=undefined;this.isPersistent=false;}}
 async getUnlocked(){return [...this.read().unlocked];}
 async isUnlocked(id:ContinentId){return this.read().unlocked.includes(id);}
 async unlock(id:ContinentId){if(!isContinentId(id))return;const p=this.read();p.unlocked=[...new Set([...p.unlocked,id])];this.write(p);}
 async completeActivity(id:string){if(!/^[a-z0-9-]{1,100}$/.test(id))return;const p=this.read();p.activities=[...new Set([...p.activities,id])];this.write(p);}
 async getCompletedActivities(){return [...this.read().activities];}
 async getProfile(){return {...this.read().profile};}
 async setProfile(profile:{anoEscolar:SchoolYear}){if(!(SCHOOL_YEARS as readonly string[]).includes(profile.anoEscolar))return;const p=this.read();p.profile={...profile};this.write(p);}
 async reset(){this.write(empty());}
}
