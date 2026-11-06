const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const groups = [
  { title: 'Geografia, países e continentes', matches: id => !/^(font-|visual-reference|unesco-|wikidata-|noaa-|mapzen-|tourism-)/.test(id) && !['autoral', 'ar-libraries', 'viewer', 'jsqr', 'ui-libraries'].includes(id) },
  { title: 'Lugares de interesse e relevo', matches: id => /^(unesco-|wikidata-|noaa-|mapzen-|tourism-)/.test(id) },
  { title: 'Letras, ilustrações e autoria', matches: id => id.startsWith('font-') || id === 'autoral' },
  { title: 'Bibliotecas e licenças de software', matches: id => ['ar-libraries', 'viewer', 'jsqr', 'ui-libraries'].includes(id) },
  { title: 'Referências visuais da interface', matches: id => id.startsWith('visual-reference') },
];

function inline(text) {
  return text.split(/(`[^`]+`|https?:\/\/[^\s<>"`]+)/g).map(part => {
    if (part.startsWith('`') && part.endsWith('`')) return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
    if (/^https?:\/\//.test(part)) return `<a href="${escapeHtml(part)}">${escapeHtml(part)}</a>`;
    return escapeHtml(part);
  }).join('');
}

function reference(entry) {
  const [title, address, license, date] = entry.heading.split(' — ');
  const link = /^https?:\/\//.test(address ?? '') ? `<a class="reference-link" href="${escapeHtml(address)}">Consultar a fonte</a>` : '';
  const paragraphs = entry.body.trim().split(/\n\s*\n/).filter(Boolean).map(paragraph => `<p>${inline(paragraph.replace(/\s*\n\s*/g, ' '))}</p>`).join('\n');
  const consulted = /^\d{4}-\d{2}-\d{2}$/.test(date ?? '') ? `Consulta em ${date.split('-').reverse().join('/')}.` : '';
  return `<article id="${escapeHtml(entry.id)}" class="reference">
    <h3>${escapeHtml(title)}</h3>
    <p class="reference-meta">${escapeHtml(license ?? '')}${consulted ? ` · ${consulted}` : ''}</p>
    ${paragraphs}
    ${link}
    ${entry.id==='mapzen-terrain'?'<a href="licenses/mapzen-terrain-attribution.md">Créditos e licenças de todos os fornecedores do terreno</a>':''}
  </article>`;
}

