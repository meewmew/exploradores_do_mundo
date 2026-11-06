# Relevo e locais dos países — 06/11/2026

Alteração local, sem publicação. Os 177 países que já tinham GLB agora usam geometria de terreno amostrada de DEM aberto, tanto na ficha como na RA. Os 195 países do catálogo têm um ou dois lugares confirmados: 331 no total. Países sem geometria não recebem uma malha ou altitude fabricada; mantêm símbolo, ficha e lista de lugares.

## Fonte e transformação

O piloto foi o Brasil. Após gerar e conferir sua geometria/orçamento, foi preparada a expansão solicitada. A confirmação do usuário de que já testou e está funcionando refere-se à RA previamente disponível; não é prova de teste físico destas novas malhas. A expansão está local, com validação física registrada como pendência.

DEM: Mapzen Terrain Tiles, de AWS Open Data, composto de fontes abertas SRTM/GMTED2010/ETOPO1 e provedores regionais. O app não acessa o serviço em execução: o download ocorre na preparação, e o navegador carrega somente GLB e metadados locais. `SOURCES.md` e `public/licenses/mapzen-terrain-attribution.md` preservam créditos e licenças. O GLB também contém atribuição.

Cada país tem snapshot versionado em `data-src/dem/countries/`, com coordenada WGS84, elevação em metros, URL/SHA-256 do tile, pixel e zoom. Decodificação Terrarium: R × 256 + G + B / 256 − 32768. Zoom de 6 a 9 nesta geração. A resolução nativa varia entre fornecedores; a resolução nominal do pixel é registrada, mas não é uma promessa de precisão vertical. Não há preenchimento de células sem dado: o gerador interrompe se faltarem valores.

Limites Natural Earth 1:50m; projeção azimutal equivalente de Lambert centrada em cada país. O recorte preserva polígonos/ilhas e buracos disponíveis na fonte, com simplificação adaptada ao orçamento. O pipeline de projeção trata antimeridiano; Fiji e Rússia foram conferidos. Os modelos não representam cada detalhe costeiro ausente da fonte.

Arestas de costas generalizadas podem cruzar células oceânicas do DEM. Valores negativos a até dois pixels do litoral externo Natural Earth, excluindo fronteiras políticas, são normalizados a 0 m para excluir batimetria costeira; depressões negativas internas permanecem. Cada índice tratado é registrado em `coastalClampedVertexIndices`, e o valor DEM bruto permanece intocado no snapshot. A regra é cartográfica e pode suprimir uma depressão muito próxima da borda; não usar a malha para medidas locais. A normalização usa datum mínimo/base, escala horizontal e vertical reversíveis. O exagero vertical é adaptativo, limitado a 160×, e informado na interface; não foram acrescentadas montanhas ou irregularidades procedurais.

Os metadados em `src/data/generated/countries/` e `public/content/countries/` registram projeção, fonte, unidades, datum, normalização, resolução nominal, amostragem, simplificação, exagero e posições dos pontos. O GLB é o mesmo nas duas visualizações, com versão de URL para evitar reaproveitar o contorno plano de cache anterior.

## Lugares e limites

No máximo dois por país, validados pelo schema. Fontes: catálogo oficial UNESCO, Wikidata (entidade/revisão/coordenada/país) e os órgãos oficiais de turismo/patrimônio de Samoa e Trinidad e Tobago. Evidências ficam em `data-src/points/`; seleção em `data-src/country-tourist-spots.json`. Os nomes próprios sem tradução curada mantêm a grafia oficial da fonte. As descrições são breves e conservadoras, sem copiar textos longos ou imagens. A parte derivada da UNESCO mantém CC BY-SA 4.0; Wikidata é CC0.

Há 277 pins ancorados nas malhas e 34 lugares de países com modelo disponíveis apenas em texto: a coordenada oficial não cai em triângulo da silhueta simplificada. Não deslocamos o lugar nem inventamos um ponto de superfície. Os demais 20 lugares estão nos 18 países sem GLB. As listas textuais permanecem acessíveis sem gesto; os pins acompanham a transformação do GLB no modo sem câmera e a matriz do marcador na RA. A perda do marcador mantém o comportamento existente.

## Decisões de interface e 3D

| Antes | Depois | Motivo |
|---|---|---|
| Contorno extrudado por país | Malha com elevação DEM e cores por altitude | Relevo na geometria, sem textura ou simulação |
| País sem lugares na ficha/RA | Até dois locais, pins e alternativa textual | Conteúdo com fonte e acesso sem gesto |
| GLB antigo podia permanecer em cache | Versão no URL do modelo/metadados | Carregar efetivamente o novo terreno |
| Todos os países poderiam carregar metadados juntos | Fetch só do país selecionado, com aborto, erro e nova tentativa | Carga sob demanda e descarte de respostas antigas |

