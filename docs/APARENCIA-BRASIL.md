# Aparência do Brasil — 06/11/2026

Esta nota registra a primeira aplicação, restrita ao Brasil. Em seguida, o mesmo perfil foi ampliado às fichas dos 177 países com modelo; o estado atual está em [APARENCIA-PAISES.md](APARENCIA-PAISES.md).

Alteração apenas da instância do visualizador 3D na ficha do Brasil. Sem publicação. A RA, os GLBs, a malha, o exagero vertical, os dados DEM, os rios e as coordenadas dos pontos não foram alterados nesta tarefa. Os ajustes não acrescentam detalhe geográfico que a malha não possua.

Mudanças: acabamento fosco sem efeito metálico na instância exibida, equilíbrio das cores existentes, rios com menos destaque, laterais mais neutras, luz de estúdio lateral suave, sombra de contato reduzida e enquadramento/restauração com mais margem. O ambiente de iluminação é um HDR técnico autoral de 64×32 pixels (aproximadamente 8,5 KB), gerado por `scripts/build-brazil-lighting.mjs`, sem fotografias, sem texturas de terreno e sem luzes dinâmicas ou pós-processamento adicionados.

A personalização usa a API pública de materiais do model-viewer 4.0.0. Os materiais são restaurados ao sair, para preservar as instâncias em cache. Só a chamada da ficha do país BRA ativa o perfil, e o componente ainda exige o caminho exato `models/countries/BRA.glb`. Os demais países e o visualizador de continente usam a configuração existente. A cena AR não recebe esse perfil.

| Antes | Depois | Motivo |
|---|---|---|
| Material metálico na instância do Brasil | Material fosco, metalness 0 | Aparência compatível com terreno |
| Luz neutra uniforme e cores lavadas | Luz lateral suave e ajuste das cores da instância | Tornar as formas existentes mais legíveis |
| Rios muito claros e sombra difusa forte | Rios menos chamativos e sombra reduzida | Menos competição com relevo e pontos |
| Enquadramento em 90% | 112%, repetido ao restaurar | Margem acima do norte do Brasil |

Aplicadas as orientações de interface já consultadas (alteração proporcional ao pedido, identidade/controles/foco preservados), threejs-assets (instância/ciclo de vida dos materiais e recurso local), threejs-spatial-data (coordenadas/posições intocadas) e threejs-performance (sem novos efeitos por quadro, ambiente pequeno e sem promessa de FPS).

Verificado: typecheck, build, 60/60 testes (20 arquivos), incluindo restauração dos materiais e material de linhas sem propriedades PBR; revisão Chrome em 1280/390/320 px e texto 200% em 390 px. Pins/lista, giro, restaurar, retorno Brasil → Benim → Brasil e progresso inalterado conferidos. Benim permaneceu com luz neutra, metalness 1, sombra 0,5 e enquadramento anterior; o perfil do Brasil permaneceu isolado.

SHA-256 comparado antes/depois em 708 arquivos (177 GLBs e metadados/snapshots): todos idênticos. Alterações locais pré-existentes de rios do Brasil, fontes, gerador e artefatos foram preservadas. Não houve simulação de câmera, leitura QR ou rastreamento. Capturas e resultados em `.cache/brazil-appearance/`.

Não validado em celular físico nesta tarefa. A nitidez percebida, o desempenho e o comportamento de carregamento devem ser conferidos no aparelho; o teste automatizado de navegador não equivale a isso. Próximo passo: revisão visual do responsável, mantendo a alteração local.

Arquivos desta tarefa: `src/components/ModelViewer3D.tsx`, `src/pages/Countries.tsx`, `src/services/brazilViewerAppearance.ts`, `scripts/build-brazil-lighting.mjs`, `public/lighting/brazil-soft-key.hdr`, `tests/brazilViewerAppearance.test.ts`, registro autoral em `SOURCES.md`, página de fontes regenerada e esta documentação. `PROGRESSO.md`/`PENDENCIAS.md` locais e roteiro do celular também foram atualizados. Nenhum arquivo pré-existente do gerador de terreno ou da cena AR foi editado nesta tarefa.