export function renderSourcesPage(sources) {
  const entries = [...sources.replaceAll('\r\n', '\n').matchAll(/^## \[([^\]]+)\] (.+)\n([\s\S]*?)(?=^## \[|$(?![\s\S]))/gm)].map(match => ({ id: match[1], heading: match[2], body: match[3] }));
  const expected = [...sources.matchAll(/^## \[([^\]]+)\]/gm)];
  if (entries.length !== expected.length || entries.some(entry => groups.filter(group => group.matches(entry.id)).length !== 1)) throw Error('Todas as fontes devem aparecer em exatamente um grupo.');
  const references = groups.map(group => `<details class="reference-group"><summary>${group.title}</summary><div class="reference-list">${entries.filter(entry => group.matches(entry.id)).map(reference).join('\n')}</div></details>`).join('\n');

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Conheça as fontes de pesquisa, os créditos e as licenças do Exploradores do Mundo.">
  <title>Fontes e licenças · Exploradores do Mundo</title>
  <link rel="stylesheet" href="styles/tokens.css">
  <link rel="stylesheet" href="styles/fontes.css">
</head>
<body>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <header class="page-header">
    <a class="project-name" href="./">Exploradores do Mundo</a>
    <a class="back-link" href="./">Voltar ao app</a>
  </header>
  <main id="conteudo">
    <div class="page-intro">
      <h1>Fontes e licenças</h1>
      <p>Veja de onde vêm as informações, os mapas, as letras e os recursos usados no Exploradores do Mundo.</p>
    </div>
    <nav class="section-links" aria-label="Nesta página">
      <a href="#pesquisa">Informações e mapas</a>
      <a href="#criacao">Letras e ilustrações</a>
      <a href="#tecnologia">Tecnologia</a>
      <a href="#referencias">Referências completas</a>
    </nav>
    <section id="pesquisa" class="content-section" aria-labelledby="pesquisa-titulo">
      <h2 id="pesquisa-titulo">De onde vêm as informações?</h2>
      <p>Os textos foram escritos em português para explicar os continentes de forma simples. A pesquisa usa as referências abaixo.</p>
      <dl class="source-overview">
        <div><dt>Mapas e países</dt><dd>O <a href="#natural-earth">Natural Earth</a> fornece os contornos dos mapas e dados geográficos. As listas de países e as informações sobre capitais também consultam a <a href="#un-members">ONU</a> e a <a href="#undata-south-sudan">UNdata</a>.</dd></div>
        <div><dt>Continentes e ambientes</dt><dd>Os materiais educativos da <a href="#ng-continents">National Geographic</a> ajudam a explicar o relevo, os climas, a fauna e a flora. O <a href="#antarctic-treaty">Tratado Antártico</a> é uma referência para o conteúdo sobre a Antártida.</dd></div>
        <div><dt>Lugares de interesse</dt><dd>As descrições consultam a <a href="#unesco-giza">UNESCO</a>, e as localizações usam referências da UNESCO e do <a href="#wikidata-giza">Wikidata</a>. Os textos adaptados da UNESCO recebem os créditos e a licença indicados nas referências completas.</dd></div>
        <div><dt>Relevo em 3D</dt><dd>Os dados de elevação do <a href="#noaa-etopo5">NOAA ETOPO5</a> ajudam a representar o relevo dos continentes nos modelos 3D. Os países usam o DEM composto do <a href="#mapzen-terrain">Mapzen e seus fornecedores</a>, com <a href="licenses/mapzen-terrain-attribution.md">créditos e licenças completos</a>.</dd></div>
      </dl>
      <aside class="reading-note"><h3>Um cuidado com os dados</h3><p>As populações são acompanhadas do ano de referência. Dados ainda não confirmados não são apresentados como definitivos. Os mapas são simplificados e não resolvem disputas territoriais.</p></aside>
    </section>
    <section id="criacao" class="content-section" aria-labelledby="criacao-titulo">
      <h2 id="criacao-titulo">As letras e as ilustrações</h2>
      <p>A <a href="#font-fredoka">Fredoka</a> aparece nos títulos e botões. A <a href="#font-nunito">Nunito</a> é usada nos textos e nas instruções. As duas são fontes livres, com licença SIL Open Font License 1.1.</p>
      <p>As ilustrações, os ícones e as atividades foram criados para o projeto. Os mapas e as silhuetas usam os contornos do Natural Earth, que são de domínio público. As imagens recebidas como inspiração visual não são distribuídas no app.</p>
      <p class="license-links"><a href="fonts/Fredoka-OFL.txt">Licença da Fredoka</a><a href="fonts/Nunito-OFL.txt">Licença da Nunito</a><a href="licenses/projeto-MIT.txt">Licença das criações do projeto</a></p>
    </section>
    <section id="tecnologia" class="content-section" aria-labelledby="tecnologia-titulo">
      <h2 id="tecnologia-titulo">A tecnologia por trás da exploração</h2>
      <p>O projeto usa bibliotecas de código aberto para mostrar os modelos 3D, ler os QR Codes e criar a experiência de realidade aumentada.</p>
      <dl class="source-overview">
        <div><dt>Realidade aumentada</dt><dd><a href="#ar-libraries">A-Frame e AR.js</a>, com ARToolKit, permitem acompanhar o marcador impresso.</dd></div>
        <div><dt>Modelos 3D e QR Codes</dt><dd>O <a href="#viewer">model-viewer</a> mostra os modelos sem câmera. O <a href="#jsqr">jsQR</a> faz a leitura dos QR Codes dentro do app.</dd></div>
        <div><dt>Interface e conteúdo</dt><dd><a href="#ui-libraries">React, React DOM, React Router e Zod</a> ajudam a organizar as telas, a navegação e a validação do conteúdo.</dd></div>
      </dl>
      <p>Esses recursos mantêm suas próprias licenças: MIT, Apache 2.0 e LGPL 3.0, conforme cada biblioteca. Os avisos e os links para o código-fonte estão disponíveis no <a href="vendor/NOTICE.txt">registro das bibliotecas</a> e nas referências abaixo.</p>
    </section>
    <section id="referencias" class="content-section" aria-labelledby="referencias-titulo">
      <h2 id="referencias-titulo">Referências completas</h2>
      <p>Abra um assunto para consultar os materiais originais, as datas de pesquisa e as condições de uso.</p>
      ${references}
    </section>
  </main>
  <footer class="page-footer"><p>Exploradores do Mundo · Fontes, créditos e condições de uso.</p><a href="./">Voltar ao app</a></footer>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}
