import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { useCountryShortcut } from '../hooks/useCountryShortcut';
import { ModelViewer3D } from '../components/ModelViewer3D';
import { ListenButton } from '../components/ListenButton';
import { asset, descriptionForYear } from '../services/contentRepository';
import type { Sourced } from '../types/continent';
import { DiscoveryGuide } from '../components/DiscoveryGuide';
import { InterfaceIcon } from '../components/InterfaceIcon';
import { getTerrainConfig } from '../services/terrain';

export function Datum({ label, data, unit = '' }: { label: string; data: Sourced<number>; unit?: string }) {
  return <div className="datum"><dt>{label}</dt><dd>
    {data.valor === null || data.verificar ? 'Dado em verificação' : `${new Intl.NumberFormat('pt-BR').format(data.valor)}${unit}`}
    <small>Fonte: {data.fonte}</small>
  </dd></div>;
}

export default function Continent() {
  const { id } = useParams(), app = useApp(), location = useLocation();
  const c = app.continents.find(c => c.id === id);
  const shortcut = useCountryShortcut(c?.id);
  if (!c) return <Navigate to="/mapa" replace />;
  const unlocked = app.unlocked.includes(c.id);
  const terrain = getTerrainConfig(c);
  if (!unlocked) return <main className="narrow locked-page">
    {location.state?.organizerPublicView === true ? <div className="organizer-public-preview-bar"><span>Visualização pública do conteúdo publicado</span><Link className="button secondary" to="/organizador">Voltar ao Organizador</Link></div> : <Link className="back-link" to="/mapa">← Voltar ao mapa</Link>}
    <span className="discovery-state"><InterfaceIcon name="lock" />Ainda não descoberto</span>
    <h1>{c.nome}</h1>
    <p className="discovery-lead">Encontre o QR Code na folha da turma.</p>
    <DiscoveryGuide image={c.dicaQr?.imagem} />
    <p>{c.dicaQr?.texto}</p>
    <div className="actions">
      <Link className="button primary" to={`/qr/${c.id}`}><InterfaceIcon name="scan" />Escanear QR code</Link>
      <Link className="button secondary" to={`/ar/${c.id}`}>Iniciar realidade aumentada</Link>
    </div>
    <p className="micro">Para guardar este continente na coleção, leia o QR aqui no app ou aponte a câmera para o marcador da folha.</p>
  </main>;

  return <main className="continent-page">
    {location.state?.organizerPublicView === true ? <div className="organizer-public-preview-bar"><span>Visualização pública do conteúdo publicado</span><Link className="button secondary" to="/organizador">Voltar ao Organizador</Link></div> : <Link className="back-link" to="/mapa">← Voltar ao mapa</Link>}
    {location.state?.discovered === true && <div className="notice success discovery-notice" role="status">
      <span aria-hidden="true">✦</span><div><strong>Continente descoberto!</strong><p>{c.nome} agora faz parte da sua coleção. Vamos conhecer?</p></div>
      <Link className="button secondary" to="/mapa">Minha coleção</Link>
    </div>}
    <div className="page-heading"><div><span className="eyebrow">✓ Continente descoberto</span>
      <h1>{c.nome}<span className="title-dot" style={{ background: c.cor }} /></h1></div>
      <Link className="button secondary" to={`/ar/${c.id}`}>Ver em RA ↗</Link>
    </div>
    <div className="explore-layout">
      <ModelViewer3D key={c.id} file={terrain.file} name={c.nome} points={terrain.points} terrainNote={terrain.note} />
      <section className="fact-card country-sheet" ref={shortcut.sheetRef}>
        {c.id !== 'antartida' && <>
          <div className="sheet-grip" aria-hidden="true" onPointerDown={shortcut.onPointerDown} onPointerMove={shortcut.onPointerMove} onPointerUp={shortcut.onPointerUp} onPointerCancel={shortcut.onPointerCancel} onLostPointerCapture={shortcut.onLostPointerCapture}><span /></div>
          {shortcut.showHint && <div className="gesture-hint"><p>Arraste a alça para baixo ou toque em “Conhecer os países”.</p><button onClick={shortcut.dismissHint} aria-label="Fechar dica de gesto">Entendi</button></div>}
        </>}
        <img className="fact-art" src={asset(c.fichaCurta.ilustracao)} alt={c.fichaCurta.ilustracaoAlt} />
        <div className="fact-heading"><InterfaceIcon name="book" /><span>Sua ficha de descobertas</span></div>
        <h2>Onde fica?</h2><p>{c.fichaCurta.localizacao}</p>
        <h2>Você sabia?</h2><p>{c.fichaCurta.curiosidade}</p>
        <ListenButton text={`${c.nome}. ${c.fichaCurta.localizacao} ${c.fichaCurta.curiosidade}`} audioUrl={c.audioUrl} />
        <details><summary>Saiba mais</summary>
          <p>{descriptionForYear(c, app.year)}</p><p>{c.saibaMais?.texto}</p>
          <dl><Datum label="Área" data={c.areaKm2} unit=" km²" />
            <Datum label={`População${c.populacao.anoReferencia ? ` (${c.populacao.anoReferencia})` : ''}`} data={c.populacao} />
            <Datum label="Países no critério da coleção" data={c.quantidadePaises} /></dl>
          {(['caracteristicasGeograficas', 'climas', 'faunaFlora', 'cultura'] as const).map(k => <p key={k}>
            <strong>{{ caracteristicasGeograficas: 'Paisagens', climas: 'Climas', faunaFlora: 'Fauna e flora', cultura: 'Pessoas e histórias' }[k]}: </strong>{c[k].join(' · ')}
          </p>)}
          <p className="micro">{c.quantidadePaises.criterio}</p>
          {c.saibaMais?.links?.map(l => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.titulo} ↗</a>)}
        </details>
        {c.id !== 'antartida' && <Link className="button secondary country-entry" to={`/paises/${c.id}`}>Conhecer os países →</Link>}
      </section>
    </div>
    <div className="study-actions"><Link className="button primary" to={`/atividade/${c.id}`}>Fazer atividade ✦</Link><Link className="button secondary" to="/mapa">Voltar ao mapa</Link></div>
  </main>;
}
