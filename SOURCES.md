# Fontes e licenças

## [visual-reference-expedition] Interface e paleta enviadas pelo responsável — arquivos 1.png a 6.png, consulta local — referência visual não redistribuída — 2026-11-04
As telas e a prancha infantil orientam a interface: céu azul, papel creme, tinta marinho, ação laranja e apoio amarelo. Os arquivos recebidos não são incluídos no app. A capa usa os contornos Natural Earth já registrados e detalhes vetoriais autorais MIT. O visual anterior de atlas lilás fica registrado apenas como histórico abaixo.

## [font-fredoka] Fredoka, fonte variável — https://github.com/google/fonts/tree/main/ofl/fredoka — SIL Open Font License 1.1 — 2026-11-04
Fonte de títulos e botões. Arquivo oficial servido localmente em `public/fonts/Fredoka.ttf`; licença completa em `public/fonts/Fredoka-OFL.txt`. Sem chamada a serviço externo de fontes durante o uso.

## [font-nunito] Nunito, fonte variável — https://github.com/google/fonts/tree/main/ofl/nunito — SIL Open Font License 1.1 — 2026-11-04
Fonte dos textos e instruções. Arquivo oficial servido localmente em `public/fonts/Nunito.ttf`; licença completa em `public/fonts/Nunito-OFL.txt`.

## [visual-reference-atlas] Paleta da captura enviada pelo responsável — captura local do Exploradores do Mundo — somente consulta de cor; captura não redistribuída — 2026-10-29
Paleta amostrada: fundo `#faf7fd`, lilás `#eeeafb`, destaque `#ded8f5`, pêssego `#f9ddd3`, menta `#d7eee1`, amarelo `#ffedbc`, tinta `#39334f` e apoio `#655a73`. A correção do responsável substitui a direção sálvia. Recolorações e interface autorais MIT, conforme [autoral]. O mapa de capa usa os mesmos contornos Natural Earth já registrados, sem novos dados ou imagens externas.

Consulta original: 2026-10-28; acréscimos identificados em 2026-10-29. Textos educativos são redação original em português baseada em fatos das referências; não reproduzem artigos ou fotografias. Ilustrações e modelos são gerados localmente. Dados históricos são identificados pelo ano e não apresentados como atuais.

## [undata-south-sudan] UNdata, South Sudan — https://data.un.org/legacy/en/iso/ss.html — referência factual; página e tabelas não redistribuídas — 2026-10-29
Campo “Capital city”: Juba. Correção pontual registrada em `data-src/country-facts.json` e aplicada pelo pipeline. O Natural Earth local omitia a capital porque Juba tem `adm0cap: 0` e código `SSD`, enquanto a geometria usa `SDS`. Nenhuma população ou área foi inferida dessa diferença.

## [visual-reference] Referência estética fornecida pelo responsável — ./referencia-visual.png — licença de redistribuição não informada; somente consulta local — 2026-10-29
Inspiração para cores pastel, cartões e hierarquia visual. A imagem, a marca, os textos e os desenhos originais não são distribuídos em `public/` nem no build. A ilustração `public/images/companheiros-de-viagem.svg` é autoral MIT, conforme [autoral]; representa um planeta lúdico, não um mapa geográfico.

## [visual-reference-salvia] Paleta da imagem enviada pelo responsável — imagem local “Sem título.png” — somente consulta de cor; imagem não redistribuída — 2026-10-29
Fundo `#eef3e9`, suporte `#e0e9d8`, neutro `#e0e5d9` e tinta `#344b46` amostrados do arquivo fornecido. Fonte do sistema operacional, sem redistribuição de fontes Apple. Recoloração dos SVGs autorais e novos ícones permanecem MIT, conforme [autoral]. A referência orienta cores; a composição e os desenhos são do projeto.


