import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp, safePreference } from '../hooks/useApp';
import { isContinentId } from '../services/collectionRepository';
import { WorldMap } from '../components/WorldMap';
import { activityContinents, isExplorationComplete } from '../services/activities';
import type { ContinentId } from '../types/continent';
import { DestinationCard } from '../components/DestinationCard';
import { InterfaceIcon } from '../components/InterfaceIcon';
import { DiscoveryProgress } from '../components/DiscoveryProgress';
import { CameraShortcut } from '../components/CameraShortcut';
import { useJourney } from '../hooks/useJourney';

export default function Collection() {
  const app = useApp(), navigate = useNavigate(), location = useLocation();
  const journey = useJourney();
  const [selected, setSelected] = useState<ContinentId | undefined>(() => {
    const id = journey.pending ?? safePreference('exploradores:selected:v1');
    return isContinentId(id) ? id : undefined;
  });
  const completed = activityContinents(app.completed);
  const select = (id: ContinentId) => {
    setSelected(id); journey.clearPending(); safePreference('exploradores:selected:v1', id); navigate(`/continente/${id}`);
  };
  return <main className="collection-page adventure-map-page">
    <section className="exploration-map exploration-board" aria-labelledby="world-map-title"><h1 id="world-map-title">Mapa de exploração</h1><DiscoveryProgress /><WorldMap selected={selected} onSelect={select} interactive /></section>
    {journey.pending&&<section className="notice pending-destination"><p>Seu destino é <strong>{app.continents.find(c=>c.id===journey.pending)?.nome}</strong>. Para descobrir o continente, leia a folha aqui no app.</p><button className="button secondary" onClick={()=>select(journey.pending!)}>Ver continente</button></section>}
    {isExplorationComplete(app.unlocked) && <Link className="celebration" to="/conclusao">✦ {completed.length === 6 ? 'Exploração e atividades completas!' : 'Os seis continentes estão no seu mapa!'} Ver conquista ↗</Link>}
    <p className="activity-progress"><InterfaceIcon name="spark" />Atividades concluídas: <strong>{completed.length} de 6</strong></p>
    <p className="map-invitation">{app.unlocked.length < 6 ? 'Encontre os QR codes para descobrir os continentes.' : 'Você descobriu os seis continentes. Continue aprendendo!'}</p>
    <div className="section-label"><h2>Os seis continentes</h2></div>
    <div className="continent-grid">{app.continents.map(c => <DestinationCard key={c.id} continent={c} discovered={app.unlocked.includes(c.id)} completed={completed.includes(c.id)} selected={selected === c.id} onSelect={() => select(c.id)} />)}</div>
    <CameraShortcut selected={selected} initiallyOpen={location.state?.chooseQr===true} />
  </main>;
}
