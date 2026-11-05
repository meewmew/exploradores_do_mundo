import type { ContinentId } from '../types/continent';
const types=['ar:ready','ar:camera-denied','ar:camera-error','ar:marker-found','ar:marker-lost','ar:model-loaded','ar:model-error','ar:point-selected','ar:stopped'] as const;
export interface ARMessage {app:'exploradores-ar';version:1;type:typeof types[number];payload?:Record<string,unknown>}
export function receiveARMessage(event:MessageEvent,source:Window|null,origin:string,selected:ContinentId):ARMessage|null{
 if(!source||event.origin!==origin||event.source!==source||!event.data||typeof event.data!=='object')return null;
 const m=event.data as Record<string,unknown>;
 if(m.app!=='exploradores-ar'||m.version!==1||!(types as readonly unknown[]).includes(m.type))return null;
 if(m.payload!==undefined&&(!m.payload||typeof m.payload!=='object'||Array.isArray(m.payload)))return null;
 const p=m.payload as Record<string,unknown>|undefined;
 if(m.type==='ar:marker-found'&&(!p||p.continentId!==selected||typeof p.stableMs!=='number'||!Number.isFinite(p.stableMs)||p.stableMs<500))return null;
 if(m.type==='ar:marker-lost'&&p?.continentId!==selected)return null;
 if(m.type==='ar:point-selected'&&(!p||p.continentId!==selected||typeof p.pointId!=='string'||!/^[a-z0-9-]{1,100}$/.test(p.pointId)))return null;
 if(m.type==='ar:camera-error'&&p?.code!==undefined&&typeof p.code!=='string')return null;
 return m as unknown as ARMessage;
}
export function sendARMessage(target:Window|null,type:'ar:reset'|'ar:set-scale'|'ar:rotate'|'ar:select-point'|'ar:stop',payload?:Record<string,unknown>){target?.postMessage({app:'exploradores-ar',version:1,type,payload},window.location.origin);}
