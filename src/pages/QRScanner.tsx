import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useApp, activeCollectionRepository } from '../hooks/useApp';
import { discoverFromQR } from '../services/discovery';
import { asset } from '../services/contentRepository';
import { startQRScanLoop } from '../services/qrScanLoop';
type Decoder=(data:Uint8ClampedArray,width:number,height:number,options?:{inversionAttempts:string})=>{data:string}|null;
let decoderPromise:Promise<Decoder>|undefined;
function loadDecoder(){return decoderPromise??=new Promise((resolve,reject)=>{const existing=(window as Window&{jsQR?:Decoder}).jsQR;if(existing){resolve(existing);return;}const script=document.createElement('script');script.src=asset('vendor/jsQR-1.4.0.js');script.onload=()=>{const decode=(window as Window&{jsQR?:Decoder}).jsQR;if(decode)resolve(decode);else{decoderPromise=undefined;reject(new Error('Leitor indisponível.'));}};script.onerror=()=>{decoderPromise=undefined;reject(new Error('Falha ao carregar o leitor.'));};document.head.append(script);});}
export default function QRScanner(){
 const {id}=useParams(),app=useApp(),navigate=useNavigate(),c=app.continents.find(c=>c.id===id);
 const video=useRef<HTMLVideoElement>(null),stop=useRef<()=>void>(()=>{}),[attempt,setAttempt]=useState(0),[status,setStatus]=useState('Preparando o leitor…'),[error,setError]=useState(false);
 useEffect(()=>{
  if(!c)return;let active=true,disposed=false,stream:MediaStream|undefined,stopLoop=()=>{};
  const close=()=>{active=false;stopLoop();stream?.getTracks().forEach(t=>t.stop());if(video.current)video.current.srcObject=null;};stop.current=()=>{disposed=true;close();};
  const fail=(e:unknown)=>{if(disposed)return;close();const name=e instanceof DOMException?e.name:'';setError(true);setStatus(name==='NotAllowedError'?'Câmera bloqueada. No ícone de permissões do navegador, autorize a câmera para este site e tente novamente.':name==='NotFoundError'?'Não encontramos uma câmera neste aparelho. Peça ajuda ao professor.':e instanceof Error?e.message:'Não foi possível abrir a câmera. Feche outros apps e tente novamente.');};
  async function discover(text:string){
   close();
   try{
    const result=await discoverFromQR(activeCollectionRepository(),text,c!.id,import.meta.env.VITE_PUBLIC_URL||new URL(import.meta.env.BASE_URL,location.origin).href);
    if(disposed)return;
    if(result.ok){await app.refresh();if(!disposed)navigate(`/continente/${c!.id}`,{replace:true,state:{discovered:true}});}
    else{setStatus(result.reason);setError(true);}
   }catch(e){fail(e);}
  }
  async function start(){
   try{
    if(!window.isSecureContext)throw new Error('Abra o site por HTTPS para usar a câmera.');
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('Este navegador não oferece acesso à câmera.');
    setError(false);setStatus('Autorize a câmera quando o navegador pedir.');
    const decode=await loadDecoder();if(!active)return;
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280}},audio:false});
    if(!active){stream.getTracks().forEach(t=>t.stop());return;}
    const el=video.current;if(!el){close();return;}el.srcObject=stream;await el.play();if(!active)return;
    setStatus('Coloque o QR Code inteiro dentro da moldura.');
    const canvas=document.createElement('canvas'),context=canvas.getContext('2d',{willReadFrequently:true});if(!context)throw new Error('O navegador não consegue processar a câmera.');
    stopLoop=startQRScanLoop(()=>{
     if(el.readyState<2||el.videoWidth===0||el.videoHeight===0)return null;
     const width=Math.min(640,el.videoWidth),height=Math.round(el.videoHeight*width/el.videoWidth);
     if(canvas.width!==width)canvas.width=width;
     if(canvas.height!==height)canvas.height=height;
     context.drawImage(el,0,0,width,height);const pixels=context.getImageData(0,0,width,height);
     return decode(pixels.data,width,height,{inversionAttempts:'dontInvert'})?.data||null;
    },text=>{void discover(text);},()=>fail(new Error('Não foi possível ler a câmera. Tente novamente.')));
   }catch(e){if(active)fail(e);}
  }
  void start();const visibility=()=>{if(document.hidden&&active){close();setError(true);setStatus('Leitura pausada. Toque em Tentar novamente para continuar.');}};document.addEventListener('visibilitychange',visibility);return()=>{disposed=true;close();document.removeEventListener('visibilitychange',visibility);};
 },[c?.id,attempt]);
 if(!c)return <Navigate to="/mapa" replace/>;
 return <main className="narrow scanner-page"><span className="eyebrow">Descobrir {c.nome}</span><h1>Encontre o QR<br/>de {c.nome}</h1><div className={`scanner ${error?'scanner-error':''}`}><video ref={video} muted playsInline aria-label="Câmera para leitura do QR Code"/><div className="scan-guide" aria-hidden="true"/></div><p className={`notice ${error?'camera-error':''}`} role={error?'alert':'status'}>{status}</p>{error&&<img className="guide-image" src={asset(c.dicaQr?.imagem||'images/guia-qr.svg')} alt="O QR fica ao lado do marcador preto na folha do continente"/>}<p className="micro">Procure o QR ao lado do marcador preto na folha de {c.nome}. Use boa iluminação e evite reflexos.</p><div className="actions">{error&&<button className="button primary" onClick={()=>setAttempt(n=>n+1)}>Tentar novamente</button>}<button className="button secondary" onClick={()=>{stop.current();navigate('/mapa');}}>Cancelar</button><Link className="button secondary" onClick={()=>stop.current()} to="/mapa">Voltar ao mapa</Link></div></main>;
}
