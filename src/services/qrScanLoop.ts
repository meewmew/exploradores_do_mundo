interface FrameScheduler {
 request(callback:FrameRequestCallback):number;
 cancel(handle:number):void;
}

export function startQRScanLoop(
 readCode:()=>string|null,
 onCode:(code:string)=>void,
 onError:(error:unknown)=>void,
 scheduler:FrameScheduler={request:callback=>requestAnimationFrame(callback),cancel:handle=>cancelAnimationFrame(handle)},
){
 let active=true,handle=0,last=-Infinity;
 const stop=()=>{active=false;scheduler.cancel(handle);};
 const frame=(now:number)=>{
  if(!active)return;
  try{
   if(now-last>=150){
    last=now;
    const code=readCode();
    if(code){stop();onCode(code);return;}
   }
   handle=scheduler.request(frame);
  }catch(error){stop();onError(error);}
 };
 handle=scheduler.request(frame);
 return stop;
}
