# Revisão da interface — 2026-10-29

## Direção e escopo

AGENTS.md, SPEC.md, PROGRESSO.md e PENDENCIAS.md lidos integralmente antes da edição. Referência visual inspecionada apenas no disco. Skills frontend-design, emil-design-eng e apple-design lidas e aplicadas. As skills de Three.js não se aplicam: não há alteração de modelos, dados espaciais, renderização ou orçamento 3D.

O projeto já tem uma direção infantil adequada: arte SVG autoral, cores pastel, fichas curtas, mapa com lista alternativa e exploração por model-viewer. Preservar esses elementos e os cinco fluxos da SPEC §14. A referência orienta a acolhida, o arredondamento e a hierarquia; seus desenhos, marca e arquivo não entram no app.

## Plano visual

Paleta: fundo névoa `#faf7fd`, tinta ameixa `#39334f`, lavanda `#ded8f5`, pêssego `#f9ddd3`, menta `#d7eee1`, rosa `#ffe5f0`. Tinta secundária `#655a73` e foco `#62549b` preservados. Pastéis como superfícies, texto escuro e bordas de controles contrastantes. Não usar as cores dos continentes como texto. Borda de controle ajustada de `#887a96` para `#80718e`: 3,26:1 sobre lavanda e 4,50:1 sobre branco. É um refinamento da paleta já adaptada no projeto; o rosa permanece como superfície.

Tipografia: Trebuchet MS, com Segoe UI/Arial como alternativas locais. Corpo e controles a partir de 1rem; títulos arredondados pela fonte existente, em sentence case, com escala fluida e linhas curtas. Sem novas fontes ou dependências.

Layout: início com mensagem de boas-vindas, companheiros de viagem e uma ação principal. Organizador em área própria. Nas telas internas, título direto, contexto curto e ações próximas do conteúdo. No celular, uma coluna para fichas/editor e duas colunas confortáveis para a coleção. O mapa continua com rolagem horizontal e alternativa por lista. A câmera mantém sua área própria com status, resumo e saídas distribuídos verticalmente.

```text
Início                      Ficha                      Câmera
marca + navegação           voltar + título + RA       voltar + continente
acolhida | ilustração       modelo | ficha curta       status
explorar + coleção          países + atividade         área de reconhecimento
passos / Organizador        informações expansíveis    resumo + saída
                                                       controles + ajuda
```

A personalidade vem dos companheiros de viagem e do mapa real do projeto. Evitar adicionar decoração repetitiva ou transformar cada parágrafo em um cartão. Animação apenas como resposta ao toque e confirmação; sem movimento contínuo. Revisado contra o pedido antes de implementar.

## Revisão do código

| Before | After | Why |
| --- | --- | --- |
| Textos de apoio entre 0,5rem e 0,9rem | Corpo, rótulos e apoio a partir de 1rem | Leitura infantil e zoom no celular |
| Navegação em coluna e títulos genéricos longos | Navegação agrupada e títulos que identificam a tela | Localização e ação mais claras |
| Vários ajustes CSS sobrepostos nos mesmos componentes | Regras organizadas por base, componentes e acolhida | Consistência sem multiplicar exceções |
| Hover move botões em qualquer dispositivo | Feedback breve ao pressionar, hover só com ponteiro preciso | Evitar estados presos no toque |
| Resumo e saídas RA em coordenadas absolutas | Camadas de interface distribuídas em coluna | Evitar colisão com texto ampliado |
| Erro 3D sem ação local de recuperação | Estado de erro e botão de recarregar o modelo | Próximo passo junto ao problema |

## Verificação

Implementação local concluída. `npm.cmd run typecheck`, `npm.cmd test` (11/11, dois arquivos) e `npm.cmd run build` passaram. O build validou conteúdo, fontes e arquivos dos seis continentes. `git diff --check` passou. A regressão de HTML existente passou a conferir também o retorno ao Organizador na ficha já descoberta; não executa DOM interativo, câmera ou WebGL.

`node scripts/check-ui-contrast.mjs`: 29/29 pares principais aprovados. Textos: mínimo 4,67:1; foco avaliado: mínimo 5,46:1; bordas de controle: mínimo 3,26:1. Cálculo pela luminância relativa sRGB e razão `(LmaisClara + 0,05) / (LmaisEscura + 0,05)`. Isso verifica os pares do sistema de cores, não certifica toda a experiência WCAG. Texto de apoio e controles a partir de 1rem; botões/links de ação com mínimo de 44 px (principais com 52 px). Rótulos do mapa mantêm pelo menos 16,8 px e 47 px de altura na escala mínima de 840 px; há lista alternativa.

Revisão visual no navegador NÃO EXECUTADA: o host de automação de navegador estava indisponível; a alternativa nativa de Computer Use recusou Edge e Chrome por falta de autorização. Não foram feitas novas tentativas por outro mecanismo. O servidor de inspeção local foi encerrado. Câmera/QR/RA, WebGL, áudio, leitura de tela, toque, zoom e layout em aparelhos físicos continuam NÃO VALIDADOS. Roteiro acrescentado em docs/TESTE-NO-CELULAR.md.

Nenhum serviço de domínio, regra de reconhecimento/desbloqueio, repositório de persistência, hash/sessão ADM, dados, modelos, URL de rota ou dependência foi alterado. A cena AR continua independente, com a mesma ponte postMessage e teardown. O plano B continua acessível pela ajuda da câmera. Nenhum recurso visual novo nem material externo foi adicionado; a referência local não entrou no build.

## Arquivos alterados

| Grupo | Arquivos | Mudança |
|---|---|---|
| Base visual | `src/styles/app.css`, `components.css`, `playful.css`, `tokens.css`; `public/styles/tokens.css` | Tipografia, responsividade, contraste, foco, áreas de toque, movimento reduzido, agrupamento e camadas da câmera; cópia dos tokens para cena isolada |
| Entrada e navegação | `src/pages/Home.tsx`, `Orientation.tsx`, `Collection.tsx`; `src/components/Navigation.tsx`, `WorldMap.tsx` | Acolhida, sequência de orientação, progressos separados, coleção, ações e estados acessíveis |
| Fichas e atividades | `src/pages/Continent.tsx`, `Countries.tsx`, `Activity.tsx`, `Completion.tsx`, `Settings.tsx` | Hierarquia e linguagem; retorno contextual ao Organizador; alternativas confortáveis no celular |
| Câmera | `src/pages/ARExperience.tsx`, `QRScanner.tsx` | Título e status claros, resumo e saídas sem coordenadas rígidas, ajuda expansível e controles textuais |
| Visualizador | `src/components/ModelViewer3D.tsx` | Carga/erro, tentar novamente, controles disponíveis após carga e câmera sem interpolação com movimento reduzido; mesmos modelos/renderizador |
| Organizador | `src/pages/Organizer.tsx`; `src/components/OrganizerEditor.tsx` | Ações agrupadas por continente, rótulos de importar/exportar rascunho e foco no painel de revisão |
| Verificações | `tests/navigation.test.ts`; `scripts/check-ui-contrast.mjs` | Regressão do retorno público e cálculo reproduzível de contraste |
| Registro | `PROGRESSO.md`, `PENDENCIAS.md`, `docs/TESTE-NO-CELULAR.md`, este relatório | Resultados, limites e próximo passo manual |
