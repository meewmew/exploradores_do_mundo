// Prepare Quick Look on demand so opening the camera doesn't decode two maps.
export function offerQuickLook(button, hint, object, signal) {
  button.hidden = false;
  button.textContent = 'Preparar mapa para o Quick Look';
  button.onclick = async () => {
    button.disabled = true;
    hint.hidden = false;
    hint.textContent = 'Preparando o modelo para o iPhone…';
    try {
      const { USDZExporter } = await import('../vendor/model-viewer-4.0.0.min.js');
      if (signal.aborted) return;
      const mesh = object.clone(true);
      const box = new AFRAME.THREE.Box3().setFromObject(mesh);
      const radius = box.getBoundingSphere(new AFRAME.THREE.Sphere()).radius;
      const root = new AFRAME.THREE.Group();
      root.add(mesh);
      root.scale.setScalar(.53 / radius);
      root.updateMatrixWorld(true);
      const archive = await new USDZExporter().parseAsync(root, { quickLookCompatible: true });
      if (signal.aborted) return;
      const url = URL.createObjectURL(new Blob([archive], { type: 'model/vnd.usdz+zip' }));
      const link = document.createElement('a');
      link.id = 'apple-open';
      link.rel = 'ar';
      link.href = url;
      link.download = 'mapa.usdz';
      link.append(document.createElement('img'), 'Abrir mapa no ambiente');
      link.firstChild.alt = '';
      button.replaceWith(link);
      hint.textContent = 'O Quick Look pode pedir que você enquadre uma superfície.';
      signal.addEventListener('abort', () => URL.revokeObjectURL(url), { once: true });
    } catch {
      if (!signal.aborted) {
        button.disabled = false;
        hint.textContent = 'O modelo da Apple não carregou. Toque para tentar novamente.';
      }
    }
  };
}
