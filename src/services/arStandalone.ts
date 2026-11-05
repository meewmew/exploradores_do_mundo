import { LocalStorageRepository, type StoragePort } from './collectionRepository';
export { LocalStorageRepository } from './collectionRepository';
export { discoverFromMarker } from './discovery';
export { initialARTransform, updateARGesture, applyARTransformAction } from './arGestures';

export function createStandaloneRepository(preview:boolean,storage?:StoragePort){
 if(!preview)return new LocalStorageRepository(storage);
 const values=new Map<string,string>();
 return new LocalStorageRepository({
  getItem:key=>values.get(key)??null,
  setItem:(key,value)=>{values.set(key,value);},
  removeItem:key=>{values.delete(key);},
 });
}
