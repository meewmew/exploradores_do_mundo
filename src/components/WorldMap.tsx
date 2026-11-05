import data from '../data/generated/map.json';
import type { ContinentId } from '../types/continent';
import { useApp } from '../hooks/useApp';
import { activityContinents } from '../services/activities';
import { InterfaceIcon } from './InterfaceIcon';
import { useId } from 'react';
import { ZoomableMap } from './ZoomableMap';

const continentFill: Record<ContinentId, string> = {
  africa: 'var(--yellow)', america: 'var(--warm)', antartida: 'var(--surface)',
  asia: 'var(--success-tint)', europa: 'var(--tint-strong)', oceania: 'var(--action)',
};

export function WorldMap({ onSelect, selected, activity = false, decorative = false, interactive = false }: {
  onSelect?: (id: ContinentId) => void; selected?: ContinentId; activity?: boolean; decorative?: boolean; interactive?: boolean;
}) {
  const { unlocked, completed, continents } = useApp();
  const done = activityContinents(completed), gridId = useId();
  const map = <svg viewBox="0 0 1000 510" className="world-map" role={decorative ? undefined : 'group'} aria-label={decorative ? undefined : 'Mapa dos seis continentes'}>
        <defs><pattern id={gridId} width="125" height="127.5" patternUnits="userSpaceOnUse"><path d="M125 0H0V127.5" fill="none" stroke="var(--map-grid)" strokeOpacity=".06" /></pattern></defs>
        <rect width="1000" height="510" fill="var(--water)" /><rect width="1000" height="510" fill={`url(#${gridId})`} />
        {data.map(c => {
          const id = c.id as ContinentId, open = unlocked.includes(id), available = continents.some(c => c.id === id);
          const state = open ? `descoberto${done.includes(id) ? ', atividade concluída' : ''}` : 'bloqueado';
          return <g key={id} className={`map-region ${selected === id ? 'selected' : ''}`}>
            <path id={decorative ? undefined : id} d={c.d} fill={activity || open ? continentFill[id] : 'var(--map-locked)'} stroke="var(--surface)" strokeWidth="2" role={decorative ? undefined : 'button'} tabIndex={decorative ? undefined : available ? 0 : -1} aria-disabled={decorative ? undefined : !available} aria-label={decorative ? undefined : `${c.nome}${activity ? '' : `, ${state}`}`} onClick={decorative ? undefined : () => available && onSelect?.(id)} onKeyDown={decorative ? undefined : e => { if (available && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect?.(id); } }} />
          </g>;
        })}
      </svg>;
  return <div className={`world-map-container${interactive ? ' interactive-world-map' : ''}`}>
    <div className="world-wrap">
      {interactive ? <ZoomableMap>{map}</ZoomableMap> : map}
      {!activity && !decorative && <div className="map-places" aria-label="Escolher continente no mapa">{continents.map(c => <button key={c.id} aria-pressed={selected === c.id} onClick={() => onSelect?.(c.id)} aria-label={`${c.nome}, ${unlocked.includes(c.id) ? `descoberto${done.includes(c.id) ? ', atividade concluída' : ''}` : 'ainda não descoberto'}`}>
        <span aria-hidden="true">{done.includes(c.id) ? '★' : unlocked.includes(c.id) ? '✓' : <InterfaceIcon name="lock" />}</span>{c.nome}
      </button>)}</div>}
    </div>
    {!decorative && <p className="map-help">Toque no mapa ou escolha pelo nome.</p>}
  </div>;
}
