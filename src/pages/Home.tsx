import { Link } from 'react-router-dom';
import { useJourney } from '../hooks/useJourney';
import { InterfaceIcon } from '../components/InterfaceIcon';
import { setOrganizerSession } from '../services/organizerSession';

export default function Home() {
  const journey = useJourney();
  return <main className="role-choice" aria-labelledby="choose-title">
    <p className="role-brand"><InterfaceIcon name="compass" /><span>Exploradores do Mundo</span></p>
    <h1 id="choose-title">Eu sou...</h1>
    <div className="role-options">
      <Link className="button primary role-button" to="/orientacao" onClick={() => { setOrganizerSession(false); journey.choose('explorer'); }}>Explorador</Link>
      <Link className="button secondary role-button" to="/organizador" onClick={() => journey.choose('organizer')}>Organizador</Link>
    </div>
  </main>;
}
