import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Continent } from '../types/continent';
import { AR_SCENE_VERSION, receiveARMessage, sendARMessage, type ARMessage } from '../services/arBridge';
import { arSceneQuery } from '../services/arTarget';
import { asset } from '../services/contentRepository';
export function ARFrame({continent,onMessage,onWindow,session=0,modelFile,countryId,modelName,children,fullscreen=false,onExitFullscreen}:{continent:Continent;onMessage:(message:ARMessage)=>void;onWindow:(target:Window|null)=>void;session?:number;modelFile?:string;countryId?:string;modelName?:string;children?:ReactNode;fullscreen?:boolean;onExitFullscreen?:()=>void}){
 const host=useRef<HTMLDivElement>(null),callback=useRef(onMessage),windowCallback=useRef(onWindow);callback.current=onMessage;windowCallback.current=onWindow;
 const overlay=useRef<HTMLDivElement>(null),[layer,setLayer]=useState<HTMLDivElement|null>(null);
 const expanded=useRef(fullscreen),exitFullscreen=useRef(onExitFullscreen),toggleFocus=useRef<HTMLElement|null>(null);expanded.current=fullscreen;exitFullscreen.current=onExitFullscreen;
 const reposition=useRef<()=>void>(()=>{});
 useLayoutEffect(()=>{reposition.current();});
 useLayoutEffect(()=>{
  if(!layer||!overlay.current)return;
  const fit=()=>{if(host.current&&overlay.current){if(!expanded.current)host.current.style.height=`${overlay.current.getBoundingClientRect().height}px`;reposition.current();}};
  const observer=new ResizeObserver(fit);observer.observe(overlay.current);fit();
  return()=>observer.disconnect();
 },[layer]);
 useLayoutEffect(()=>{
  if(!layer)return;
  layer.classList.toggle('ar-expanded',fullscreen);reposition.current();
  if(!fullscreen)return;
  toggleFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  const root=document.getElementById('root'),wasInert=root?.inert??false;if(root)root.inert=true;
  layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label',`Câmera em tela cheia: ${modelName??continent.nome}`);
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();exitFullscreen.current?.();}};
  window.addEventListener('keydown',escape);
  return()=>{document.body.style.overflow=overflow;if(root)root.inert=wasInert;layer.removeAttribute('role');layer.removeAttribute('aria-modal');layer.removeAttribute('aria-label');window.removeEventListener('keydown',escape);toggleFocus.current?.focus({preventScroll:true});};
 },[layer,fullscreen,modelName,continent.nome]);
 useLayoutEffect(()=>{
  // O iframe nasce fora da árvore React e não é movido: mover um iframe pode
  // recriar seu documento, impedindo a confirmação de teardown.
  const layer=document.createElement('div');layer.className='ar-layer';document.body.append(layer);
  const frame=document.createElement('iframe');frame.allow='camera; fullscreen';frame.title=`Realidade aumentada de ${modelName??continent.nome}`;
  frame.src=`${asset('ar/scene.html')}?v=${AR_SCENE_VERSION}&${arSceneQuery(continent.id,modelFile??continent.modelo.arquivo,countryId)}`;
  let stopping=false,timer:ReturnType<typeof setTimeout>|undefined;
  frame.onload=()=>{if(stopping)sendARMessage(frame.contentWindow,'ar:stop');};
  const remove=()=>{if(timer)clearTimeout(timer);window.removeEventListener('message',listener);layer.remove();};
  const listener=(event:MessageEvent)=>{const message=receiveARMessage(event,frame.contentWindow,location.origin,continent.id);if(!message)return;if(message.type==='ar:stopped'){remove();return;}if(!stopping)callback.current(message);};
  const position=()=>{if(expanded.current){Object.assign(layer.style,{left:'0px',top:'0px',width:'100%',height:`${window.visualViewport?.height||window.innerHeight}px`});return;}const rect=host.current?.getBoundingClientRect();if(rect)Object.assign(layer.style,{left:`${rect.left+window.scrollX}px`,top:`${rect.top+window.scrollY}px`,width:`${rect.width}px`,height:`${rect.height}px`});};
  reposition.current=position;const observer=new ResizeObserver(position);if(host.current)observer.observe(host.current);window.addEventListener('resize',position);window.visualViewport?.addEventListener('resize',position);window.addEventListener('scroll',position,{passive:true,capture:true});
  window.addEventListener('message',listener);layer.append(frame);setLayer(layer);position();windowCallback.current(frame.contentWindow);
  return()=>{
   stopping=true;observer.disconnect();window.removeEventListener('resize',position);window.visualViewport?.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);reposition.current=()=>{};windowCallback.current(null);
   layer.hidden=true;sendARMessage(frame.contentWindow,'ar:stop');
   timer=setTimeout(()=>{console.warn('AR: sem confirmação de parada em 1500 ms; removendo iframe.');remove();},1500);
  };
 },[continent.id,continent.modelo.arquivo,modelFile,countryId,modelName,session]);
 const content=<div ref={overlay} className="ar-overlay">{children}</div>;
 return <><div ref={host} className="ar-frame">{!layer&&content}</div>{layer&&createPortal(content,layer)}</>;
}
