import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './hooks/useApp';
import { JourneyProvider, useJourney, entryRedirect } from './hooks/useJourney';
import { Navigation } from './components/Navigation';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { JourneyLoading } from './components/JourneyLoading';
const Home=lazy(()=>import('./pages/Home'));
const Orientation=lazy(()=>import('./pages/Orientation'));
const Collection=lazy(()=>import('./pages/Collection'));
const Continent=lazy(()=>import('./pages/Continent'));
const QRScanner=lazy(()=>import('./pages/QRScanner'));
const ARExperience=lazy(()=>import('./pages/ARExperience'));
const Countries=lazy(()=>import('./pages/Countries'));
const Activity=lazy(()=>import('./pages/Activity'));
const Completion=lazy(()=>import('./pages/Completion'));
const Settings=lazy(()=>import('./pages/Settings'));
const Organizer=lazy(()=>import('./pages/Organizer'));
function Shell(){
 const app=useApp(),location=useLocation(),journey=useJourney();
 const [fontsReady,setFontsReady]=useState(false);
 useEffect(()=>{let active=true;void Promise.allSettled([document.fonts.load('500 20px Fredoka'),document.fonts.load('500 16px Nunito')]).finally(()=>{if(active)setFontsReady(true);});return()=>{active=false;};},[]);
 const ready=app.ready&&fontsReady;
 const redirect=entryRedirect(location.pathname,journey.role,journey.instructed,app.organizerPreview);
 const entry=location.pathname==='/'||(location.pathname==='/organizador'&&!app.organizerPreview);
 const mapScreen=location.pathname==='/mapa'||location.pathname==='/orientacao';
 useEffect(()=>{window.scrollTo(0,0);document.getElementById('content')?.focus({preventScroll:true});},[location.pathname]);
 return <div className={`app-shell${entry?' entry-shell':''}${mapScreen?' map-shell':''}${!ready?' startup-shell':''}`}>
  {ready&&<><a className="skip-link" href="#content" onClick={e=>{e.preventDefault();const content=document.getElementById('content');content?.focus({preventScroll:true});content?.scrollIntoView({block:'start'});}}>Pular para o conteúdo</a>{location.pathname!=='/'&&!redirect&&<Navigation minimal={entry} publicView={location.state?.organizerPublicView===true}/>}</>}
  {app.warning&&<div className="global-warning" role="status">{app.warning}</div>}
  {app.organizerPreview&&location.state?.organizerPublicView!==true&&<div className="global-warning organizer-preview-notice" role="status">Modo ADM ativo: os seis continentes estão liberados durante esta sessão. O progresso dos alunos não foi alterado.</div>}
  <div id="content" tabIndex={-1}><Suspense fallback={<JourneyLoading />}>
   {ready?(redirect?<Navigate to={redirect} replace/>:<Routes>
    <Route path="/" element={<Home/>}/><Route path="/orientacao" element={<Orientation/>}/>
    <Route path="/mapa" element={<Collection/>}/><Route path="/continente/:id" element={<Continent/>}/>
    <Route path="/qr/:id" element={<QRScanner/>}/><Route path="/ar/:id/:countryId" element={<ARExperience/>}/><Route path="/ar/:id" element={<ARExperience/>}/>
    <Route path="/paises/:id" element={<Countries/>}/><Route path="/paises/:id/:countryId" element={<Countries/>}/>
    <Route path="/atividade/:id" element={<Activity/>}/><Route path="/conclusao" element={<Completion/>}/>
    <Route path="/configuracoes" element={<Settings/>}/>
    <Route path="/organizador" element={<Organizer passwordHash={import.meta.env.VITE_ORGANIZER_PASSWORD_HASH}/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
   </Routes>):<JourneyLoading progress />}
  </Suspense></div>
  {ready&&<footer className="site-footer"><a href={`${import.meta.env.BASE_URL}fontes.html`} target="_blank" rel="noopener noreferrer">Fontes e licenças ↗</a></footer>}
 </div>;
}
export default function App(){return <AppErrorBoundary><AppProvider><HashRouter><JourneyProvider><Shell/></JourneyProvider></HashRouter></AppProvider></AppErrorBoundary>;}
