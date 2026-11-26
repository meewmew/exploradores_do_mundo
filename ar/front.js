import { applyARTransformAction, initialARTransform, updateARGesture } from './domain.js';

const depth = 2;
const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));

export function createFrontPlacement({ scene, preview, model, ready, failure }) {
  const THREE = AFRAME.THREE;
  const video = document.querySelector('#front-video');
  const openSpatial = document.querySelector('#spatial-start');
  const spatialOverlay = document.querySelector('#spatial-overlay');
  const closeSpatial = document.querySelector('#spatial-close');
  const resetSpatial = document.querySelector('#spatial-reset');
  let stream, cameraRequest = 0, radius, spatial, stopped = false;
  let transform = initialARTransform();
  const screen = { x: 0, y: 0 };
  const rotation = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const clip = Math.PI / 180;

  function stopCamera() {
    cameraRequest++;
    stream?.getTracks().forEach(track => track.stop());
    stream = undefined;
    video.srcObject = null;
  }

  async function startCamera() {
    const request = ++cameraRequest;
    try {
      const camera = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      if (stopped || request !== cameraRequest) {
        camera.getTracks().forEach(track => track.stop());
        return;
      }
      stream = camera;
      video.srcObject = stream;
      await video.play();
      if (stopped || request !== cameraRequest) return;
      ready();
    } catch (error) {
      if (stopped || request !== cameraRequest) return;
      stopCamera();
      failure(error);
    }
  }

  function update() {
    if (!radius || !scene.camera) return;
    const aspect = scene.camera.aspect || innerWidth / Math.max(1, innerHeight);
    const halfHeight = depth * Math.tan(scene.camera.fov * clip / 2);
    const fit = .64 * halfHeight * Math.min(aspect, 1) / radius;
    const { scale, tilt, rotation: yaw } = transform;
    const object = preview.object3D;
    object.visible = true;
    object.position.set(screen.x * halfHeight * aspect, screen.y * halfHeight, -depth);
    object.scale.setScalar(fit * scale);
    object.rotation.set((20 + tilt) * clip, yaw * clip, 0);
    if (spatial?.root) {
      spatial.root.scale.setScalar(.53 / radius * scale);
      spatial.root.rotation.set((20 + tilt) * clip, spatial.yaw + yaw * clip, 0, 'YXZ');
    }
  }

  function prepareModel() {
    const box = new THREE.Box3().setFromObject(model.object3D);
    const measuredRadius = box.getBoundingSphere(new THREE.Sphere()).radius;
    if (!Number.isFinite(measuredRadius) || measuredRadius <= 0) return false;
    radius = measuredRadius;
    model.object3D.position.sub(box.getCenter(new THREE.Vector3()));
    update();
    openSpatial.disabled = false;
    return true;
  }

  function gesture(previous, current, rotateOnly = false) {
    if (!current.length || !previous.length) return;
    const width = spatial ? spatialOverlay.clientWidth : innerWidth;
    const height = spatial ? spatialOverlay.clientHeight : innerHeight;
    const delta = current.reduce((sum, point) => {
      const before = previous.find(item => item.id === point.id) ?? point;
      return { x: sum.x + point.x - before.x, y: sum.y + point.y - before.y };
    }, { x: 0, y: 0 });
    if (rotateOnly || current.length > 1) transform = updateARGesture(transform, previous, current);
    if (!rotateOnly) {
      const x = 2 * delta.x / (Math.max(1, width) * current.length);
      const y = -2 * delta.y / (Math.max(1, height) * current.length);
      if (spatial?.placed) {
        right.set(1, 0, 0).applyQuaternion(spatial.orientation);
        up.set(0, 1, 0).applyQuaternion(spatial.orientation);
        spatial.root.position.addScaledVector(right, x * .7).addScaledVector(up, y * .7);
      } else if (!spatial) {
        screen.x = clamp(screen.x + x, .86);
        screen.y = clamp(screen.y + y, .82);
      }
    }
    update();
  }

  function action(type, payload) {
    transform = applyARTransformAction(transform, type, payload);
    if (type === 'ar:reset') {
      screen.x = 0;
      screen.y = 0;
      if (spatial) spatial.placed = false;
    }
    update();
  }

  function renderSpatial(viewer, frame) {
    if (!frame || spatial !== viewer) return;
    const space = viewer.renderer.xr.getReferenceSpace();
    const pose = space && frame.getViewerPose(space);
    viewer.root.visible = Boolean(pose && !pose.emulatedPosition);
    if (viewer.root.visible) {
      const orientation = pose.transform.orientation;
      viewer.orientation.set(orientation.x, orientation.y, orientation.z, orientation.w);
      if (!viewer.placed) {
        rotation.copy(viewer.orientation);
        const position = pose.transform.position;
        forward.set(0, -.12, -depth).applyQuaternion(rotation);
        viewer.root.position.set(position.x, position.y, position.z).add(forward);
        viewer.yaw = euler.setFromQuaternion(rotation, 'YXZ').y;
        viewer.placed = true;
        update();
      }
    }
    viewer.renderer.render(viewer.scene, viewer.camera);
  }

  function finishSpatial(viewer) {
    if (!viewer || spatial !== viewer) return;
    spatial = undefined;
    viewer.renderer?.setAnimationLoop(null);
    viewer.renderer?.dispose();
    viewer.renderer?.forceContextLoss();
    spatialOverlay.hidden = true;
    openSpatial.disabled = false;
    if (!stopped) void startCamera();
  }

  async function enterSpatial() {
    if (spatial || stopped || !radius) return;
    const viewer = { placed: false, yaw: 0, orientation: new THREE.Quaternion() };
    spatial = viewer;
    openSpatial.disabled = true;
    stopCamera();
    spatialOverlay.hidden = false;
    document.querySelector('#spatial-error').hidden = true;
    try {
      // Keep requestSession in the button's user activation, as in Superfície RA.
      viewer.session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['dom-overlay'], domOverlay: { root: spatialOverlay },
      });
      viewer.session.addEventListener('end', () => queueMicrotask(() => finishSpatial(viewer)), { once: true });
      if (stopped) { await viewer.session.end(); return; }
      viewer.scene = new THREE.Scene();
      viewer.camera = new THREE.PerspectiveCamera(45, 1, .05, 50);
      viewer.root = new THREE.Group();
      viewer.root.visible = false;
      viewer.root.add(model.object3D.clone(true));
      const light = new THREE.DirectionalLight(0xffffff, 1.5);
      light.position.set(1, 3, 2);
      viewer.scene.add(viewer.root, new THREE.AmbientLight(0xffffff, 1), light);
      viewer.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      viewer.renderer.xr.enabled = true;
      viewer.renderer.xr.setReferenceSpaceType('local');
      await viewer.renderer.xr.setSession(viewer.session);
      if (!stopped && spatial === viewer) viewer.renderer.setAnimationLoop((_, frame) => renderSpatial(viewer, frame));
    } catch {
      if (viewer.session) await viewer.session.end().catch(() => {});
      finishSpatial(viewer);
      if (!stopped) document.querySelector('#spatial-error').hidden = false;
    }
  }

  openSpatial.addEventListener('click', enterSpatial);
  closeSpatial.addEventListener('click', () => { void spatial?.session?.end().catch(() => {}); });
  resetSpatial.addEventListener('click', () => action('ar:reset'));
  spatialOverlay.addEventListener('beforexrselect', event => event.preventDefault());
  navigator.xr?.isSessionSupported('immersive-ar').then(supported => {
    if (!stopped) openSpatial.hidden = !supported;
  }).catch(() => {});
  window.addEventListener('resize', update);
  video.hidden = false;
  void startCamera();

  return { action, gesture, prepareModel, update, stop() {
    stopped = true;
    window.removeEventListener('resize', update);
    stopCamera();
    const viewer = spatial;
    if (viewer?.session) void viewer.session.end().catch(() => finishSpatial(viewer));
  } };
}
