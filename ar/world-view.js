import { applyARTransformAction, initialARTransform, updateARGesture } from './domain.js';

// Use the bundled A-Frame distribution for Three and GLTFLoader. Isolate its
// document-wide CSS and custom elements from the card which launched WebXR.
async function loadEngine(signal) {
  const frame = document.createElement('iframe');
  frame.hidden = true;
  frame.title = 'Motor 3D';
  const engine = new URL('../vendor/aframe-1.6.0.min.js', import.meta.url);
  const decoder = new URL('../vendor/meshopt-decoder-0.22.0.js', import.meta.url);
  frame.srcdoc = '<!doctype html><script src="' + engine.href + '"></script><script src="' + decoder.href + '"></script>';
  const loaded = new Promise((resolve, reject) => {
    frame.onload = resolve;
    signal.addEventListener('abort', () => {
      frame.remove();
      reject(new DOMException('Sessão encerrada', 'AbortError'));
    }, { once: true });
  });
  document.body.append(frame);
  await loaded;
  const { AFRAME, MeshoptDecoder } = frame.contentWindow;
  // GLTFLoader checks ArrayBuffer with instanceof. Read it in the loader's realm.
  return { THREE: AFRAME.THREE, decoder: MeshoptDecoder, fetch: frame.contentWindow.fetch.bind(frame.contentWindow) };
}

