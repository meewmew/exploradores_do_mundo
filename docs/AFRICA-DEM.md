# África: piloto de relevo 3D real

O arquivo `public/models/africa-terrain.glb` representa elevações obtidas de um DEM real, e não uma textura de relevo sombreado ou uma superfície procedural. É um piloto somente da África, preparado para o visualizador sem câmera e para a cena de RA por solicitação explícita do responsável. Os GLBs de contorno existentes foram preservados.

## Origem e licença

Fonte: **NOAA ETOPO5**, publicado em 1993; [catálogo NOAA](https://www.ncei.noaa.gov/products/etopo-global-relief-model), [DOI 10.7289/V5D798BF](https://doi.org/10.7289/V5D798BF). Dados servidos pelo [ERDDAP IOOS, conjunto `etopo5_EDDGridCopy`](https://erddap.ioos.us/erddap/info/etopo5_EDDGridCopy/index.html), variável `ROSE`, em metros. Metadados e licença foram consultados em 2026-11-04. A licença registrada pelo distribuidor permite uso e redistribuição gratuitos, com ressalva de inexatidões e sem garantia. Identificador em `SOURCES.md`: `noaa-etopo5`.

ETOPO5 é um conjunto **histórico e substituído por versões mais recentes**. Foi escolhido para este piloto por permitir um recorte pequeno, aberto e reprodutível, sem dependências adicionais. A tentativa de acesso direto ao ETOPO1 pela NOAA falhou por conexão. O piloto não deve ser apresentado como medição atual, modelo de engenharia ou representação exata de cumes e monumentos.

O recorte preservado em `data-src/dem/etopo5-africa.json` contém a licença do servidor, histórico, URLs exatas e SHA-256 das duas respostas CSV. São 149 × 185 amostras, cobrindo aproximadamente 36°S–38°N e 27°O–65°L, inclusive Madagascar. O eixo de longitude original 0–360° é convertido para -180–180°; os valores efetivos dos eixos são preservados, sem pressupor espaçamento decimal perfeito.

Requisições de origem:

- `https://erddap.ioos.us/erddap/griddap/etopo5_EDDGridCopy.csv?ROSE[(-36):6:(38)][(333):6:(359.92)]`
- `https://erddap.ioos.us/erddap/griddap/etopo5_EDDGridCopy.csv?ROSE[(-36):6:(38)][(0):6:(65)]`

O dado original tem espaçamento de 5 minutos de arco. Este recorte seleciona uma amostra a cada seis nós: aproximadamente **0,5°**, cerca de 56 km no sentido norte–sul. Não é uma média nem preserva todos os picos do conjunto original.

## Construção da malha

O contorno vem dos países africanos do Natural Earth 1:50m já usados pelo projeto, dissolvidos e simplificados. Ilhas menores que 0,000002 esferorradianos são omitidas no piloto; Madagascar permanece. O limiar é cartográfico, não uma área oficial de países.

Projeção: azimutal equivalente de Lambert em esfera de raio convencional 6.371.000 m, centro 20°L, 2°N. A malha é recortada pelo contorno em células projetadas de **100 km**, trianguladas com `earcut`. A altura de cada vértice usa interpolação bilinear dos quatro nós vizinhos do DEM real. Valores negativos são limitados a zero na exibição para excluir batimetria nas células costeiras; isso também omite depressões terrestres abaixo do nível do mar. Os valores negativos originais continuam no arquivo de origem.

O eixo +X aponta para leste, -Z para norte e +Y para cima. A origem e o fator horizontal, reversíveis, estão em `normalization`; a superfície tem base de 0,025 unidade e **exagero vertical de 160 vezes**. O exagero serve à leitura visual do continente e não altera os dados de origem. Cores por vértice distinguem faixas de elevação; são uma convenção gráfica, sem textura ou fotografia de satélite. O modelo possui dois materiais opacos.

As coordenadas dos três pontos de interesse vêm de `data-src/tourist-spots.json`, com fontes por campo. Cada ponto é inserido como um vértice da própria superfície; `posicao: [x,y,z]` usa o mesmo referencial local do GLB. A altura é a amostra simplificada do terreno, **não a altura da pirâmide, da queda-d'água ou do cume**. Não exibir essas alturas como dados turísticos.

O contrato é idêntico em `src/data/generated/africa-terrain.json` e `public/content/africa-terrain.json`: `file`, `sourceIds`, `verticalExaggeration`, `projection`, `normalization`, `dem`, `limits`, `points` e `pointPositions`. As posições dos pontos são arredondadas a oito casas depois da conversão float32, coerentes com o GLB.

## Reproduzir e verificar

`node scripts/fetch-africa-dem.mjs` baixa novamente o recorte e registra sua proveniência. Esse passo requer rede; a geração normal usa o arquivo de origem versionado e funciona offline.

`npm.cmd run build:models` inclui o piloto no pipeline existente e no `models-report.json`. Para reconstruir somente o piloto durante desenvolvimento: `node scripts/build-africa-terrain.mjs`. Não substitui os GLBs de contorno. `npm.cmd run check:budget` continua sendo a única checagem de orçamento do projeto, com os mesmos limites de 20.000 triângulos e 400 KB.

Primeira geração: **9.731 triângulos, 291.640 bytes (284,80 KiB), dois materiais, nenhuma textura**, raio máximo aproximado 0,95033 e base em Y=0. Metadados incluem o hash do DEM usado. Testes adicionais verificam tamanho, triângulos, coordenadas, pins sobre vértices reais da superfície e a transformação geográfica reversível.

Desempenho e rastreamento em celular físico continuam **não validados**. A malha da África foi o piloto e a mesma pipeline foi ampliada aos outros cinco continentes. Para validar a versão completa, executar em cada um o roteiro de RA/sem câmera e registrar carregamento, interação, câmera e cinco ciclos de entrada/saída no mesmo aparelho, viewport e DPR. Quantidade de triângulos e tamanho do arquivo, isoladamente, não comprovam fluidez.