## [natural-earth] Natural Earth 5.1.2 — https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2/geojson — domínio público — 2026-10-28
`ne_50m_admin_0_countries.geojson`: geometria, nomes em português, POP_EST/POP_YEAR, regiões. `ne_50m_populated_places_simple.geojson`: capitais. Arquivos e SHA-256 em data-src/assets-manifest.json. Licença: https://www.naturalearthdata.com/about/terms-of-use/ . Limites cartográficos simplificados não resolvem disputas territoriais.

## [un-members] ONU, Estados-membros — https://www.un.org/en/about-us/member-states — fatos e nomes; página não redistribuída no app — 2026-10-28
Lista oficial consultada e snapshot de auditoria em data-src/. Contagem gerada pelo cruzamento com Natural Earth; aliases explícitos no script.

## [un-observers] ONU, Estados observadores — https://www.un.org/en/about-us/non-member-states — fatos; página não redistribuída no app — 2026-10-28
Santa Sé e Estado da Palestina, identificados no snapshot de auditoria. Não confundir territórios e áreas disputadas com Estados-membros.

## [country-assignments] Lista e contagens derivadas de ONU e Natural Earth — ./data-src/country-continent.json — nomes/geometrias Natural Earth em domínio público; seleção e código autorais MIT — 2026-10-28
Reproduzível por scripts/build-data.mjs: cruza os 193 nomes de un-members e os dois Estados de un-observers com os códigos Natural Earth, aplica a regra da maior parte do território e exceções documentadas do Cáucaso. Fonte da quantidadePaises e da atribuição didática de país a continente. Distribuição gerada: África 54, América 35, Antártida 0, Ásia 49, Europa 43, Oceania 14; total 195, sem duplicar Estados. Não é uma contagem oficial da ONU por continente.

## [ng-continents] National Geographic, Continent — https://education.nationalgeographic.org/resource/Continent/ — referência factual, redação própria; artigo/imagens não redistribuídos — 2026-10-28
Modelo de sete continentes; neste projeto adaptado ao modelo de seis, com América unificada. Geografia e história agrícola da América.

## [ng-africa] National Geographic, Africa: Physical Geography — https://education.nationalgeographic.org/resource/africa-physical-geography/ — referência factual, redação própria — 2026-10-28
Localização, Saara, ambientes, sal, fauna e flora.

## [ng-asia] National Geographic, Asia: Physical Geography — https://education.nationalgeographic.org/resource/asia/ — referência factual, redação própria — 2026-10-28
Himalaia, climas e ambientes. Fronteira Europa/Ásia é convencional.

## [ng-europa] National Geographic, Europe: Physical Geography — https://education.nationalgeographic.org/resource/europe-physical-geography/ — referência factual, redação própria — 2026-10-28
Penínsulas, relevo, rios e ambientes.

## [ng-oceania] National Geographic, Australia and Oceania: Physical Geography — https://education.nationalgeographic.org/resource/oceania-physical-geography/ — referência factual, redação própria — 2026-10-28
Ilhas e ambientes; modelo escolar trata Oceania como continente.

## [ng-antarctica] National Geographic, Antarctica — https://education.nationalgeographic.org/resource/antarctica/ — referência factual, redação própria — 2026-10-28
Gelo, clima polar, fauna e pesquisa.

## [antarctic-treaty] Secretaria do Tratado Antártico — https://www.ats.aq/e/antarctictreaty.html — referência factual ao tratado; redação própria — 2026-10-28
Uso pacífico, cooperação científica, estações e reivindicações preservadas pelo Artigo IV. Antártida não recebe lista de países.

## [autoral] Exploradores do Mundo, arte e conteúdo gerados neste projeto — ./LICENSE — MIT — 2026-10-28
SVGs ilustrados, ícones, composição das folhas e atividades. Silhuetas/mapas/modelos derivados do Natural Earth (domínio público). Não há texturas ou fotografias externas.

