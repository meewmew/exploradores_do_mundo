import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { constrainMap, moveMap, zoomMap, type MapPointer, type MapView } from '../services/mapViewport';

export function ZoomableMap({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null), pointers = useRef(new Map<number, MapPointer>());
  const pressOrigin = useRef<MapPointer | null>(null);
  const size = useRef({ width: 0, height: 0 }), initialized = useRef(false), dragged = useRef(false);
  const [view, setView] = useState<MapView>({ scale: 1, x: 0, y: 0 });
  const current = useRef(view);
  const update = (next: MapView) => { current.current = next; setView(next); };
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const fit = () => {
      size.current = { width: element.clientWidth, height: element.clientHeight };
      if (!size.current.width || !size.current.height) return;
      const next = initialized.current ? current.current : { scale: Math.max(1, size.current.height / (size.current.width * .51)), x: 0, y: 0 };
      initialized.current = true; update(constrainMap(next, size.current));
    };
    const observer = new ResizeObserver(fit); observer.observe(element); fit();
    return () => observer.disconnect();
  }, []);
  const point = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { id: event.pointerId, x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 };
  };
  const end = (event: PointerEvent<HTMLDivElement>) => { pointers.current.delete(event.pointerId); };
  const zoom = (factor: number) => update(zoomMap(current.current, current.current.scale * factor, size.current));
  return <>
    <div className="map-zoom-controls" role="group" aria-label="Zoom do mapa">
      <button className="button secondary" onClick={() => zoom(1 / 1.3)} disabled={view.scale <= 1.001} aria-label="Reduzir mapa">−</button>
      <output aria-label="Ampliação do mapa">{Math.round(view.scale * 100)}%</output>
      <button className="button secondary" onClick={() => zoom(1.3)} disabled={view.scale >= 4.999} aria-label="Ampliar mapa">＋</button>
      <button className="button secondary map-fit" onClick={() => update({ scale: 1, x: 0, y: 0 })}>Ver tudo</button>
    </div>
    <div className="world-map-viewport" ref={viewport} tabIndex={0} role="group" aria-label="Mapa com zoom. Arraste para mover ou use as setas. Use mais e menos para ampliar."
      onPointerDown={event => { if (event.button !== 0) return; if (!pointers.current.size) { dragged.current = false; pressOrigin.current = point(event); } pointers.current.set(event.pointerId, point(event)); if (pointers.current.size > 1) { dragged.current = true; event.currentTarget.setPointerCapture(event.pointerId); } }}
      onPointerMove={event => { const previous = [...pointers.current.values()]; if (!pointers.current.has(event.pointerId)) return; const nextPoint = point(event), origin = pressOrigin.current; pointers.current.set(event.pointerId, nextPoint); if (origin && Math.hypot(nextPoint.x - origin.x, nextPoint.y - origin.y) > 6) dragged.current = true; if (!dragged.current) return; if (!event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId); update(moveMap(current.current, previous, [...pointers.current.values()], size.current)); }}
      onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
      onClickCapture={event => { if (dragged.current) { event.preventDefault(); event.stopPropagation(); dragged.current = false; } }}
      onKeyDown={event => { if (event.target !== event.currentTarget) return; const delta = 40; const key = event.key; if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Home'].includes(key)) event.preventDefault(); if (key === '+' || key === '=') zoom(1.3); else if (key === '-') zoom(1 / 1.3); else if (key === 'Home') update({ scale: 1, x: 0, y: 0 }); else if (key.startsWith('Arrow')) update(constrainMap({ ...current.current, x: current.current.x + (key === 'ArrowLeft' ? delta : key === 'ArrowRight' ? -delta : 0), y: current.current.y + (key === 'ArrowUp' ? delta : key === 'ArrowDown' ? -delta : 0) }, size.current)); }}>
      <div className="map-pan-plane" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>{children}</div>
    </div>
    <p className="map-pan-hint">Arraste para mover. Use dois dedos ou os botões para ampliar.</p>
  </>;
}
