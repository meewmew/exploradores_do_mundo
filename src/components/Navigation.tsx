import { useSyncExternalStore } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isOrganizerSession, setOrganizerSession, subscribeOrganizerSession } from '../services/organizerSession';
import { InterfaceIcon } from './InterfaceIcon';

export function Navigation({ publicView = false, minimal = false }: { publicView?: boolean; minimal?: boolean }) {
  const { pathname } = useLocation(), navigate = useNavigate();
  const preview = useSyncExternalStore(subscribeOrganizerSession, isOrganizerSession, () => false);
  const camera = pathname.startsWith('/ar/') || pathname.startsWith('/qr/');
  const inMap = ['/mapa', '/orientacao', '/continente/', '/paises/', '/atividade/', '/conclusao', '/ar/', '/qr/'].some(path => pathname.startsWith(path));
  return <header className={`site-header ${camera ? 'camera-header' : ''}`}>
    <Link className="brand" to="/" aria-label="Exploradores do Mundo, início"><span className="brand-icon"><InterfaceIcon name="compass" /></span><span>Exploradores<span className="brand-sub">do Mundo</span></span></Link>
    {!minimal&&<Link className="header-help" to="/orientacao" aria-label="Como jogar"><InterfaceIcon name="book" /><span>Como jogar</span></Link>}
    {!minimal&&<nav className="icon-nav" aria-label="Principal">
      <Link to="/" title="Início" aria-current={pathname === '/' ? 'page' : undefined}><InterfaceIcon name="home" /><span className="sr-only">Início</span></Link>
      <Link to="/mapa" title="Meu mapa" aria-current={inMap ? 'page' : undefined}><InterfaceIcon name="map" /><span className="sr-only">Meu mapa</span></Link>
      <Link to="/configuracoes" title="Configurações" aria-current={pathname === '/configuracoes' ? 'page' : undefined}><InterfaceIcon name="settings" /><span className="sr-only">Configurações</span></Link>
    </nav>}
    {preview && !publicView && <button className="button secondary admin-exit" onClick={() => { setOrganizerSession(false); navigate('/'); }}>Sair do ADM</button>}
  </header>;
}