Reformulação de 2026-10-29: `public/images/planeta-guia.svg`, redesenho de `guia-qr.svg` e dos seis SVGs de paisagens, além das cenas de `GuideScene.tsx` e ícones de `InterfaceIcon.tsx`: desenhos vetoriais autorais, MIT. Planeta e mapa dobrado das instruções são lúdicos, sem pretensão cartográfica. Paisagens são recortes ilustrativos, sem representar todos os ambientes de um continente; mantêm os temas já usados no projeto. O diagrama do QR/marcador é esquemático e não substitui as folhas imprimíveis de `public/markers/`. Os SVGs autorais são fontes versionadas independentes: `build:data` atualiza dados e preserva os desenhos. Nenhuma imagem, fonte ou biblioteca externa nova.

## [ar-libraries] A-Frame 1.6.0 e AR.js 3.4.7 — https://github.com/AR-js-org/AR.js/tree/3.4.7 — MIT; ARToolKit incorporado sob LGPL-3.0 — 2026-10-28
Distribuições locais sem alteração funcional em public/vendor/; avisos de licença preservados e cópias em public/vendor/licenses/. A-Frame: https://github.com/aframevr/aframe/tree/v1.6.0 . Parâmetros da câmera provenientes do AR.js. Referência barcode: https://ar-js-org.github.io/AR.js-Docs/marker-based/ . Marcadores binários gerados por algoritmo (sem imagem externa).

Conferência de 2026-11-04: as nove células dos marcadores 0 a 5 foram comparadas aos padrões oficiais em https://github.com/artoolkit/artoolkit5/tree/master/doc/patterns/Matrix%20code%203x3%20(72dpi) . Referências de pixels registradas em `tests/markers.test.ts`; os PNGs continuam gerados pelo algoritmo do projeto. A comparação de arquivos não comprova reconhecimento por câmera física.

## [viewer] Google model-viewer 4.0.0 — https://github.com/google/model-viewer/tree/v4.0.0 — Apache-2.0 — 2026-10-28
Bundle local; Three.js incorporado sob MIT; licenças em public/vendor/licenses/.

## [jsqr] jsQR 1.4.0 — https://github.com/cozmo/jsQR/tree/v1.4.0 — Apache-2.0 — 2026-10-28
Leitura real de QR em frames de getUserMedia. Bundle e licença locais.

## [ui-libraries] React 19.2.0, React DOM 19.2.0, React Router 7.9.4 e Zod 3.25.76 — ./package-lock.json — MIT — 2026-10-28
Versões fixadas no lockfile; avisos de licença copiados dos pacotes para public/vendor/licenses/. Fontes: https://github.com/facebook/react , https://github.com/remix-run/react-router , https://github.com/colinhacks/zod .

## [unesco-giza] Memphis and its Necropolis - the Pyramid Fields from Giza to Dahshur — https://whc.unesco.org/en/list/86/ — CC BY-SA 3.0 IGO (descrição) — 2026-11-04
Descrição curta das Pirâmides de Gizé adaptada em português para o público infantil, com atribuição à UNESCO. A adaptação textual segue CC BY-SA 3.0 IGO; código e ilustrações autorais mantêm suas licenças próprias. Licença: https://creativecommons.org/licenses/by-sa/3.0/igo/ . Nenhuma fotografia copiada.

## [unesco-victoria-falls] Mosi-oa-Tunya / Victoria Falls — https://whc.unesco.org/en/list/509/ — CC BY-SA 3.0 IGO (descrição) — 2026-11-04
Texto infantil adaptado da descrição: rio Zambeze e localização compartilhada por Zâmbia e Zimbábue. Adaptação sob CC BY-SA 3.0 IGO com atribuição à UNESCO. Nenhuma fotografia copiada.

## [unesco-kilimanjaro] Kilimanjaro National Park — https://whc.unesco.org/en/list/403/ — CC BY-SA 3.0 IGO (descrição) — 2026-11-04
Texto infantil adaptado da descrição: montanha vulcânica na Tanzânia e ponto mais alto da África. Adaptação sob CC BY-SA 3.0 IGO com atribuição à UNESCO. Nenhuma fotografia copiada.

