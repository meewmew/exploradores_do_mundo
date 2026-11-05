export interface ARTransform {scale:number;rotation:number;tilt:number}
export interface ARPointer {id:number;x:number;y:number}
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const finite=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value);
export const initialARTransform=():ARTransform=>({scale:1,rotation:0,tilt:0});

export function updateARGesture(current:ARTransform,previous:ARPointer[],next:ARPointer[]):ARTransform{
 if(previous.length!==next.length||next.length<1||next.length>2)return current;
 const before=next.map(point=>previous.find(item=>item.id===point.id));
 if(before.some(point=>!point)||[...previous,...next].some(point=>!finite(point.x)||!finite(point.y)))return current;
 const first=before[0]!;
 if(next.length===1)return {...current,rotation:current.rotation+(next[0].x-first.x)*.4,tilt:clamp(current.tilt+(next[0].y-first.y)*.15,-20,20)};
 const second=before[1]!;
 const oldDistance=Math.hypot(second.x-first.x,second.y-first.y);
 const distance=Math.hypot(next[1].x-next[0].x,next[1].y-next[0].y);
 if(oldDistance<1||distance<1)return current;
 const oldAngle=Math.atan2(second.y-first.y,second.x-first.x);
 const angle=Math.atan2(next[1].y-next[0].y,next[1].x-next[0].x)-oldAngle;
 const rotationDelta=Math.atan2(Math.sin(angle),Math.cos(angle))*180/Math.PI;
 return {...current,scale:clamp(current.scale*distance/oldDistance,.5,3),rotation:current.rotation+rotationDelta};
}

export function applyARTransformAction(current:ARTransform,type:string,payload:Record<string,unknown>={}):ARTransform{
 if(type==='ar:reset')return initialARTransform();
 if(type==='ar:rotate'&&finite(payload.degrees))return {...current,rotation:current.rotation+clamp(payload.degrees,-180,180)};
 if(type==='ar:set-scale'){
  const scale=finite(payload.scale)?payload.scale:finite(payload.delta)?current.scale+payload.delta:undefined;
  if(scale!==undefined)return {...current,scale:clamp(scale,.5,3)};
 }
 return current;
}
