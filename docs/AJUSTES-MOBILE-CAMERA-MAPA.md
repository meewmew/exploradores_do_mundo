# Ajustes de mapa, câmera e instruções — 2026-11-04

**Teste no celular — atualização de 05/11/2026:** testado no celular e funcionou. Esta confirmação atualiza as pendências de funcionamento no aparelho registradas nas etapas anteriores. Avaliação com crianças, leitor de tela, medições de desempenho e casos específicos sem resultado individual informado continuam separados do teste geral. Registro em [TESTE-NO-CELULAR.md](TESTE-NO-CELULAR.md).

Implementados os seis pedidos feitos com as capturas do celular. As capturas serviram de referência e não foram incorporadas ao produto.

| Before | After | Why |
| --- | --- | --- |
| Faixa separada “A descobrir / Descoberto / Atividade concluída” | Faixa removida; os estados continuam nos nomes e cartões | Remover exatamente a legenda indicada sem perder a identificação dos estados |
| Câmera restrita à área da ficha | “Tela cheia” e “Sair da tela cheia”, também com Escape | Aproveitar toda a área visível do navegador |
| Dica textual de enquadramento | Quatro cantos formando um quadrado e miniatura do marcador específico do continente | Mostrar o que enquadrar e diferenciá-lo do QR |
| Mapa pequeno e painel separado do progresso | Painel único com título, progresso e mapa de pelo menos 20 rem de altura | Dar mais espaço à exploração no celular |
| Sem zoom no mapa | Pinça/arraste e controles Reduzir, Ampliar e Ver tudo; setas e mais/menos pelo teclado | Permitir inspeção sem exigir gesto |
| Título “Meu mapa-múndi” dentro do mapa | “Mapa de exploração” acima, no cabeçalho do painel | Aplicar a correção expressa do responsável |
| Instruções longas em uma página com fundo diferente | Dialog modal sobre o próprio componente da página do mapa, em três passos | Abrir dentro da tela e manter o contexto original |

O pedido de colocar o mapa “dentro da barrinha” foi aplicado como um painel único que contém a barra de progresso e a área geográfica. A barra mantém seu valor verdadeiro e não foi transformada em decoração.

## Câmera

O modo ampliado ocupa a área visível do navegador com CSS (`100dvh`), inclusive no Safari sem Fullscreen API. Não promete esconder os controles do navegador ou do sistema. A mesma camada e o mesmo iframe permanecem montados: expandir não troca o documento, não reinicia a câmera e não modifica a pose do marcador. O foco é devolvido ao controle ao sair; o fundo fica inerte enquanto a câmera está ampliada. As saídas da cena continuam usando o teardown existente.

A moldura é uma orientação visual, não um detector nem uma posição/distância calibrada. Mostra a miniatura do arquivo de marcador existente para aquele continente e pede o quadrado inteiro com margem clara. Some ao receber reconhecimento real e volta quando o marcador se perde. Nenhuma regra de descoberta foi alterada. Não houve alterações em modelos, dados, credenciais, bibliotecas ou no código do rastreamento.

## Mapa e instruções

O SVG conserva os mesmos paths geográficos. A nova área permite ampliação de 1× a 5× e restringe o arraste aos limites úteis; no celular começa ampliada para usar a altura disponível. “Ver tudo” retorna ao enquadramento completo. Um arraste não pode virar seleção acidental; um clique/toque continua selecionando normalmente. O estado de descoberta e o de atividade permanecem independentes.

O fundo das instruções agora é `Collection`, o mesmo componente da rota do mapa, com o mesmo progresso, geografia, seleções e controles. O dialog nativo prende o foco e torna o fundo inerte enquanto aberto; X, Escape e “Vamos explorar” levam ao mapa. “Trocar perfil” volta à escolha e “Ler QR Code” mantém a seleção obrigatória antes do leitor. Em telas baixas a ilustração cede espaço ao texto. Com texto a 200% ou paisagem muito baixa, apenas o corpo do dialog pode rolar; o cabeçalho e as ações permanecem visíveis. Não há rolagem da página ao fundo.

Skills já consultadas e aplicadas: frontend-design para unificar mapa/progresso e retirar repetição; apple-design para manipulação direta sem animação/espera e para manter a mesma cena; emil-design-eng para distinguir clique/arraste, foco e ações claras; mobile-native para `dvh`, safe areas e rolagem contida. Todas as cores novas usam os tokens existentes.

## Verificações executadas

- `npm.cmd run typecheck`: exit 0.
- `npm.cmd test`: 51/51 testes, em 16 arquivos; dois casos novos validam limites/foco do zoom, pinça e continuidade ao trocar dedos. Não executam toque físico.
- `npm.cmd run build`: exit 0, conteúdo/fontes dos seis continentes validados.
- `node scripts/check-ui-contrast.mjs`: 38/38 pares, sem equivaler a uma auditoria WCAG completa.
- `git diff --check`: exit 0.