export async function createWorldView({ session, overlay, status, reset, place, adjust, adjustments, THREE, object, file, signal }) {
  let loader, fetchModel;
  if (!THREE) {
    const engine = await loadEngine(signal);
    THREE = engine.THREE;
    loader = new THREE.GLTFLoader().setMeshoptDecoder(engine.decoder);
    fetchModel = engine.fetch;
  }
  signal.throwIfAborted();
  const renderer = new THREE.WebGLRenderer({ canvas: document.createElement('canvas'), alpha: true, antialias: true });
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, .05, 50);
  const anchor = new THREE.Group(), model = new THREE.Group();
  anchor.add(model);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(.08, .105, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
  );
  ring.visible = false;
  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(1, 3, 2);
  scene.add(anchor, ring, light, new THREE.AmbientLight(0xffffff, 1));
  let positioned = false, placing = false, hitTest;
  let radius = 0, bottom = 0, transform = initialARTransform(), owned;
  const up = new THREE.Vector3(0, 1, 0), toCamera = new THREE.Vector3();
  const wallX = new THREE.Vector3(), wallZ = new THREE.Vector3(), wallBasis = new THREE.Matrix4();
  const planeNormal = new THREE.Vector3(), planeRotation = new THREE.Quaternion();
  let surfaceSeenAt = -Infinity;
  const movement = new THREE.Vector3();
  function move(x, y) {
    if (!anchor.visible) return;
    movement.set(x, 0, -y);
    anchor.position.add(movement.applyQuaternion(anchor.quaternion));
  }
  function updateModel() {
    if (!radius) return;
    const scale = .53 * transform.scale / radius;
    model.scale.setScalar(scale);
    model.position.y = bottom * scale;
    model.rotation.y = transform.rotation * Math.PI / 180;
  }
  function act(type, payload) {
    transform = applyARTransformAction(transform, type, payload);
    updateModel();
  }
  for (const [label, action] of [
    ['Mover à esquerda', () => move(-.12, 0)], ['Mover à direita', () => move(.12, 0)],
    ['Mover para cima', () => move(0, .12)], ['Mover para baixo', () => move(0, -.12)],
    ['Ampliar', () => act('ar:set-scale', { delta: .25 })],
    ['Reduzir', () => act('ar:set-scale', { delta: -.25 })],
    ['Girar', () => act('ar:rotate', { degrees: 30 })],
  ]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.onclick = action;
    adjustments.append(button);
  }
  reset.onclick = () => {
    positioned = placing = false;
    surfaceSeenAt = -Infinity;
    place.textContent = 'Escolher posição';
    transform = initialARTransform();
    updateModel();
  };
  place.onclick = () => {
    if (!hitTest || !radius) return;
    if (!placing) {
      placing = true;
      surfaceSeenAt = -Infinity;
      ring.visible = false;
      place.textContent = 'Colocar aqui';
      place.disabled = true;
      return;
    }
    if (performance.now() - surfaceSeenAt > 500) return;
    placeOnSurface();
  };
  function placeOnSurface() {
    anchor.position.copy(ring.position);
    anchor.quaternion.copy(ring.quaternion);
    placing = false;
    positioned = true;
    place.textContent = 'Escolher outra posição';
    transform = initialARTransform();
    updateModel();
  }
  const pointers = new Map();
  overlay.onpointerdown = event => {
    if (!anchor.visible || event.target.closest('button, details')) return;
    overlay.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
  };
  overlay.onpointermove = event => {
    const before = pointers.get(event.pointerId);
    if (!before) return;
    const previous = [...pointers.values()];
    pointers.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
    if (pointers.size === 1) {
      move((event.clientX - before.x) / overlay.clientWidth * 1.8, (before.y - event.clientY) / overlay.clientHeight * 1.8);
    } else {
      transform = updateARGesture(transform, previous, [...pointers.values()]);
      updateModel();
    }
  };
  overlay.onlostpointercapture = event => pointers.delete(event.pointerId);
  function showSurface(frame, reference, pose) {
    for (const hit of frame.getHitTestResults(hitTest)) {
      const point = hit.getPose(reference)?.transform;
      if (!point) continue;
      planeRotation.copy(point.orientation);
      planeNormal.copy(up).applyQuaternion(planeRotation);
      const wall = Math.abs(planeNormal.y) <= .24;
      if (!wall && planeNormal.y < .91) continue;
      toCamera.copy(pose.transform.position).sub(point.position);
      const distance = Math.hypot(toCamera.x, toCamera.z);
      if (distance < .35 || distance > 2) continue;
      if (wall) {
        if (toCamera.dot(planeNormal) < 0) planeNormal.negate();
        wallX.crossVectors(up, planeNormal).normalize();
        wallZ.crossVectors(wallX, planeNormal);
        planeRotation.setFromRotationMatrix(wallBasis.makeBasis(wallX, planeNormal, wallZ));
      }
      ring.position.copy(point.position);
      ring.quaternion.copy(planeRotation);
      return true;
    }
    return false;
  }
  function draw(_, frame) {
    if (!frame) return;
    const reference = renderer.xr.getReferenceSpace();
    const pose = reference && frame.getViewerPose(reference);
    const tracked = pose && !pose.emulatedPosition;
    if (!tracked) surfaceSeenAt = -Infinity;
    if (tracked && (!positioned || placing) && showSurface(frame, reference, pose)) {
      surfaceSeenAt = performance.now();
      if (!placing) placeOnSurface();
    }
    const canPlace = placing && performance.now() - surfaceSeenAt <= 500;
    ring.visible = canPlace;
    place.disabled = !radius || (placing && !canPlace);
    anchor.visible = Boolean(tracked && radius && positioned && !placing);
    adjust.hidden = !anchor.visible;
    status.hidden = anchor.visible;
    if (!anchor.visible) {
      const message = canPlace ? 'Toque em Colocar aqui para fixar o mapa.'
        : positioned && !placing && !tracked ? 'Mova o celular devagar para recuperar o rastreamento.'
        : positioned && !placing ? 'Carregando o mapa 3D…'
        : 'Mova o celular devagar e aponte para o chão ou uma mesa. Você também pode apontar para uma parede.';
      if (status.textContent !== message) status.textContent = message;
    }
    renderer.render(scene, camera);
  }
  function dispose() {
    try { hitTest?.cancel(); } catch { /* The session may have already ended. */ }
    ring.geometry.dispose();
    ring.material.dispose();
    renderer.setAnimationLoop(null);
    owned?.traverse(node => {
      node.geometry?.dispose();
      for (const material of [].concat(node.material || [])) {
        for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
        material.dispose();
      }
    });
    renderer.dispose();
    renderer.forceContextLoss();
  }
  try {
    await renderer.xr.setSession(session);
    signal.throwIfAborted();
    if (!session.requestHitTestSource) throw new DOMException('WebXR Hit Test indisponível.', 'NotSupportedError');
    const viewerSpace = await session.requestReferenceSpace('viewer');
    hitTest = await session.requestHitTestSource({ space: viewerSpace, entityTypes: ['plane'] });
    signal.throwIfAborted();
    renderer.setAnimationLoop(draw);
    if (!object) {
      const response = await fetchModel(file, { signal });
      if (!response.ok) throw new Error('Falha ao carregar o relevo.');
      owned = (await loader.parseAsync(await response.arrayBuffer(), new URL('.', file).href)).scene;
    }
    signal.throwIfAborted();
    const mesh = owned || object.clone(true);
    const box = new THREE.Box3().setFromObject(mesh);
    radius = box.getBoundingSphere(new THREE.Sphere()).radius;
    if (!Number.isFinite(radius) || radius <= 0) throw new Error('Modelo sem dimensões válidas.');
    const center = box.getCenter(new THREE.Vector3());
    bottom = center.y - box.min.y;
    mesh.position.sub(center);
    model.add(mesh);
    updateModel();
    place.hidden = false;
    return { dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