## [wikidata-giza] Giza pyramid complex, Q12508 — https://www.wikidata.org/wiki/Q12508 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 do conjunto de Gizé; revisão e precisão declarada preservadas em `data-src/tourist-spots.json`. Dados estruturados: https://www.wikidata.org/wiki/Wikidata:Copyright . Coordenada representativa, sem pretensão de precisão topográfica.

## [wikidata-victoria-falls] Victoria Falls, Q43278 — https://www.wikidata.org/wiki/Q43278 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 das cataratas; revisão e precisão preservadas em `data-src/tourist-spots.json`. Não representa limites do sítio ou uma rota de visitação.

## [wikidata-kilimanjaro] Kilimanjaro, Q7296 — https://www.wikidata.org/wiki/Q7296 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 da montanha; revisão e precisão preservadas em `data-src/tourist-spots.json`. Coordenadas geográficas WGS84 mantidas separadas das posições locais do modelo 3D.

## [noaa-etopo5] NOAA ETOPO5, amostragem global via ERDDAP IOOS — https://erddap.ioos.us/erddap/info/etopo5_EDDGridCopy/index.html — uso e redistribuição gratuitos conforme licença do distribuidor — 2026-11-04
DEM histórico global de 5 minutos de arco, variável `ROSE` em metros, substituído por versões mais recentes. Catálogo e identificador: https://doi.org/10.7289/V5D798BF . O distribuidor autoriza uso e redistribuição gratuitos, com ressalva de inexatidões e sem garantia. Licença integral, URLs das consultas, eixos e hashes das respostas preservados em `data-src/dem/etopo5-global-0.5deg.json`; o recorte africano original permanece em `data-src/dem/etopo5-africa.json`.

Piloto África: amostragem de aproximadamente 0,5 grau, malha projetada de 100 km e exagero vertical de 160 vezes; valores negativos limitados a zero na visualização. Cores por vértice são uma convenção gráfica. Não usar este modelo para medições nem apresentar altura de vértice como altitude exata dos cumes. Processo, transformação reversível e limitações em `docs/AFRICA-DEM.md`. Arquivo GLB adicional; os modelos de contorno anteriores permanecem disponíveis.

## [unesco-grand-canyon] Grand Canyon National Park — https://whc.unesco.org/en/list/75/ — CC BY-SA 3.0 IGO (descrição) — 2026-11-04
Descrição infantil adaptada da página do Patrimônio Mundial; coordenadas vêm do item Wikidata cadastrado separadamente. Sem mídia copiada.

## [unesco-machu-picchu] Historic Sanctuary of Machu Picchu — https://whc.unesco.org/en/list/274/ — CC BY-SA 3.0 IGO (descrição) — 2026-11-04
Descrição infantil adaptada da página do Patrimônio Mundial; coordenadas vêm do item Wikidata cadastrado separadamente. Sem mídia copiada.

## [unesco-iguazu] Iguazu National Park — https://whc.unesco.org/en/list/355/ — CC BY-SA 3.0 IGO (descrição) — 2026-11-04
Descrição infantil adaptada da página do Patrimônio Mundial; coordenadas vêm do item Wikidata cadastrado separadamente. Sem mídia copiada.

## [unesco-great-wall] The Great Wall — https://whc.unesco.org/en/list/438 — CC BY-SA 3.0 IGO (descrição) — 2026-11-04
Descrição infantil adaptada da página do Patrimônio Mundial; coordenadas vêm do item Wikidata cadastrado separadamente. Sem mídia copiada.

## [unesco-taj-mahal] Taj Mahal — https://whc.unesco.org/en/list/252 — CC BY-SA 3.0 IGO — 2026-11-04
Descrição e coordenada representativa conferidas na página do Patrimônio Mundial. Sem mídia copiada.

## [unesco-fujisan] Fujisan, sacred place and source of artistic inspiration — https://whc.unesco.org/en/list/1418 — CC BY-SA 3.0 IGO (descrição) — 2026-11-04
Descrição infantil adaptada da página do Patrimônio Mundial; coordenadas vêm do item Wikidata cadastrado separadamente. Sem mídia copiada.

