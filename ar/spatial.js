// requestSession must run in the original tap, before routing or loading the GLB.
let active = false;
let supported;
navigator.xr?.isSessionSupported('immersive-ar').then(value => { supported = value; }).catch(() => {});

export async function launchModelAR(file, viewer) {
  if (viewer?.canActivateAR) {
    await viewer.activateAR();
    return;
  }
  if (navigator.xr && supported !== false) {
    await openSpatial({ file: new URL('../' + file, import.meta.url) });
    return;
  }
  if (document.createElement('a').relList.supports('ar') && !viewer?.loaded) {
    return 'Aguarde o mapa 3D carregar e toque em Ver em RA novamente.';
  }
  return 'Este navegador não oferece rastreamento para colocar o mapa no espaço.';
}

export async function openSpatial({ file, THREE, object, lifetime }) {
  if (active) return;
  active = true;
  const overlay = document.createElement('section');
  overlay.className = 'world-ar-overlay';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.textContent = 'Mova o celular devagar e aponte para o chão ou uma mesa. Você também pode apontar para uma parede.';
  const controls = document.createElement('div');
  const reset = document.createElement('button');
  reset.textContent = 'Buscar outra superfície';
  const place = document.createElement('button');
  place.textContent = 'Escolher posição';
  place.hidden = true;
  const close = document.createElement('button');
  close.textContent = 'Sair da RA';
  const adjust = document.createElement('details');
  adjust.className = 'world-ar-adjust';
  adjust.hidden = true;
  const adjustLabel = document.createElement('summary');
  adjustLabel.textContent = 'Ajustar mapa';
  const adjustments = document.createElement('div');
  adjust.append(adjustLabel, adjustments);
  controls.append(reset, place, close);
  overlay.append(status, adjust, controls);
  overlay.addEventListener('beforexrselect', event => event.preventDefault());
  document.body.append(overlay);
  let session, view;
  const abort = new AbortController();
  const end = () => { abort.abort(); void session?.end().catch(() => {}); };
  const finished = new Promise(resolve => abort.signal.addEventListener('abort', resolve, { once: true }));
  close.onclick = end;
  lifetime?.addEventListener('abort', end, { once: true });
  window.addEventListener('pagehide', end);
  window.addEventListener('hashchange', end);
  try {
    session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['local', 'hit-test', 'dom-overlay'], domOverlay: { root: overlay },
    });
    if (abort.signal.aborted) { await session.end(); return; }
    session.addEventListener('end', () => abort.abort(), { once: true });
    const { createWorldView } = await import('./world-view.js?v=surface');
    if (abort.signal.aborted) return;
    view = await createWorldView({ session, overlay, status, reset, place, adjust, adjustments, THREE, object, file, signal: abort.signal });
    await finished;
  } catch (error) {
    if (!abort.signal.aborted) {
      if (session) await session.end().catch(() => {});
      throw error;
    }
  } finally {
    abort.abort();
    view?.dispose();
    lifetime?.removeEventListener('abort', end);
    overlay.remove();
    window.removeEventListener('pagehide', end);
    window.removeEventListener('hashchange', end);
    active = false;
  }
}
