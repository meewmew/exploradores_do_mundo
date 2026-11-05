import type { TouristSpot } from '../types/continent';

export interface PositionedTouristSpot extends TouristSpot { posicao: [number, number, number] }

export function TouristPoints({ points, selected, onSelect }: {
  points: readonly TouristSpot[]; selected: string; onSelect: (id: string) => void;
}) {
  if (!points.length) return null;
  const current = points.find(point => point.id === selected);
  return <section className="tourist-points" aria-label="Pontos de interesse no modelo">
    <h2>{points.length} lugares para conhecer</h2>
    <p>Toque nos números do mapa ou escolha um lugar.</p>
    <div className="tourist-point-list">{points.map((point, index) => <button
      key={point.id} className="tourist-point-choice" aria-pressed={selected === point.id}
      onClick={() => onSelect(point.id)}
    ><span aria-hidden="true">{index + 1}</span>{point.nome}</button>)}</div>
    {current && <div className="tourist-point-detail" role="status">
      <h3>{current.nome}</h3><p>{current.descricaoCurta}</p>
    </div>}
  </section>;
}
