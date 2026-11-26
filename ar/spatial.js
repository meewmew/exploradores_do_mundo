// requestSession must run in the original tap, before routing or loading the GLB.
let active = false;
let supported;
navigator.xr?.isSessionSupported('immersive-ar').then(value => { supported = value; }).catch(() => {});

export function openSpatialFromLink(event, file) {
  if (!navigator.xr || supported === false || event.defaultPrevented || event.button !== 0 ||
      event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const destination = event.currentTarget.href;
  event.preventDefault();
  if (active) return;
  const route = location.href;
  openSpatial({ file: new URL('../' + file, import.meta.url) }).catch(() => {
    if (location.href === route) location.assign(destination);
  });
}

export async function openSpatial({ file, THREE, object, lifetime }) {
  if (active) return;
  active = true;
  const overlay = document.createElement('section');
  overlay.className = 'world-ar-overlay';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.textContent = 'Carregando o mapa 3D…';
  const controls = document.createElement('div');
  const reset = document.createElement('button');
  reset.textContent = 'Trazer à frente';
  const close = document.createElement('button');
  close.textContent = 'Sair da RA';
  controls.append(reset, close);
  overlay.append(status, controls);
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
      requiredFeatures: ['local'], optionalFeatures: ['dom-overlay'], domOverlay: { root: overlay },
    });
    if (abort.signal.aborted) { await session.end(); return; }
    session.addEventListener('end', () => abort.abort(), { once: true });
    const { createWorldView } = await import('./world-view.js');
    if (abort.signal.aborted) return;
    view = await createWorldView({ session, overlay, status, reset, THREE, object, file, signal: abort.signal });
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
