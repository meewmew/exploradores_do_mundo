import { useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { ARFrame } from '../components/ARFrame';
import { isStableMarker } from '../services/discovery';
import { AR_SCENE_VERSION, sendARMessage, type ARMessage } from '../services/arBridge';
import { arSceneQuery } from '../services/arTarget';
import { asset } from '../services/contentRepository';
import { useCountryTerrain } from '../hooks/useCountryTerrain';
import { getTerrainConfig } from '../services/terrain';
import { TouristPoints } from '../components/TouristPoints';

export default function ARExperience() {
  const { id, countryId } = useParams();
  return <ARSession key={`${id}/${countryId??''}`} />;
}

function ARSession() {
  const { id, countryId } = useParams(), app = useApp(), c = app.continents.find(c => c.id === id);
  const target = useRef<Window | null>(null);
  const [status, setStatus] = useState('Carregando a cena. Autorize o uso da câmera quando o navegador pedir.');
  const [error, setError] = useState(false), [found, setFound] = useState(false), [session, setSession] = useState(0);
  const [selectedPoint,setSelectedPoint]=useState('');
  const [fullscreen,setFullscreen]=useState(false);
  const country = countryId ? c?.paises.find(country => country.id === countryId) : undefined;
  const countryTerrain=useCountryTerrain(c,country);
  if (!c) return <Navigate to="/mapa" replace />;
  const continent = c, unlocked = app.unlocked.includes(c.id);
  if (countryId && !unlocked) return <Navigate to={`/continente/${c.id}`} replace />;
  if (countryId && !country) return <Navigate to={`/paises/${c.id}`} replace />;
  const withoutCamera = country ? `/paises/${c.id}/${country.id}` : `/continente/${c.id}`;
  if (country && !country.modelo) return <main><h1>{country.nome}</h1><p>Este país ainda não tem modelo 3D para ver em RA.</p><Link className="button primary" to={withoutCamera}>Ver sem câmera</Link><Link className="back-link" to="/mapa">Voltar ao mapa</Link></main>;
  if(country&&!countryTerrain.config)return <main><h1>{country.nome}</h1><p role={countryTerrain.error?'alert':'status'}>{countryTerrain.error||'Preparando o relevo do país…'}</p>{countryTerrain.error&&<button className="button secondary" onClick={countryTerrain.retry}>Tentar novamente</button>}<Link className="button primary" to={withoutCamera}>Ver sem câmera</Link></main>;
  const terrain = country ? countryTerrain.config! : getTerrainConfig(c);
  const modelName = country?.nome ?? c.nome;
  function message(m: ARMessage) {
    switch (m.type) {
      case 'ar:ready': setStatus('Câmera pronta. Aponte para o quadrado preto da folha.'); break;
      case 'ar:marker-found':
        if (isStableMarker(continent.id, m.payload)) {
          setFound(true); setStatus('Marcador reconhecido. O modelo acompanha a folha.');
        }
        break;
      case 'ar:marker-lost': setFound(false); setStatus('Marcador perdido. Mantenha a folha plana e o quadrado inteiro no enquadramento.'); break;
      case 'ar:model-loaded': if (!found) setStatus('Modelo pronto. Procurando o marcador da folha…'); break;
      case 'ar:point-selected': if(terrain.points.some(point=>point.id===m.payload?.pointId))setSelectedPoint(String(m.payload?.pointId));break;
      case 'ar:camera-denied': setError(true); setStatus('Câmera bloqueada. Autorize a câmera no ícone de permissões do navegador e tente novamente.'); break;
      case 'ar:camera-error':
        setError(true); setStatus(m.payload?.code === 'NotFoundError' ? 'Não encontramos uma câmera neste aparelho.' : m.payload?.code === 'unsupported' ? 'Este navegador não oferece câmera/WebGL. Use um navegador compatível com HTTPS.' : 'Não foi possível iniciar a câmera. Feche outros aplicativos que a estejam usando e tente novamente.');
        break;
      case 'ar:model-error': setError(true); setStatus('O modelo não carregou. Verifique sua conexão e tente novamente.'); break;
    }
  }
  function zoom(delta: number) {
    sendARMessage(target.current, 'ar:set-scale', { delta });
  }
  return <main className="ar-page">
    <div className="ar-heading"><Link className="back-link" to="/mapa">← Voltar ao mapa</Link><h1>{modelName}<span>Realidade aumentada</span></h1></div>
    <p className="ar-gesture-hint">{country && <>Use a folha de {c.nome} para ver {country.nome}. </>}Arraste para girar. Use dois dedos para ampliar.</p>
    <div className={`ar-stage ${found ? 'recognized' : ''}`}>
      <ARFrame key={`${c.id}/${countryId??''}`} continent={c} modelFile={terrain.file} countryId={country?.id} modelName={modelName} session={session} fullscreen={fullscreen} onExitFullscreen={()=>setFullscreen(false)} onMessage={m => void message(m)} onWindow={w => { target.current = w; }}>
        <div className="ar-view-toolbar"><button className="button secondary" aria-pressed={fullscreen} onClick={()=>setFullscreen(value=>!value)}>{fullscreen?'Sair da tela cheia':'Tela cheia'}</button></div>
        <div className={error ? 'ar-status' : 'sr-only'} role={error ? 'alert' : 'status'}>{status}</div>
        <div className="ar-gesture-space">{!found&&!error&&<div className="marker-framing-guide"><div className="marker-framing-square" aria-hidden="true"><i/><i/><i/><i/></div><p><img src={asset(c.marcador.arquivo)} alt={`Marcador de ${c.nome}: quadrado preto da folha`}/><span>Enquadre este quadrado inteiro.<br/>Deixe uma borda clara ao redor.</span></p></div>}</div>
        {unlocked && <section className="ar-fact" aria-label={country?"Ficha sobreposta do país":"Ficha sobreposta do continente"}><details><summary>Sobre {modelName}</summary>{country?<p>{country.curiosidade}</p>:<><p>{c.fichaCurta.localizacao}</p><p>{c.fichaCurta.curiosidade}</p></>}</details></section>}
        <div className="ar-exit"><Link className="button primary" to={withoutCamera}>{unlocked ? 'Ver sem câmera' : 'Ver dica do QR'}</Link><Link className="button secondary" to="/mapa">Voltar ao mapa</Link></div>
      </ARFrame>
    </div>
    <details className="ar-controls"><summary>Usar botões para mover o modelo</summary><div className="ar-toolbar" role="group" aria-label="Controles do modelo em realidade aumentada">
        <button onClick={() => zoom(.25)} aria-label="Ampliar modelo">＋ Ampliar</button><button onClick={() => zoom(-.25)} aria-label="Reduzir modelo">− Reduzir</button>
        <button onClick={() => sendARMessage(target.current, 'ar:rotate', { degrees: 30 })}>Girar</button>
        <button onClick={() => sendARMessage(target.current, 'ar:reset')}>Restaurar</button>
    </div></details>
    {unlocked&&<TouristPoints points={country?.pontosTuristicos||terrain.points} selected={selectedPoint} onSelect={pointId=>{setSelectedPoint(pointId);if(terrain.points.some(point=>point.id===pointId))sendARMessage(target.current,'ar:select-point',{pointId});}}/>}
    {terrain.note&&<p className="micro">{terrain.note}</p>}
    <div className="ar-summary">
      <p className="micro">Boa iluminação · folha plana · sem reflexos · marcador inteiro no enquadramento</p>
      {error && !unlocked && <div className="camera-help"><img className="guide-image" src={asset(c.dicaQr?.imagem || 'images/guia-qr.svg')} alt="Procure a folha: o QR fica ao lado do marcador preto" /><p>{c.dicaQr?.texto}</p><p>Para estudar sem câmera, descubra primeiro este continente. Se a câmera não abrir, volte ao mapa ou peça ajuda ao professor.</p></div>}
      <div className="actions">
        {unlocked && <Link className="button primary" to={withoutCamera}>{error ? 'Ver em 3D sem câmera' : 'Ver sem câmera'}</Link>}
        {error && <button className="button secondary" onClick={() => { setFound(false); setError(false); setSession(n => n + 1); setStatus('Reiniciando a câmera…'); }}>Tentar novamente</button>}
        <Link className="button secondary" to="/mapa">Minha coleção</Link>
      </div>
      <details><summary>Precisa de ajuda com a câmera?</summary><p>Se a câmera não abrir aqui, tente a realidade aumentada em uma página inteira.</p><a className="button secondary" href={`${asset('ar/scene.html')}?v=${AR_SCENE_VERSION}&${arSceneQuery(c.id,terrain.file,country?.id)}&full=1${app.organizerPreview?'&preview=1':''}`}>Abrir RA em página inteira</a></details>
    </div>
  </main>;
}
