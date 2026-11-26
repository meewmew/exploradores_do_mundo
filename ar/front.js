import { openSpatial } from './spatial.js?v=placement';

export function createFrontPlacement({ model }) {
  const { Box3, Sphere } = AFRAME.THREE;
  const status = document.querySelector('#status');
  const launch = document.querySelector('#spatial-start');
  const hint = document.querySelector('#spatial-error');
  const lifetime = new AbortController();
  const signal = lifetime.signal;

  async function configure() {
    let supported = false;
    try { supported = await navigator.xr?.isSessionSupported('immersive-ar'); } catch {}
    if (signal.aborted) return;
    if (supported) {
      status.textContent = 'O mapa aparece à sua frente e fica fixo no ambiente.';
      launch.hidden = false;
      launch.onclick = async () => {
        launch.disabled = true;
        hint.hidden = true;
        try {
          await openSpatial({ THREE: AFRAME.THREE, object: model.object3D, lifetime: signal });
        } catch {
          if (!signal.aborted) {
            hint.textContent = 'Não foi possível iniciar o rastreamento espacial.';
            hint.hidden = false;
          }
        } finally {
          if (!signal.aborted) launch.disabled = false;
        }
      };
    } else if (document.createElement('a').relList.supports('ar')) {
      const { offerQuickLook } = await import('./apple-preview.js');
      if (signal.aborted) return;
      status.textContent = 'Use o Quick Look para colocar o mapa no ambiente.';
      offerQuickLook(launch, hint, model.object3D, signal);
    } else {
      status.textContent = 'Este navegador não oferece rastreamento espacial.';
      hint.textContent = status.textContent;
      hint.hidden = false;
    }
  }

  return {
    prepareModel() {
      const radius = new Box3().setFromObject(model.object3D).getBoundingSphere(new Sphere()).radius;
      if (!Number.isFinite(radius) || radius <= 0) return false;
      launch.disabled = false;
      void configure();
      return true;
    },
    stop() { lifetime.abort(); },
  };
}
