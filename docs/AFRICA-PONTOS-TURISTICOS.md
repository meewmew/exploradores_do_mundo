# Pontos de interesse — piloto da África

Três locais reconhecidos foram escolhidos para o piloto: Pirâmides de Gizé, Cataratas Vitória e Kilimanjaro. A seleção é editorial; não é um ranking de visitação ou uma afirmação de que seriam os três locais mais famosos do continente.

Os dados-fonte estão em `data-src/tourist-spots.json`. Cada local registra fonte por campo: nome, descrição curta e coordenadas. O arquivo também preserva as revisões, os IDs das declarações P625 e a precisão declarada dos registros Wikidata consultados em **2026-11-04**. `npm run build:data` incorpora os pontos à ficha da África sem acessar a rede.

| ID do ponto | Nome na interface | Latitude | Longitude | Fonte da coordenada |
|---|---|---:|---:|---|
| `piramides-gize` | Pirâmides de Gizé | 29.976111 | 31.132778 | [Wikidata Q12508](https://www.wikidata.org/wiki/Q12508) |
| `cataratas-vitoria` | Cataratas Vitória | -17.924777777778 | 25.858055555556 | [Wikidata Q43278](https://www.wikidata.org/wiki/Q43278) |
| `kilimanjaro` | Kilimanjaro | -3.0666666666667 | 37.359166666667 | [Wikidata Q7296](https://www.wikidata.org/wiki/Q7296) |

Latitude e longitude estão em graus decimais, no referencial geográfico WGS84. São pontos representativos das entidades, não delimitações dos sítios, portões de entrada nem rotas para visitantes. Os valores numéricos reproduzem os registros consultados; o número de casas decimais não garante precisão física correspondente. A precisão declarada é, respectivamente, 0,00001°, 0,000027777777777778° e 0,00027777777777778°.

A posição local do pin é calculada pelo pipeline 3D com a mesma projeção e normalização do modelo correspondente. As coordenadas geográficas e os IDs originais devem permanecer separados das posições locais de renderização. Não foi acrescentada imagem nem qualquer mídia externa.

## Fatos e fontes propostas para SOURCES.md

| ID de fonte | URL | Uso factual | Licença da fonte |
|---|---|---|---|
| `unesco-giza` | [UNESCO — Memphis and its Necropolis](https://whc.unesco.org/en/list/86/) | Gizé no Egito, suas três pirâmides e os monumentos funerários reais do Egito Antigo. | Descrição identificada como CC BY-SA IGO 3.0. |
| `unesco-victoria-falls` | [UNESCO — Mosi-oa-Tunya / Victoria Falls](https://whc.unesco.org/en/list/509/) | Quedas do rio Zambeze compartilhadas pela Zâmbia e pelo Zimbábue. | Descrição identificada como CC BY-SA IGO 3.0. |
| `unesco-kilimanjaro` | [UNESCO — Kilimanjaro National Park](https://whc.unesco.org/en/list/403/) | Montanha vulcânica na Tanzânia e ponto mais alto da África. | Descrição identificada como CC BY-SA IGO 3.0. |
| `wikidata-giza` | [Wikidata Q12508](https://www.wikidata.org/wiki/Q12508) | Nome e coordenada P625 do complexo de Gizé, revisão 2532273260. | Dados estruturados CC0 1.0. |
| `wikidata-victoria-falls` | [Wikidata Q43278](https://www.wikidata.org/wiki/Q43278) | Nome e coordenada P625 das cataratas, revisão 2564429950. | Dados estruturados CC0 1.0. |
| `wikidata-kilimanjaro` | [Wikidata Q7296](https://www.wikidata.org/wiki/Q7296) | Nome e coordenada P625 da montanha, revisão 2562617120. | Dados estruturados CC0 1.0. |

As frases infantis são sínteses em português dos fatos citados, com até 140 caracteres, e são distribuídas como adaptações sob [CC BY-SA IGO 3.0](https://creativecommons.org/licenses/by-sa/3.0/igo/). A atribuição às páginas da UNESCO, a indicação de adaptação e essa licença devem acompanhar os textos em `SOURCES.md` e na página pública de fontes; nenhuma fotografia ou texto extenso foi copiado. A [política oficial do Wikidata](https://www.wikidata.org/wiki/Wikidata:Copyright) confirma CC0 para dados estruturados. Os rótulos portugueses também foram conferidos nas entidades. O uso de [WGS84 é documentado na propriedade P625](https://www.wikidata.org/wiki/Property:P625).

## Verificações e limite do piloto

O schema aceita zero a cinco pontos por continente, com IDs únicos, coordenadas finitas e dentro dos intervalos geográficos, nome e descrição não vazios, descrição até 140 caracteres e fontes obrigatórias. Nesta versão, os seis continentes têm três pontos cada. Este documento detalha o piloto original da África; as demais fontes estão registradas em `SOURCES.md`, e os dados completos ficam em `data-src/tourist-spots.json`.

Os testes conferem a correspondência entre coordenadas geradas e os registros locais de evidência, a preservação pelo pipeline e a rejeição de coordenadas inválidas/IDs duplicados. A fonte e a geometria não equivalem a validação física de RA; alinhamento, legibilidade e toque dos pins precisam ser conferidos em celular.