Navegador integrado: 320 × 568, 390 × 700 e desktop 1280 × 900. Nos três passos a 320 × 568, o texto/controles couberam no dialog; no passo final foram medidos 305 px de conteúdo e 305 px disponíveis, com ações dentro do viewport. Conferidos Próximo/Anterior, fechamento por X/Escape, reabertura e atalho de QR para a seleção de continente. Texto a 200% em 390 px: corrigido corte do botão de fechar; ações inteiras no viewport, corpo com rolagem interna e sem overflow horizontal na página.

Zoom por botões, retorno a 100%, arraste com mouse (translação de 62 px sem mudar de rota), seleção por clique real no SVG e por Enter, além da lista alternativa, conferidos. A área do mapa em 390 × 700 mediu 346 px de altura. O funcionamento no celular foi posteriormente testado e confirmado em 05/11/2026; não foi informado resultado individual da pinça.

RA: botão de expansão, guia com miniatura, saída por Escape e retorno ao mapa conferidos sem leitura de marcador nem validação da câmera. A camada ampliada mediu exatamente 390 × 700, na origem do viewport; o iframe manteve o mesmo endereço e a alternância não faz parte das dependências que recriam a cena. Não foram simulados eventos de reconhecimento ou descobertas.

## Mapa integrado à página — 05/11/2026

Removidas a borda externa do viewport e a moldura/sombra do painel. O fundo do SVG, o viewport e as faixas laterais agora usam `--canvas`, a mesma cor da página. A composição fica contínua, conforme a captura e o pedido recebido. As escolhas seguem frontend-design (continuidade visual), apple-design (redução de molduras) e emil-design-eng (preservação de foco e respostas dos controles).

Conferido no Chrome em 390 × 844 e 1280 × 900: mesma cor calculada da página e dos fundos do mapa, bordas de 0 px, sem overflow horizontal, zoom/restauração e foco por teclado funcionando, sem erros de execução registrados. Capturas e medições locais em `.cache/map-review/`. Após a alteração, `npm.cmd run typecheck`, `npm.cmd test` (51/51 em 16 arquivos) e `npm.cmd run build` passaram. O relato de funcionamento em celular é o teste informado antes deste ajuste visual; a conferência desta alteração foi feita no navegador.

Correção de cor em 05/11/2026: a confirmação visual do responsável pediu o azul mais escuro da imagem original, `#a8deef`. O token `--canvas` passa a usar esse azul, igual ao `--water`; página, mapa e faixas laterais conservam continuidade, sem borda externa. A alteração anterior havia usado `#e6f6fc`, claro demais para o pedido.

Pedido posterior em 05/11/2026: restaurada a borda original do viewport do mapa, com `2px solid var(--border-control)` e cantos de `1rem`. Mantido o azul mais escuro já aprovado. O painel externo permanece integrado à página; esta correção recupera a linha azul escura ao redor do mapa mostrada na captura inicial.

Referência final recebida em 05/11/2026: o conjunto solicitado inclui também a moldura branca arredondada do painel inteiro. Restaurados o painel azul `--water`, sua borda branca de 3 px, raio de 1,75 rem e sombra original, além do fundo externo claro `--canvas: #e6f6fc`. Mantidas a borda interna azul e as faixas claras do SVG, como na captura. Esta referência substitui os ajustes anteriores de integração do painel à página.

O primeiro deploy no novo endereço concluiu no workflow `41983031844`, commit `c64766b`. `node scripts/check-published.mjs` passou após corrigir a localização do hash na checagem: o build coloca a configuração PBKDF2 no chunk principal compartilhado, não necessariamente no chunk do Organizador. A comparação com a variável do repositório confirmou o mesmo valor sem expô-lo; nenhuma senha ou configuração de acesso foi alterada.

## Testado no celular e funcionou

Publicação concluída: commit `c33fa00`, workflow `workflow antigo #41956899341 (link histórico removido a pedido)` com `success`. `node scripts/check-published.mjs` e `node artifacts/mobile-camera/check-published.mjs` passaram. Pop-up e zoom do mapa públicos conferidos a 390 × 700 em `endereço da publicação anterior removido a pedido`; capturas `artifacts/mobile-camera/instrucoes-publicadas-390.jpg` e `mapa-publicado-390.jpg`. Câmera ampliada revisada localmente sem reconhecimento, com captura `camera-ampliada-local.jpg` na mesma pasta. O build publicado não contém a página de QA usada para texto a 200%.

Testado no celular e funcionou, conforme confirmação recebida em 05/11/2026. Câmera, QR impresso e reconhecimento/alinhamento confirmados. Resultados individuais de expansão, safe areas, pinça, pins e cinco ciclos não foram informados. Leitor de tela, áudio, avaliação com crianças, medições de desempenho e casos específicos do roteiro sem resultado individual informado permanecem em verificação. Roteiro para repetição em `docs/TESTE-NO-CELULAR.md`. A confirmação não mede melhoria na taxa de reconhecimento pela moldura.
