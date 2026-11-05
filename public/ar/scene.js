import { createStandaloneRepository, discoverFromMarker, initialARTransform, updateARGesture, applyARTransformAction } from './domain.js';
const ids=['africa','america','antartida','asia','europa','oceania'];
const params=new URLSearchParams(location.search), id=params.get('continente'), modelPath=params.get('model');
const embedded=window.parent!==window,origin=location.origin,repo=embedded?null:createStandaloneRepository(params.get('preview')==='1');
const status=document.querySelector('#status');
status.classList.add('sr-only');
let scene,marker,model,stableTimer,foundAt=0,stopped=false,transformState=initialARTransform(),lastCameraError;
const streams=new Set();
const pointLayer=document.querySelector('#points'),pointEntries=[];
const projectionBounds={left:0,top:0,width:innerWidth,height:innerHeight};
let pointsAbort,pointsObserver,modelReady=false,selectedPointId='';
let aimObserver,cameraReady=false;
const markerAim=embedded?null:document.createElement('div');
if(markerAim){document.documentElement.classList.add('standalone-camera');markerAim.id='marker-aim';markerAim.hidden=true;markerAim.setAttribute('aria-hidden','true');markerAim.innerHTML='<div class="marker-aim-frame"><i></i><i></i><i></i><i></i><span class="marker-aim-center"></span></div>';document.body.append(markerAim);}
function positionAim(){
 if(!markerAim)return;
 const width=window.visualViewport?.width||innerWidth,height=window.visualViewport?.height||innerHeight;
 const panelTop=document.querySelector('#standalone').getBoundingClientRect().top;
 const available=Math.max(0,Math.min(height,panelTop)-24),size=Math.min(272,width*.58,available*.68);
 Object.assign(markerAim.style,{left:`${width/2}px`,top:`${12+available/2}px`,width:`${size}px`,height:`${size}px`});
}
function showAim(visible){if(markerAim){markerAim.hidden=!visible;if(visible)positionAim();}}
if(markerAim){
 if(typeof ResizeObserver==='function'){aimObserver=new ResizeObserver(positionAim);aimObserver.observe(document.querySelector('#standalone'));}
 window.addEventListener('resize',positionAim);window.visualViewport?.addEventListener('resize',positionAim);
}
const post=(type,payload)=>{if(embedded)window.parent.postMessage({app:'exploradores-ar',version:1,type,payload},origin);};
function error(type,code,text){cameraReady=false;showAim(false);status.classList.remove('sr-only');status.setAttribute('role','alert');status.textContent=text;post(type,{code});}
function trackingStatus(text){status.classList.add('sr-only');status.setAttribute('role','status');status.textContent=text;}
function updateProjectionBounds(){const rect=scene?.renderer?.domElement?.getBoundingClientRect();if(rect){projectionBounds.left=rect.left;projectionBounds.top=rect.top;projectionBounds.width=rect.width;projectionBounds.height=rect.height;}}
function hidePoints(){for(const point of pointEntries)point.button.hidden=true;}
function projectPoints(){
 if(stopped||document.hidden||!modelReady||!marker?.object3D?.visible||!scene?.camera){hidePoints();return;}
 model.object3D.updateWorldMatrix(true,false);scene.camera.updateMatrixWorld();
 for(const point of pointEntries){
  const projected=point.projected.copy(point.local).applyMatrix4(model.object3D.matrixWorld).project(scene.camera);
  const visible=Number.isFinite(projected.x)&&Number.isFinite(projected.y)&&Number.isFinite(projected.z)&&Math.abs(projected.x)<=1&&Math.abs(projected.y)<=1&&projected.z>=-1&&projected.z<=1;
  point.button.hidden=!visible;
  if(visible){const x=projectionBounds.left+(projected.x+1)*projectionBounds.width/2,y=projectionBounds.top+(1-projected.y)*projectionBounds.height/2;point.button.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;}
 }
}
function selectPoint(pointId,notify=false){
 selectedPointId=pointId;
 const selected=pointEntries.find(point=>point.data.id===pointId);
 if(!selected&&pointId!=='')return;
 for(const point of pointEntries){point.button.setAttribute('aria-pressed',String(point===selected));point.listButton?.setAttribute('aria-pressed',String(point===selected));}
 if(!embedded){const detail=document.querySelector('#point-detail');detail.hidden=!selected;if(selected){const title=document.createElement('strong'),text=document.createElement('p');title.textContent=selected.data.nome;text.textContent=selected.data.descricaoCurta;detail.replaceChildren(title,text);}}
 if(notify&&selected)post('ar:point-selected',{continentId:id,pointId:selected.data.id});
}
async function loadPoints(){
 if(!ids.includes(id)||modelPath!==`models/${id}-terrain.glb`)return;
 pointsAbort=new AbortController();
 try{
  const response=await fetch(`../content/${id}-terrain.json`,{signal:pointsAbort.signal});
  if(!response.ok)throw new Error('Dados dos lugares indisponíveis.');
  const data=await response.json();if(stopped||data.file!==modelPath||data.continentId!==id||!Array.isArray(data.points)||data.points.length!==3)return;
  for(const [index,point] of data.points.entries()){
   if(!point||typeof point.id!=='string'||!/^[a-z0-9-]{1,100}$/.test(point.id)||typeof point.nome!=='string'||typeof point.descricaoCurta!=='string'||!Array.isArray(point.posicao)||point.posicao.length!==3||!point.posicao.every(value=>typeof value==='number'&&Number.isFinite(value)))continue;
   const button=document.createElement('button');button.type='button';button.className='point-pin';button.textContent=String(index+1);button.setAttribute('aria-label',`${index+1}. ${point.nome}`);button.setAttribute('aria-pressed','false');button.hidden=true;
   button.addEventListener('click',()=>selectPoint(point.id,true));pointLayer.append(button);
   let listButton;
   if(!embedded){
    listButton=document.createElement('button');listButton.type='button';listButton.textContent=`${index+1}. ${point.nome}`;listButton.setAttribute('aria-pressed','false');listButton.addEventListener('click',()=>selectPoint(point.id));
    let choices=document.querySelector('#point-choices');
    if(!choices){choices=document.createElement('details');choices.id='point-choices';const summary=document.createElement('summary');summary.textContent='Lugares para conhecer';choices.append(summary);document.querySelector('#point-detail').before(choices);}
    choices.append(listButton);
   }
   pointEntries.push({data:point,button,listButton,local:new AFRAME.THREE.Vector3(...point.posicao),projected:new AFRAME.THREE.Vector3()});
  }
  if(selectedPointId)selectPoint(selectedPointId);
 }catch(error){if(!stopped&&error?.name!=='AbortError')console.warn('Não foi possível carregar os lugares do continente.',error);}
}
// AR.js 3.4.7 não preserva sempre o erro nativo em CustomEvent.detail.
// A interceptação mantém o código de permissão e fecha streams que chegam após sair.
if(navigator.mediaDevices?.getUserMedia){
 const nativeGetUserMedia=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
 navigator.mediaDevices.getUserMedia=async constraints=>{
  try{const stream=await nativeGetUserMedia(constraints);if(stopped){stream.getTracks().forEach(t=>t.stop());throw new DOMException('Cena encerrada','AbortError');}streams.add(stream);return stream;}
  catch(e){lastCameraError=e;if(!stopped)error(e.name==='NotAllowedError'?'ar:camera-denied':'ar:camera-error',e.name,e.name==='NotAllowedError'?'Câmera bloqueada. Autorize nas permissões do site.':'Não foi possível acessar a câmera.');throw e;}
 };
}
function transform(){if(model){const {scale,rotation,tilt}=transformState;model.setAttribute('scale',`${scale} ${scale} ${scale}`);model.setAttribute('rotation',`${tilt} ${rotation} 0`);}}
function action(type,payload={}){
 if(type==='ar:stop'){stop();return;}
 if(type==='ar:select-point'){if(typeof payload.pointId==='string')selectPoint(payload.pointId);return;}
 transformState=applyARTransformAction(transformState,type,payload);
 transform();
}
window.addEventListener('message',e=>{const m=e.data;if(!embedded||e.origin!==origin||e.source!==window.parent||!m||m.app!=='exploradores-ar'||m.version!==1||typeof m.type!=='string')return;if(m.payload!==undefined&&(!m.payload||typeof m.payload!=='object'||Array.isArray(m.payload)))return;action(m.type,m.payload);});
async function stableFound(){
 if(stopped||document.hidden||!marker?.object3D?.visible)return;
 const stableMs=performance.now()-foundAt;if(stableMs<500)return;
 const payload={continentId:id,stableMs};
 if(embedded)post('ar:marker-found',payload);else await discoverFromMarker(repo,id,payload);
 trackingStatus('Continente descoberto! O modelo acompanha a folha.');
}
function stop(){
 if(stopped){post('ar:stopped');return;}stopped=true;clearTimeout(stableTimer);
 cameraReady=false;showAim(false);aimObserver?.disconnect();window.removeEventListener('resize',positionAim);window.visualViewport?.removeEventListener('resize',positionAim);
 window.removeEventListener('resize',updateProjectionBounds);
 pointsAbort?.abort();pointsObserver?.disconnect();hidePoints();pointers.clear();
 scene?.pause();
 streams.forEach(s=>s.getTracks().forEach(t=>t.stop()));streams.clear();
 const ar=scene?.systems?.arjs?._arSession;
 const source=ar?.arSource?.domElement;
 if(source?.srcObject)source.srcObject.getTracks().forEach(t=>t.stop());
 document.querySelectorAll('video').forEach(v=>{v.srcObject?.getTracks().forEach(t=>t.stop());v.pause();v.srcObject=null;v.remove();});
 scene?.object3D?.traverse(o=>{o.geometry?.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.filter(Boolean).forEach(m=>{Object.values(m).forEach(v=>{if(v?.isTexture)v.dispose();});m.dispose();});});
 ar?.arContext?.arController?.dispose?.();
 scene?.renderer?.setAnimationLoop(null);scene?.renderer?.dispose();scene?.renderer?.forceContextLoss();scene?.remove();
 document.querySelectorAll('canvas').forEach(c=>c.remove());
 post('ar:stopped');
}
window.addEventListener('pagehide',stop);
document.addEventListener('visibilitychange',()=>{clearTimeout(stableTimer);if(document.hidden){showAim(false);scene?.pause();hidePoints();pointers.clear();}else if(!stopped){showAim(cameraReady&&!marker?.object3D?.visible);scene?.play();if(marker?.object3D?.visible){foundAt=performance.now();stableTimer=setTimeout(stableFound,510);}}});
function start(){
 if(!ids.includes(id)||(modelPath!==`models/${id}.glb`&&modelPath!==`models/${id}-terrain.glb`)){error('ar:model-error','invalid','Continente ou modelo inválido.');return;}
 const canvas=document.createElement('canvas');
 if(!isSecureContext||!navigator.mediaDevices?.getUserMedia||!(canvas.getContext('webgl2')||canvas.getContext('webgl'))){error('ar:camera-error','unsupported','É necessário HTTPS, câmera e WebGL para usar a RA.');return;}
 if(!window.AFRAME||!AFRAME.systems.arjs){error('ar:camera-error','unsupported','As bibliotecas de RA não carregaram.');return;}
 if(!AFRAME.components['exploradores-points'])AFRAME.registerComponent('exploradores-points',{tock:projectPoints});
 scene=document.createElement('a-scene');scene.setAttribute('embedded','');scene.setAttribute('vr-mode-ui','enabled: false');scene.setAttribute('renderer','antialias: true; alpha: true; precision: mediump; colorManagement: true;');
 // Marker tracking supplies the camera pose; motion-sensor access is unnecessary.
 // Disable A-Frame's iOS permission dialog before the scene is attached so it
 // cannot appear behind the parent page's instructions and gesture layer.
 scene.setAttribute('device-orientation-permission-ui','enabled: false');
 scene.setAttribute('exploradores-points','');
 // The automatic phone profile downsamples detection to 320 x 240. Small
 // barcodes then lose their inner cells, even when the preview looks large.
 scene.setAttribute('arjs','sourceType: webcam; sourceWidth: 1280; sourceHeight: 960; canvasWidth: 640; canvasHeight: 480; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3; cameraParametersUrl: ../vendor/camera_para.dat; patternRatio: 0.5; maxDetectionRate: 30;');
 marker=document.createElement('a-marker');marker.setAttribute('type','barcode');marker.setAttribute('value',String(ids.indexOf(id)));marker.setAttribute('emitevents','true');marker.setAttribute('smooth','false');
 model=document.createElement('a-entity');model.setAttribute('gltf-model',`../${modelPath}`);model.setAttribute('scale','1 1 1');marker.append(model);scene.append(marker);
 const ambient=document.createElement('a-entity');ambient.setAttribute('light','type: ambient; intensity: 1');scene.append(ambient);
 const light=document.createElement('a-entity');light.setAttribute('light','type: directional; intensity: 1.5');light.setAttribute('position','1 3 2');scene.append(light);
 const camera=document.createElement('a-entity');camera.setAttribute('camera','');camera.setAttribute('look-controls','enabled: false');scene.append(camera);
 marker.addEventListener('markerFound',()=>{if(stopped)return;showAim(false);clearTimeout(stableTimer);foundAt=performance.now();trackingStatus('Marcador encontrado. Mantenha a folha visível…');stableTimer=setTimeout(stableFound,510);});
 marker.addEventListener('markerLost',()=>{showAim(cameraReady);clearTimeout(stableTimer);foundAt=0;hidePoints();post('ar:marker-lost',{continentId:id});trackingStatus('Reposicione a folha: mantenha o marcador inteiro na câmera.');});
 model.addEventListener('model-loaded',()=>{modelReady=true;post('ar:model-loaded');});
 model.addEventListener('model-error',()=>{modelReady=false;hidePoints();error('ar:model-error','load','Não foi possível carregar o modelo.');});
 scene.addEventListener('renderstart',()=>{
  scene.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));pointsObserver=new ResizeObserver(updateProjectionBounds);pointsObserver.observe(scene.renderer.domElement);updateProjectionBounds();
  // AR.js creates its session in another renderstart listener.
  queueMicrotask(()=>{
   if(stopped)return;
   const context=scene.systems.arjs._arSession.arContext;
   // The default fixed threshold (100) loses the border as exposure changes.
   const adaptLighting=()=>{
    if(stopped)return;
    const controller=context.arController;
    controller.setThresholdMode(controller.artoolkit.AR_LABELING_THRESH_MODE_AUTO_OTSU);
   };
   if(context.arController)adaptLighting();else context.addEventListener('initialized',adaptLighting);
  });
 });
 document.body.append(scene);
 window.addEventListener('resize',updateProjectionBounds);void loadPoints();
}
window.addEventListener('camera-init',()=>{if(stopped){document.querySelectorAll('video').forEach(v=>v.srcObject?.getTracks().forEach(t=>t.stop()));return;}cameraReady=true;showAim(!marker?.object3D?.visible);post('ar:ready');trackingStatus('Aponte para o quadrado preto da folha.');});
window.addEventListener('camera-error',e=>{const err=e.detail?.error||e.detail||lastCameraError;const code=err?.name||'unknown';error(code==='NotAllowedError'?'ar:camera-denied':'ar:camera-error',code,code==='NotAllowedError'?'Câmera bloqueada. Autorize nas permissões do site.':'Não foi possível acessar a câmera.');});
const overlay=document.querySelector('#gestures'),pointers=new Map();
overlay.addEventListener('pointerdown',e=>{
 if(stopped||(e.pointerType==='mouse'&&e.button!==0))return;
 pointers.set(e.pointerId,{id:e.pointerId,x:e.clientX,y:e.clientY});
 overlay.setPointerCapture(e.pointerId);
});
overlay.addEventListener('pointermove',e=>{
 if(stopped||!pointers.has(e.pointerId))return;
 e.preventDefault();
 const previous=[...pointers.values()];pointers.set(e.pointerId,{id:e.pointerId,x:e.clientX,y:e.clientY});
 transformState=updateARGesture(transformState,previous,[...pointers.values()]);transform();
},{passive:false});
const release=e=>{pointers.delete(e.pointerId);if(overlay.hasPointerCapture(e.pointerId))overlay.releasePointerCapture(e.pointerId);};
overlay.addEventListener('pointerup',release);
overlay.addEventListener('pointercancel',release);
overlay.addEventListener('lostpointercapture',e=>{pointers.delete(e.pointerId);});
overlay.addEventListener('contextmenu',e=>e.preventDefault());
if(!embedded){
 document.querySelector('#standalone').style.display='block';const back=document.querySelector('#back');back.href=`../?continente=${encodeURIComponent(id||'')}#/continente/${encodeURIComponent(id||'')}`;back.addEventListener('click',stop);
 document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const type=b.dataset.action;if(type==='plus')action('ar:set-scale',{delta:.25});if(type==='minus')action('ar:set-scale',{delta:-.25});if(type==='rotate')action('ar:rotate',{degrees:30});if(type==='reset')action('ar:reset');}));
 const prompt=document.createElement('div');prompt.id='start';prompt.innerHTML='<h1>Realidade aumentada</h1><p>Separe a folha do continente. O modelo acompanhará o quadrado preto.</p><button>Iniciar câmera</button>';prompt.querySelector('button').onclick=()=>{prompt.remove();start();};document.body.append(prompt);
}else start();