## [unesco-rome] Historic Centre of Rome — https://whc.unesco.org/en/list/91 — CC BY-SA 3.0 IGO (descrição) — 2026-11-04
Confirma a inclusão do Coliseu no conjunto patrimonial do centro histórico; as coordenadas do monumento vêm do Wikidata. Sem mídia copiada.

## [unesco-acropolis] Acropolis, Athens — https://whc.unesco.org/en/list/404 — CC BY-SA 3.0 IGO — 2026-11-04
Descrição e coordenada representativa do sítio conferidas na página do Patrimônio Mundial. Sem mídia copiada.

## [unesco-paris-seine] Paris, Banks of the Seine — https://whc.unesco.org/en/list/600 — CC BY-SA 3.0 IGO (descrição) — 2026-11-04
Confirma o contexto patrimonial de Paris; o nome e as coordenadas da Torre Eiffel vêm do Wikidata. Sem mídia copiada.

## [unesco-great-barrier] Great Barrier Reef — https://whc.unesco.org/en/list/154 — CC BY-SA 3.0 IGO — 2026-11-04
Descrição e coordenada representativa do sítio conferidas na página do Patrimônio Mundial. O pin fica no recife costeiro e pode aparecer sobre a base do modelo continental.

## [unesco-sydney-opera] Sydney Opera House — https://whc.unesco.org/en/list/166 — CC BY-SA 3.0 IGO — 2026-11-04
Descrição e coordenada representativa conferidas na página do Patrimônio Mundial. Sem mídia copiada.

## [unesco-uluru] Uluru-Kata Tjuta National Park — https://whc.unesco.org/en/list/447 — CC BY-SA 3.0 IGO (descrição) — 2026-11-04
Descrição infantil adaptada da página do Patrimônio Mundial; coordenadas vêm do item Wikidata cadastrado separadamente. Sem mídia copiada.

## [wikidata-grand-canyon] Grand Canyon National Park, Q220289 — https://www.wikidata.org/wiki/Q220289 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 consultados; ponto representativo, não é limite do parque.

## [wikidata-machu-picchu] Machu Picchu, Q676203 — https://www.wikidata.org/wiki/Q676203 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 consultados; ponto representativo, não é limite do sítio.

## [wikidata-iguazu] Iguaçu Falls, Q36332 — https://www.wikidata.org/wiki/Q36332 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 consultados; ponto representativo das cataratas compartilhadas por Brasil e Argentina.

## [wikidata-great-wall] Great Wall of China, Q12501 — https://www.wikidata.org/wiki/Q12501 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 consultados; ponto representativo de um conjunto extenso de fortificações.

## [wikidata-fuji] Mount Fuji, Q39231 — https://www.wikidata.org/wiki/Q39231 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 consultados; posição representativa da montanha.

## [wikidata-colosseum] Colosseum, Q10285 — https://www.wikidata.org/wiki/Q10285 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 consultados; posição representativa do monumento.

## [wikidata-eiffel] Eiffel Tower, Q243 — https://www.wikidata.org/wiki/Q243 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 consultados; posição representativa da torre.

## [wikidata-uluru] Uluṟu-Kata Tjuṯa National Park, Q251999 — https://www.wikidata.org/wiki/Q251999 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 consultados; posição representativa do parque cultural Anangu.

## [wikidata-mcmurdo] McMurdo Station, Q498627 — https://www.wikidata.org/wiki/Q498627 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 consultados; estação de pesquisa na Ilha de Ross.

## [wikidata-amundsen-scott] Amundsen–Scott South Pole Station, Q243307 — https://www.wikidata.org/wiki/Q243307 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 consultados; estação científica junto ao Polo Sul geográfico.

## [wikidata-vostok] Vostok Station, Q211014 — https://www.wikidata.org/wiki/Q211014 — CC0 1.0 — 2026-11-04
Rótulo e coordenada P625 consultados; estação científica no interior da Antártida Oriental.

