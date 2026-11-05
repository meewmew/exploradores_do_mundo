import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { InterfaceIcon } from './InterfaceIcon';
import type { ContinentId } from '../types/continent';
import { safePreference } from '../services/preferences';

export function CameraShortcut({ selected, beforeOpen, initiallyOpen = false }: { selected?: ContinentId; beforeOpen?: () => void; initiallyOpen?: boolean }) {
  const { continents } = useApp(), navigate = useNavigate();
  const [choosing, setChoosing] = useState(initiallyOpen);
  const [inline, setInline] = useState(false);
  const panel = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    const fit = () => setInline(root.clientWidth / parseFloat(getComputedStyle(document.documentElement).fontSize) < 18);
    const observer = new ResizeObserver(fit);
    observer.observe(root); window.addEventListener('resize', fit); fit();
    return () => { observer.disconnect(); window.removeEventListener('resize', fit); };
  }, []);
  useEffect(() => { if (choosing) panel.current?.focus(); }, [choosing]);
  const cancel = () => { setChoosing(false); trigger.current?.focus(); };
  const scan = (id: ContinentId) => { safePreference('exploradores:selected:v1', id); beforeOpen?.(); navigate(`/qr/${id}`); };
  return <aside className={`camera-shortcut${inline ? ' camera-shortcut-inline' : ''}`} aria-label="Leitura de QR Code">
    {choosing && <div className="camera-picker" ref={panel} tabIndex={-1} role="region" aria-label="Escolha o continente do QR" onKeyDown={e => { if (e.key === 'Escape') cancel(); }}>
      <h2>Qual continente vamos descobrir?</h2><p>Escolha o nome que está na sua folha.</p>
      <div className="camera-picker-options">{continents.map(c => <button key={c.id} className="button secondary" onClick={() => scan(c.id)}>{c.nome}</button>)}</div>
      <button className="button secondary camera-cancel" onClick={cancel}>Cancelar</button>
    </div>}
    <button ref={trigger} className="button camera-trigger" aria-expanded={choosing} onClick={() => selected ? scan(selected) : setChoosing(value => !value)}><InterfaceIcon name="camera" /><span>Ler QR Code</span></button>
  </aside>;
}
