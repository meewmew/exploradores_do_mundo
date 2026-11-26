import { createStandaloneRepository, discoverFromMarker, initialARTransform, updateARGesture, applyARTransformAction, resolveARSceneModel } from './domain.js?v=country-preview';
const ids=['africa','america','antartida','asia','europa','oceania'];
const params=new URLSearchParams(location.search), id=params.get('continente'), modelPath=params.get('model'),countryId=params.get('pais');
const markerLibrary=new URL('../vendor/ar-3.4.7.js',import.meta.url);
const sceneModel=resolveARSceneModel(id,countryId,modelPath);
const continentalTerrain=sceneModel?.kind==='continent'&&modelPath===`models/${id}-terrain.glb`,terrainVersion=modelPath?.endsWith('-terrain.glb')?new URL(import.meta.url).search:'';
const continentNames={africa:'África',america:'América',antartida:'Antártida',asia:'Ásia',europa:'Europa',oceania:'Oceania'};
const embedded=window.parent!==window,origin=location.origin,repo=embedded?null:createStandaloneRepository(params.get('preview')==='1');
const status=document.querySelector('#status');
const continentControls=sceneModel?.kind==='continent';
const countryCamera=sceneModel?.kind==='country';
const countryDistance=5;
const lateralLimit=2;
let scene,marker,model,stableTimer,foundAt=0,stopped=false,transformState=initialARTransform(),lastCameraError;
let lateralOffset,screenRight,inverseMarker,frontRotation,markerRotation,faceCameraPitch;
let facingReady=false;
let countryAnchor,countryRadius=1,countryCameraReady=false;
const markerLossDelay=650;
let trackedAnchor,markerLossTimer,markerConfirmed=false;
const streams=new Set();
const pointLayer=document.querySelector('#points'),pointEntries=[];
const projectionBounds={left:0,top:0,width:innerWidth,height:innerHeight};
let pointsAbort,pointsObserver,modelReady=false,selectedPointId='';
const post=(type,payload)=>{if(embedded)window.parent.postMessage({app:'exploradores-ar',version:1,type,payload},origin);};
function error(type,code,text){status.textContent=text;post(type,{code});}
function loadMarkerLibrary(){
 return new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=markerLibrary.href;
  script.onload=resolve;script.onerror=reject;
  document.head.append(script);
 });
}
function updateProjectionBounds(){const rect=scene?.renderer?.domElement?.getBoundingClientRect();if(rect){projectionBounds.left=rect.left;projectionBounds.top=rect.top;projectionBounds.width=rect.width;projectionBounds.height=rect.height;if(countryCamera&&modelReady)transform();}}
function hidePoints(){for(const point of pointEntries)point.button.hidden=true;}
function projectPoints(){
 if(stopped||document.hidden||!modelReady||!trackedAnchor||!scene?.camera){hidePoints();return;}
 if(marker.object3D.visible){
  const pose=marker.object3D,display=trackedAnchor.object3D;
  display.position.copy(pose.position);
  display.quaternion.copy(pose.quaternion);
  display.scale.copy(pose.scale);
  display.visible=true;
 }
 if(!trackedAnchor.object3D.visible){hidePoints();return;}
 if(!facingReady&&marker.object3D.visible){
  // Face the screen at first detection, then keep this orientation relative to the marker.
  marker.object3D.getWorldQuaternion(markerRotation).invert();
  scene.camera.getWorldQuaternion(frontRotation).premultiply(markerRotation).multiply(faceCameraPitch);
  facingReady=true;
  transform();
 }
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
 if(!continentalTerrain)return;
 pointsAbort=new AbortController();
 try{
  const response=await fetch(`../content/${id}-terrain.json`+terrainVersion,{signal:pointsAbort.signal});
  if(!response.ok)throw new Error('Dados dos lugares indisponíveis.');
  const data=await response.json();if(stopped||data.file!==modelPath||data.continentId!==id||!Array.isArray(data.points)||data.points.length>5)return;
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
  if(!embedded&&continentalTerrain&&Array.isArray(data.textOnlyPoints)&&data.textOnlyPoints.length+data.points.length<=5){
   for(const point of data.textOnlyPoints){
    if(!point||typeof point.nome!=='string'||typeof point.descricaoCurta!=='string')continue;
    let choices=document.querySelector('#text-only-places');
    if(!choices){choices=document.createElement('details');choices.id='text-only-places';const summary=document.createElement('summary');summary.textContent='Outros lugares para conhecer';choices.append(summary);document.querySelector('#point-detail').before(choices);}
    const title=document.createElement('strong'),text=document.createElement('p');title.textContent=point.nome;text.textContent=point.descricaoCurta;choices.append(title,text);
   }
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
function transform(){
 if(!model)return;
 const {scale,rotation,tilt}=transformState;
 if(countryCamera){
  const aspect=projectionBounds.width/Math.max(1,projectionBounds.height);
  const halfFrame=countryDistance*Math.tan(AFRAME.THREE.MathUtils.degToRad(25))*Math.min(1,aspect);
  model.object3D.position.copy(lateralOffset);
  model.object3D.scale.setScalar(scale*halfFrame*.8/countryRadius);
  model.object3D.quaternion.copy(faceCameraPitch);
  model.object3D.rotateY(AFRAME.THREE.MathUtils.degToRad(rotation));
  return;
 }
 const zoom=continentControls?scale*1.6:scale;
 const angle=continentalTerrain?tilt+30:tilt;
 model.object3D.position.copy(lateralOffset);
 model.object3D.scale.setScalar(zoom);
 const radians=AFRAME.THREE.MathUtils.degToRad(rotation);
 if(continentControls&&facingReady){
  model.object3D.quaternion.copy(frontRotation);
  model.object3D.rotateX(AFRAME.THREE.MathUtils.degToRad(tilt));
  model.object3D.rotateY(radians);
 }else{
  model.object3D.rotation.set(AFRAME.THREE.MathUtils.degToRad(angle),radians,0,'YXZ');
 }
}
function moveSideways(distance){
 if(countryCamera&&Number.isFinite(distance)&&countryCameraReady&&modelReady){
  lateralOffset.x=AFRAME.THREE.MathUtils.clamp(lateralOffset.x+distance,-lateralLimit,lateralLimit);
  transform();
  return;
 }
 if(!continentControls||!Number.isFinite(distance)||!modelReady||!trackedAnchor?.object3D.visible||!scene.camera)return;
 const anchor=trackedAnchor.object3D;
 anchor.updateWorldMatrix(true,false);
 scene.camera.updateWorldMatrix(true,false);
 inverseMarker.copy(anchor.matrixWorld).invert();
 // Project camera-right onto the marker plane so left/right follow the screen.
 screenRight.setFromMatrixColumn(scene.camera.matrixWorld,0).transformDirection(inverseMarker);
 screenRight.y=0;
 if(screenRight.lengthSq()<0.0001)return;
 lateralOffset.addScaledVector(screenRight.normalize(),distance).clampLength(0,lateralLimit);
 transform();
}
function revealCountry(){
 if(stopped||!countryCameraReady||!modelReady)return;
 countryAnchor.object3D.visible=true;
 status.textContent=`${sceneModel.nome} está pronto. Arraste para os lados ou ajuste o zoom e a rotação.`;
 post('ar:country-ready');
}
async function openCountryCamera(){
 let stream;
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'}}});
 }catch{return;} // The shared camera wrapper reports permission and device errors.
 if(stopped){stream.getTracks().forEach(track=>track.stop());return;}
 const video=document.createElement('video');
 video.id='country-camera';video.playsInline=true;video.muted=true;video.autoplay=true;
 video.setAttribute('aria-hidden','true');
 video.srcObject=stream;
 document.body.prepend(video);
 try{
  await video.play();
 }catch{
  stream.getTracks().forEach(track=>track.stop());streams.delete(stream);video.remove();
  if(!stopped)error('ar:camera-error','play','Não foi possível exibir a imagem da câmera.');
  return;
 }
 if(stopped)return;
 countryCameraReady=true;
 status.textContent='Câmera pronta. Carregando o modelo…';
 post('ar:ready');
 revealCountry();
}
function action(type,payload={}){
 if(type==='ar:stop'){stop();return;}
 if(type==='ar:select-point'){if(typeof payload.pointId==='string')selectPoint(payload.pointId);return;}
 if(type==='ar:move-sideways'){moveSideways(payload.distance);return;}
 if(type==='ar:reset'){
  lateralOffset?.set(0,0,0);
  facingReady=false;
 }
 transformState=applyARTransformAction(transformState,type,payload);
 transform();
}
window.addEventListener('message',e=>{const m=e.data;if(!embedded||e.origin!==origin||e.source!==window.parent||!m||m.app!=='exploradores-ar'||m.version!==1||typeof m.type!=='string')return;if(m.payload!==undefined&&(!m.payload||typeof m.payload!=='object'||Array.isArray(m.payload)))return;action(m.type,m.payload);});
async function stableFound(){
 if(stopped||document.hidden||!marker?.object3D?.visible)return;
 const stableMs=performance.now()-foundAt;if(stableMs<500)return;
 markerConfirmed=true;
 const payload={continentId:id,stableMs};
 if(embedded)post('ar:marker-found',payload);else if(sceneModel?.kind==='continent')await discoverFromMarker(repo,id,payload);
 status.textContent=sceneModel?.kind==='country'?`${sceneModel.nome} acompanha a folha de ${continentNames[id]}.`:'Continente descoberto! O modelo acompanha a folha.';
}
function disposeObject(object){object?.traverse(o=>{o.geometry?.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.filter(Boolean).forEach(m=>{Object.values(m).forEach(v=>{if(v?.isTexture)v.dispose();});m.dispose();});});}
function stop(){
 if(stopped){post('ar:stopped');return;}stopped=true;clearTimeout(stableTimer);clearTimeout(markerLossTimer);
 window.removeEventListener('resize',updateProjectionBounds);
 pointsAbort?.abort();pointsObserver?.disconnect();hidePoints();pointers.clear();
 scene?.pause();
 streams.forEach(s=>s.getTracks().forEach(t=>t.stop()));streams.clear();
 const ar=scene?.systems?.arjs?._arSession;
 const source=ar?.arSource?.domElement;
 if(source?.srcObject)source.srcObject.getTracks().forEach(t=>t.stop());
 document.querySelectorAll('video').forEach(v=>{v.srcObject?.getTracks().forEach(t=>t.stop());v.pause();v.srcObject=null;v.remove();});
 disposeObject(scene?.object3D);
 ar?.arContext?.arController?.dispose?.();
 scene?.renderer?.setAnimationLoop(null);scene?.renderer?.dispose();scene?.renderer?.forceContextLoss();scene?.remove();
 document.querySelectorAll('canvas').forEach(c=>c.remove());
 post('ar:stopped');
}
window.addEventListener('pagehide',stop);
document.addEventListener('visibilitychange',()=>{
 clearTimeout(stableTimer);clearTimeout(markerLossTimer);
 if(document.hidden){
  scene?.pause();hidePoints();pointers.clear();
  if(trackedAnchor)trackedAnchor.object3D.visible=false;
 }else if(!stopped){
  scene?.play();
  if(marker?.object3D?.visible){foundAt=performance.now();stableTimer=setTimeout(stableFound,510);}
 }
});
async function start(){
 if(!sceneModel){error('ar:model-error','invalid','Continente, país ou modelo inválido. Volte à ficha e tente novamente.');return;}
 if(sceneModel.kind==='country'&&!embedded&&params.get('preview')!=='1'&&!await repo.isUnlocked(id)){error('ar:model-error','locked','Descubra este continente antes de conhecer os países. Volte ao mapa e encontre a folha.');return;}
 if(stopped)return;
 const canvas=document.createElement('canvas');
 if(!isSecureContext||!navigator.mediaDevices?.getUserMedia||!(canvas.getContext('webgl2')||canvas.getContext('webgl'))){error('ar:camera-error','unsupported','É necessário HTTPS, câmera e WebGL para usar a RA.');return;}
 if(!window.AFRAME){error('ar:camera-error','unsupported','As bibliotecas de RA não carregaram.');return;}
 try{
  if(!countryCamera&&!AFRAME.systems.arjs)await loadMarkerLibrary();
 }catch{
  if(!stopped)error('ar:camera-error','unsupported','As bibliotecas de RA não carregaram.');
  return;
 }
 if(stopped)return;
 if(!AFRAME.components['exploradores-points'])AFRAME.registerComponent('exploradores-points',{tock:projectPoints});
 lateralOffset=new AFRAME.THREE.Vector3();
 screenRight=new AFRAME.THREE.Vector3();
 inverseMarker=new AFRAME.THREE.Matrix4();
 frontRotation=new AFRAME.THREE.Quaternion();
 markerRotation=new AFRAME.THREE.Quaternion();
 faceCameraPitch=new AFRAME.THREE.Quaternion().setFromAxisAngle(new AFRAME.THREE.Vector3(1,0,0),Math.PI/2);
 scene=document.createElement('a-scene');scene.setAttribute('embedded','');scene.setAttribute('vr-mode-ui','enabled: false');scene.setAttribute('renderer','antialias: true; alpha: true; precision: mediump; colorManagement: true;');
 scene.setAttribute('exploradores-points','');
 scene.setAttribute('gltf-model', 'meshoptDecoderPath: ../vendor/meshopt-decoder-0.22.0.js');
 const anchor=document.createElement('a-entity');
 if(countryCamera){
  countryAnchor=anchor;anchor.object3D.visible=false;
 }else{
 scene.setAttribute('arjs','sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3; cameraParametersUrl: ../vendor/camera_para.dat; patternRatio: 0.5; maxDetectionRate: 30;');
 trackedAnchor=anchor;anchor.setAttribute('visible',false);
 marker=document.createElement('a-marker');marker.setAttribute('type','barcode');marker.setAttribute('value',String(ids.indexOf(id)));marker.setAttribute('emitevents','true');marker.setAttribute('smooth','false');
 marker.addEventListener('markerFound',()=>{
  if(stopped)return;
  clearTimeout(markerLossTimer);clearTimeout(stableTimer);
  if(markerConfirmed)return;
  foundAt=performance.now();status.textContent='Marcador encontrado. Mantenha a folha visível…';stableTimer=setTimeout(stableFound,510);
 });
 marker.addEventListener('markerLost',()=>{
  clearTimeout(stableTimer);clearTimeout(markerLossTimer);
  markerLossTimer=setTimeout(()=>{
   if(stopped||marker.object3D.visible)return;
   trackedAnchor.object3D.visible=false;markerConfirmed=false;foundAt=0;hidePoints();
   post('ar:marker-lost',{continentId:id});
   status.textContent='Reposicione a folha: mantenha o marcador inteiro na câmera.';
  },markerLossDelay);
 });
 scene.append(marker);
 }
 model=document.createElement('a-entity');model.setAttribute('gltf-model',`../${modelPath}${terrainVersion}`);if(!countryCamera)transform();anchor.append(model);scene.append(anchor);
 const ambient=document.createElement('a-entity');ambient.setAttribute('light','type: ambient; intensity: 1');scene.append(ambient);
 const light=document.createElement('a-entity');light.setAttribute('light','type: directional; intensity: 1.5');light.setAttribute('position','1 3 2');scene.append(light);
 const camera=document.createElement('a-entity');camera.setAttribute('camera',countryCamera?'fov: 50':'');scene.append(camera);
 model.addEventListener('model-loaded',()=>{
  if(stopped){disposeObject(model.object3D);return;}
  if(countryCamera){
   const mesh=model.getObject3D('mesh');
   const sphere=new AFRAME.THREE.Box3().setFromObject(mesh).getBoundingSphere(new AFRAME.THREE.Sphere());
   if(!Number.isFinite(sphere.radius)||sphere.radius<=0){error('ar:model-error','bounds','Não foi possível enquadrar o modelo.');return;}
   countryRadius=sphere.radius;
   mesh.position.sub(sphere.center);
   countryAnchor.object3D.position.z=-countryDistance;
   transform();
  }
  modelReady=true;post('ar:model-loaded');if(countryCamera)revealCountry();
 });
 model.addEventListener('model-error',()=>{if(stopped)return;modelReady=false;hidePoints();error('ar:model-error','load','Não foi possível carregar o modelo.');});
 scene.addEventListener('renderstart',()=>{
  scene.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  if(continentalTerrain||countryCamera){
   // Match the continent card's neutral tone mapping and effective exposure.
   scene.renderer.toneMapping=AFRAME.THREE.NeutralToneMapping;
   scene.renderer.toneMappingExposure=.85*1.3;
  }
  pointsObserver=new ResizeObserver(updateProjectionBounds);
  pointsObserver.observe(scene.renderer.domElement);
  updateProjectionBounds();
 });
 document.body.append(scene);
 window.addEventListener('resize',updateProjectionBounds);
 if(countryCamera)void openCountryCamera();
 void loadPoints();
}
window.addEventListener('camera-init',()=>{if(stopped){document.querySelectorAll('video').forEach(v=>v.srcObject?.getTracks().forEach(t=>t.stop()));return;}post('ar:ready');status.textContent='Aponte para o quadrado preto da folha.';});
window.addEventListener('camera-error',e=>{const err=lastCameraError||e.detail?.error||e.detail;const code=err?.name||'unknown';error(code==='NotAllowedError'?'ar:camera-denied':'ar:camera-error',code,code==='NotAllowedError'?'Câmera bloqueada. Autorize nas permissões do site.':'Não foi possível acessar a câmera.');});
const pointers=new Map();
function installGestures(overlay){
overlay.addEventListener('pointerdown',e=>{
 if(stopped||(e.pointerType==='mouse'&&e.button!==0))return;
 pointers.set(e.pointerId,{id:e.pointerId,x:e.clientX,y:e.clientY});
 overlay.setPointerCapture(e.pointerId);
});
overlay.addEventListener('pointermove',e=>{
 if(stopped||!pointers.has(e.pointerId))return;
 e.preventDefault();
 const previous=[...pointers.values()];pointers.set(e.pointerId,{id:e.pointerId,x:e.clientX,y:e.clientY});
 if(previous.length===1){
  const dx=e.clientX-previous[0].x,dy=e.clientY-previous[0].y;
  if(continentControls){
   transformState={
    ...transformState,
    rotation:transformState.rotation+dx*.4,
    tilt:AFRAME.THREE.MathUtils.clamp(transformState.tilt+dy*.45,-70,70),
   };
   transform();
  }else if(countryCamera){
   moveSideways(dx*3/Math.max(1,overlay.clientWidth));
  }
  return;
 }
 const current=[...pointers.values()];
 transformState=updateARGesture(transformState,previous,current);transform();
},{passive:false});
const release=e=>{pointers.delete(e.pointerId);if(overlay.hasPointerCapture(e.pointerId))overlay.releasePointerCapture(e.pointerId);};
overlay.addEventListener('pointerup',release);
overlay.addEventListener('pointercancel',release);
overlay.addEventListener('lostpointercapture',e=>{pointers.delete(e.pointerId);});
overlay.addEventListener('contextmenu',e=>e.preventDefault());
}
const gestures=document.querySelector('#gestures');
gestures.setAttribute('aria-label',continentControls?'Arraste para girar ou inclinar o mapa; use dois dedos para ampliar ou reduzir':'Arraste para os lados; use dois dedos para ampliar, reduzir ou girar');
installGestures(gestures);
if(!embedded){
 document.querySelector('#standalone').style.display='block';const back=document.querySelector('#back');back.href=sceneModel?.kind==='country'?`../#/paises/${sceneModel.continentId}/${sceneModel.countryId}`:`../#/continente/${encodeURIComponent(id||'')}`;back.addEventListener('click',stop);
 document.querySelectorAll('[data-action]').forEach(b=>{
  const type=b.dataset.action;
  b.addEventListener('click',()=>{
   if(type==='left'||type==='right')action('ar:move-sideways',{distance:type==='left'?-.25:.25});
   if(type==='plus')action('ar:set-scale',{delta:.25});
   if(type==='minus')action('ar:set-scale',{delta:-.25});
   if(type==='rotate'||type==='rotate-left')action('ar:rotate',{degrees:type==='rotate-left'?-30:30});
   if(type==='reset')action('ar:reset');
  });
 });
 const prompt=document.createElement('div');prompt.id='start';prompt.innerHTML='<h1>Realidade aumentada</h1><p>Separe a folha do continente. O modelo acompanhará o quadrado preto.</p><button>Iniciar câmera</button>';if(countryCamera)prompt.querySelector('p').textContent=`Veja o mapa de ${sceneModel.nome} sobre a imagem da câmera.`;prompt.querySelector('button').onclick=()=>{prompt.remove();void start();};document.body.append(prompt);
}else start();