## [mapzen-terrain] Mapzen Terrain Tiles — https://registry.opendata.aws/terrain-tiles/ — licenças abertas das fontes, com atribuição — 2026-11-05
Dados DEM compostos (SRTM/GMTED2010/ETOPO1 e fornecedores regionais), distribuídos publicamente pelo projeto Mapzen/Linux Foundation em AWS Open Data, sem chave ou conta. Usados exclusivamente na preparação offline; o app serve GLBs locais. Formato Terrarium e fórmula: https://github.com/tilezen/joerd/blob/master/docs/formats.md . Créditos integrais e links das licenças de cada fornecedor preservados em `public/licenses/mapzen-terrain-attribution.md`, obtidos de https://github.com/tilezen/joerd/blob/master/docs/attribution.md . Pixels Web Mercator EPSG:3857 convertidos para coordenadas WGS84; o mosaico tem resolução nativa variável. Cada amostra registra tile/URL/SHA-256, pixel, zoom, coordenada, elevação em metros e resolução nominal do pixel em `data-src/dem/countries/`. Amostragem pelo pixel mais próximo, sem inventar valores ausentes. Metadados da malha registram simplificação, normalização, datum mínimo e exagero vertical por país. Na visualização, amostras negativas até dois pixels do litoral externo Natural Earth, excluindo fronteiras políticas, são normalizadas ao nível do mar para excluir batimetria da costa generalizada; depressões internas são preservadas. Índices tratados ficam nos metadados, e valores originais continuam no snapshot. O recorte é educativo e não mede altitudes exatas de cumes ou monumentos.

## [unesco-country-sites] UNESCO World Heritage List — https://data.unesco.org/explore/assets/whc001/ — CC BY-SA 4.0 — 2026-11-05
Nomes próprios e coordenadas representativas do conjunto oficial `whc001`, sem copiar os textos longos ou imagens. Consulta e SHA-256 das respostas preservados em `data-src/points/unesco-country-sites.json`. Os pontos são escolhidos entre sítios atribuídos ao país pela UNESCO, no máximo dois; nos sítios transnacionais, usa-se somente coordenada componente situada no limite Natural Earth do país. Para sítios de um único país fora da silhueta cartográfica simplificada, manter o local na lista textual sem fabricar pin. Nomes não traduzidos preservam o nome próprio oficial da fonte. Descrição curta redigida pelo projeto identifica a inclusão no Patrimônio Mundial; não representa instrução de acesso ou garantia de visitação. A seleção/adaptação dos dados em `data-src/country-tourist-spots.json` mantém CC BY-SA 4.0 para as partes derivadas desta fonte. Licença: https://creativecommons.org/licenses/by-sa/4.0/ .

## [wikidata-country-sites] Wikidata — locais de interesse por país — https://www.wikidata.org/wiki/Wikidata:Copyright — CC0 1.0 — 2026-11-05
Nomes, coordenadas terrestres P625 e país P17 dos locais selecionados, consultados pela API oficial e por `Special:EntityData`. IDs, consultas, revisão e afirmações de evidência estão em `data-src/points/wikidata-country-sites.json`; cada local também tem link para sua entidade na interface. Rótulos em português podem ser traduções do nome próprio pelo projeto; descrições curtas restringem-se ao país confirmado na fonte. Coordenada representativa não define entrada ou limite da área de visitação. Sem download de fotos e sem reutilização de texto da Wikipédia.

## [tourism-official-sites] National Trust de Trinidad e Tobago e Samoa Tourism Authority — https://nationaltrust.tt/location/fort-king-george-tobago/ — fatos geográficos; textos e imagens não reutilizados — 2026-11-05
Forte King George: nome, país e coordenada dos campos do mapa do órgão nacional de patrimônio. To Sua Ocean Trench: nome, país e coordenada do mapa incorporado pela autoridade oficial de turismo em https://www.samoa.travel/plan-book/activities/to-sua-ocean-trench/ . Extração, URL, coordenada e SHA-256 da página estão em `data-src/points/official-country-sites.json`. Somente nomes próprios e fatos geográficos são utilizados; descrição curta autoral, sem copiar textos, fotos ou cartografia desses sites.
