import { openSpatial as launchSpatial } from './spatial.js';
import { applyARTransformAction, initialARTransform, updateARGesture } from './domain.js';

const depth = 2;
const initialTilt = 42;
const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));

export function createFrontPlacement({ scene, preview, model, ready, failure }) {
  const THREE = AFRAME.THREE;
  const video = document.querySelector('#front-video');
  const openSpatial = document.querySelector('#spatial-start');
  let stream, cameraRequest = 0, radius, stopped = false;
  let transform = initialARTransform();
  const screen = { x: 0, y: 0 };
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
    const fit = .82 * halfHeight * Math.min(aspect, 1) / radius;
    const { scale, tilt, rotation: yaw } = transform;
    const object = preview.object3D;
    object.visible = true;
    object.position.set(screen.x * halfHeight * aspect, screen.y * halfHeight, -depth);
    object.scale.setScalar(fit * scale);
    object.rotation.set((initialTilt + tilt) * clip, yaw * clip, 0);
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
    const width = innerWidth;
    const height = innerHeight;
    const delta = current.reduce((sum, point) => {
      const before = previous.find(item => item.id === point.id) ?? point;
      return { x: sum.x + point.x - before.x, y: sum.y + point.y - before.y };
    }, { x: 0, y: 0 });
    if (rotateOnly || current.length > 1) transform = updateARGesture(transform, previous, current);
    if (!rotateOnly) {
      const x = 2 * delta.x / (Math.max(1, width) * current.length);
      const y = -2 * delta.y / (Math.max(1, height) * current.length);
      screen.x = clamp(screen.x + x, .86);
      screen.y = clamp(screen.y + y, .82);
    }
    update();
  }

  function action(type, payload) {
    transform = applyARTransformAction(transform, type, payload);
    if (type === 'ar:reset') {
      screen.x = 0;
      screen.y = 0;
    }
    update();
  }

  const lifetime = new AbortController();
  const hint = document.querySelector('#spatial-error');
  async function fixInEnvironment() {
    if (!radius || stopped) return;
    openSpatial.disabled = true;
    stopCamera();
    try {
      await launchSpatial({ THREE, object: model.object3D, lifetime: lifetime.signal });
    } catch {
      hint.textContent = 'Não foi possível fixar o mapa no ambiente. Ele acompanha a tela.';
      hint.hidden = false;
    } finally {
      if (!stopped) { openSpatial.disabled = false; void startCamera(); }
    }
  }
  async function checkTracking() {
    let supported = false;
    try { supported = await navigator.xr?.isSessionSupported('immersive-ar'); } catch {}
    if (stopped) return;
    openSpatial.hidden = !supported;
    if (supported) {
      openSpatial.addEventListener('click', fixInEnvironment);
    } else {
      hint.textContent = 'Neste navegador, o mapa acompanha a tela.';
      hint.hidden = false;
      if (document.createElement('a').relList.supports('ar')) {
        const { offerQuickLook } = await import('./apple-preview.js');
        if (!stopped) offerQuickLook(openSpatial, hint, model.object3D, lifetime.signal);
      }
    }
  }
  void checkTracking();
  window.addEventListener('resize', update);
  video.hidden = false;
  void startCamera();

  return { action, gesture, prepareModel, update, stop() {
    stopped = true;
    window.removeEventListener('resize', update);
    stopCamera();
    lifetime.abort();
  } };
}