Aplicadas threejs-spatial-data (coordenadas originais separadas das locais e transformação registrada), threejs-assets (carga sob demanda/erros/URL versionado) e threejs-performance (orçamentos mantidos, dois materiais, nenhuma textura, sem alocações novas por quadro). As skills de interface já consultadas orientam reaproveitar identidade, botões, foco e a saída à mesma ficha. Não houve reforma visual ou novas dependências.

## Verificações executadas

- `npm.cmd run build:data` e `node scripts/prepare-ar.mjs`.
- `node scripts/build-country-terrain.mjs --fetch --country BRA` (piloto), depois geração dos 177 e regeneração offline.
- `npm.cmd run build:models`: executou o pipeline completo, com terreno dos países incorporado ao comando existente. A regeneração completa offline reproduziu os 177 GLBs com SHA-256 idêntico; o ajuste costeiro final está incorporado ao mesmo módulo.
- `npm.cmd run typecheck`, `npm.cmd test`: 59/59 em 19 arquivos. Uma execução intermediária foi iniciada durante a escrita do pipeline e descartada por ler arquivos incompletos; a execução válida foi realizada após a regeneração.
- Testes conferem os 177 GLBs, orçamento, materiais/texturas, transformação/altura de cada amostra considerando a normalização costeira, retorno de coordenadas, pins nas posições dos vértices e limite/fontes dos locais.
- Chrome local: Brasil, Nepal, Rússia, Fiji e Andorra carregados; pins/lista/descrição/link de fonte; 320/390/1280 px e texto 200% em 390 px, foco, entrada na RA e retorno ao país, expansão/Escape e remoção do iframe. Vaticano mantém símbolo/locais e não abre RA. Trinidad e Tobago mantém local textual quando não há pin seguro. Sem overflow horizontal ou erros de página. Também reproduzida falha HTTP dos metadados, recuperação por nova tentativa e troca rápida Brasil → Fiji com resposta antiga atrasada: o país anterior não reaparece.
- Revisão em contexto descartável com coleção preparada só para avaliar a interface. Nenhuma imagem de câmera, leitura de QR ou evento de rastreamento foi simulado. Capturas/resultados em `.cache/country-relief-review/`.

Não foi executado teste físico destas novas malhas, medição de FPS/GPU/memória em telefone, nem avaliação com crianças. Seguir o roteiro de `docs/TESTE-NO-CELULAR.md`. Os seis QR/marcadores, PDFs, regras de descoberta, persistência e Organizador foram preservados; não há detecção de superfície.

## Arquivos alterados

Pipeline: `scripts/build-country-terrain.mjs`, `scripts/terrain-tiles.mjs`, `scripts/fetch-country-spots.mjs`, `scripts/fetch-country-landmarks.mjs`, `scripts/build-models.mjs`, `scripts/build-data.mjs`, `scripts/validate-content.mjs` e `scripts/sources-page.mjs`.

Dados/artefatos: `data-src/country-tourist-spots.json`, `data-src/points/`, `data-src/dem/countries/`, cinco JSONs de continentes com países, 177 GLBs em `public/models/countries/`, 177 metadados em cada pasta `src/data/generated/countries/` e `public/content/countries/`, `models-report.json`, `SOURCES.md`, `public/fontes.html`, `public/licenses/mapzen-terrain-attribution.md` e bundle `public/ar/domain.js`.

Aplicativo: `src/hooks/useCountryTerrain.ts`, `src/services/countryTerrain.ts`, `src/services/countryTerrainVersion.ts`, `src/services/contentSchema.ts`, `src/services/arStandalone.ts`, `src/services/arBridge.ts`, `src/types/continent.ts`, `src/pages/Countries.tsx`, `src/pages/ARExperience.tsx`, `src/components/ModelViewer3D.tsx`, `src/components/TouristPoints.tsx`, `public/ar/scene.js` e `public/ar/scene.html`.

Testes: `tests/countryTerrain.test.ts`, `tests/arCountriesNavigation.test.ts`, `tests/arStandalone.test.ts`. Documentação: este relatório, `docs/TESTE-NO-CELULAR.md`, `PROGRESSO.md`, `PENDENCIAS.md` e `SPEC.md`. Os documentos da raiz ignorados pelo Git permanecem locais. Os arquivos do usuário `PROMPT-RA-PAISES.md` e `output/` não foram alterados.

## Números reproduzíveis

```json
{
  "countries": 195,
  "models": 177,
  "places": 331,
  "pins": 277,
  "textOnlyModelPlaces": 34,
  "noGeometry": [
    "SYC",
    "ATG",
    "BRB",
    "GRD",
    "KNA",
    "VCT",
    "MDV",
    "LIE",
    "MLT",
    "MCO",
    "SMR",
    "VAT",
    "MHL",
    "KIR",
    "FSM",
    "NRU",
    "TON",
    "TUV"
  ],
  "noPins": [
    "BLZ",
    "CPV",
    "HRV",
    "KWT",
    "LCA",
    "PLW",
    "SOM",
    "TLS",
    "TTO",
    "URY",
    "VUT"
  ],
  "maxTriangles": 1896,
  "maxBytes": 50612,
  "coastalSamplesNormalized": 6286
}
```
