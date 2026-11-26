import { initialARTransform, updateARGesture } from './domain.js';

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

export async function createWorldView({ session, overlay, status, reset, THREE, object, file, signal }) {
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
  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(1, 3, 2);
  scene.add(anchor, light, new THREE.AmbientLight(0xffffff, 1));
  let placed = false, radius = 0, transform = initialARTransform(), owned;
  const orientation = new THREE.Quaternion(), angles = new THREE.Euler();
  const offset = new THREE.Vector3();
  function updateModel() {
    if (!radius) return;
    model.scale.setScalar(.53 * transform.scale / radius);
    model.rotation.set((42 + transform.tilt) * Math.PI / 180, transform.rotation * Math.PI / 180, 0);
  }
  reset.onclick = () => { placed = false; transform = initialARTransform(); updateModel(); };
  const pointers = new Map();
  overlay.onpointerdown = event => {
    if (event.target.closest('button')) return;
    overlay.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
  };
  overlay.onpointermove = event => {
    if (!pointers.has(event.pointerId)) return;
    const previous = [...pointers.values()];
    pointers.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
    transform = updateARGesture(transform, previous, [...pointers.values()]);
    updateModel();
  };
  overlay.onlostpointercapture = event => pointers.delete(event.pointerId);
  function draw(_, frame) {
    const reference = renderer.xr.getReferenceSpace();
    const pose = reference && frame?.getViewerPose(reference);
    const tracked = pose && !pose.emulatedPosition;
    if (tracked && !placed) {
      orientation.copy(pose.transform.orientation);
      offset.set(0, 0, -2).applyQuaternion(orientation);
      anchor.position.copy(pose.transform.position).add(offset);
      anchor.rotation.y = angles.setFromQuaternion(orientation, 'YXZ').y;
      placed = true;
    }
    anchor.visible = Boolean(tracked && radius);
    status.hidden = anchor.visible;
    if (!anchor.visible && radius) status.textContent = 'Aguardando o rastreamento do ambiente…';
    renderer.render(scene, camera);
  }
  function dispose() {
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
    mesh.position.sub(box.getCenter(new THREE.Vector3()));
    model.add(mesh);
    updateModel();
    return { dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
