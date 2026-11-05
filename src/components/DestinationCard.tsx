import { Link } from 'react-router-dom';
import { asset } from '../services/contentRepository';
import type { Continent } from '../types/continent';
import { InterfaceIcon } from './InterfaceIcon';

export function DestinationCard({ continent: c, discovered, completed, selected, onSelect }: {
  continent: Continent; discovered: boolean; completed: boolean; selected: boolean; onSelect: () => void;
}) {
  return <article className={`continent-card destination-${c.id} ${discovered ? 'discovered' : ''} ${selected ? 'selected' : ''}`}>
    <button className="continent-select" onClick={onSelect} aria-label={`${c.nome}, ${discovered ? 'descoberto. Revisitar continente' : 'ainda não descoberto. Ver dica do QR'}`}>
      <span className="destination-art"><img className={discovered ? '' : 'locked-shape'} src={asset(`images/silhouettes/${c.id}.svg`)} alt="" /></span>
      <span className="destination-copy"><span className="destination-name">{c.nome}</span>
        <span className="card-state">{discovered ? '✓ Descoberto' : <><InterfaceIcon name="lock" />A descobrir</>}</span>
      </span>
      <InterfaceIcon name="chevron-right" />
    </button>
    {discovered && <Link className="card-activity" to={`/atividade/${c.id}`}>{completed ? '★ Concluída · refazer' : 'Fazer atividade'}<span className="sr-only"> de {c.nome}</span></Link>}
  </article>;
}
