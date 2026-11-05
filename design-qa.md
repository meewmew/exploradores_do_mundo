# Conferência da tela do mapa — 2026-11-05

final result: passed

## Referência e evidências

Referência visual: `C:/Users/ayan-/AppData/Local/Temp/codex-clipboard-d2300259-ea16-41f8-8264-770086e8822f.png` (721 × 923 px). A imagem orienta a implementação e não é distribuída no site.

Implementação: `https://localhost:5175/`, Chrome local isolado, capturado por CDP. O navegador integrado e o runtime de Computer Use não foram expostos pelas ferramentas desta sessão. Não foi usado Playwright.

Captura principal: `.cache/reference-review/revised-1224.png`, viewport CSS 1224 × 1846, densidade 1, PNG 1224 × 1846. A referência mostra os componentes em aproximadamente metade de suas dimensões CSS existentes: marca de 26 px para o componente de 52 px, painel de 508 px para 1016 px, cartões com imagem de 64 px para 128 px. Sua área útil corresponde a aproximadamente 612 × 923 px, seguida por espaço vazio à direita. Para comparar, a captura foi reduzida em 2× com média de pixels e apresentada no mesmo canvas de 721 × 923, sem alterar o produto ou reduzir fontes CSS. A interpretação da escala foi inferida, pois os metadados originais da captura não foram fornecidos.

Comparação conjunta em `.cache/reference-review/comparison.png`: referência à esquerda, implementação normalizada à direita. Inspeções conjuntas de detalhes em `comparison-header.png`, `comparison-map.png` e `comparison-cards.png`, na mesma pasta. Esses arquivos foram abertos e inspecionados visualmente.

Estado: Explorador após as instruções; seis continentes ainda bloqueados, zero descobertas e zero atividades; América selecionada pelo fluxo normal de abrir a dica e voltar ao mapa; ampliação 100%. O estado da seleção não foi forçado no código nem convertido em descoberta.

## Superfícies de fidelidade

| Superfície | Evidência e resultado |
| --- | --- |
| Fontes e tipografia | Fredoka e Nunito locais, hierarquia, pesos, textos e disposição comparados no cabeçalho, painel e cartões. Fontes CSS de leitura mantidas em pelo menos 16 px; não se imitou o tamanho reduzido da captura diminuindo a acessibilidade. |
| Composição e espaçamentos | Painel, barra de progresso, controles, mapa, instruções curtas, duas fileiras de três cartões e QR no canto inferior direito correspondem à referência normalizada. Mapa medido em 986 × 541,75 CSS px; o alvo visual é aproximadamente 493 × 271 px. |
| Cores e tokens | Reutilizados céu `--canvas`, painel `--water`, branco `--surface`, creme `--surface-warm`, marinho `--ink` e cores existentes dos seis cartões. Nenhuma nova paleta ou imagem de fundo foi criada. |
| Imagens e qualidade | Mesma geometria Natural Earth, silhuetas licenciadas, marca e ícones já existentes. Mapa vetorial permanece interativo e nítido; nenhum asset foi substituído por aproximação raster ou gerado novamente. |
| Textos e conteúdo | Títulos, contadores reais, nomes dos seis continentes, dicas de interação, estados e rótulo “Ler QR Code” conferidos. Nenhum conteúdo geográfico alterado. |

## Histórico da comparação

| Antes | Depois | Motivo e evidência |
| --- | --- | --- |
| [P2] Em larguras abaixo de 900 px, a navegação migrava para o rodapé; a grade podia ter duas colunas em 721 px. | Navegação no cabeçalho nas telas do mapa/instruções; três colunas a partir de 600 px. | A captura apresenta cabeçalho compacto e duas fileiras de três cartões. Comparação final do cabeçalho/cartões e captura `revised-721.png`. |
| [P2] O mapa podia abrir ampliado para preencher a altura no celular. | Área com proporção 1,82 e enquadramento inicial em 100%, mantendo zoom manual. | Capturas `revised-390.png` e `revised-320.png` mostram os seis continentes por inteiro. |
| [P2] Primeira adaptação mobile quebrou nomes dos botões em várias linhas. | Botões se distribuem conforme o espaço em rem; nomes permanecem inteiros. Cabeçalho de 320 px ajustado para duas fileiras no tamanho normal de texto. | Capturas finais 390/320 px abertas e comparadas após os ajustes. |
| [P2] Ícone da marca transbordava o círculo na primeira conferência a 200%. | Dimensões do círculo acompanham rem, com mínimo de 44 px. | Captura posterior `revised-320-large-text.png` mostra o ícone contido. |
| [P3] QR ficava alguns pixels além da margem do cabeçalho na captura normalizada. | Margem fixa calculada a partir da largura do cabeçalho. | Comparação final completa após o ajuste. |

Após os ajustes, nova captura e comparação conjunta não apresentaram diferenças P0/P1/P2. Pequenas diferenças de antialiasing, arredondamento e posição subpixel permanecem possíveis pela escala inferida da referência; não se declara identidade pixel a pixel. As linhas escuras na borda externa da imagem de referência foram consideradas moldura da captura, sem inseri-las na interface.

## Interações e responsividade

Verificadas em navegador: escolha Explorador → instruções → mapa; abrir seletor de QR com seis opções e cancelar devolvendo o foco; ampliar a 130% e restaurar a 100%; alcançar o viewport por Tab com foco visível; ampliar/restaurar pelo teclado; abrir a dica da América, voltar e preservar sua seleção sem desbloqueá-la.

Capturas adicionais: `revised-721.png` (721 × 923), `revised-390.png` (390 × 844), `revised-320.png` (320 × 740). Nenhuma dessas larguras apresentou overflow horizontal. Em 320 px com fonte raiz a 200%, a página continuou sem overflow horizontal e o atalho QR passou ao fluxo inline já existente. A organização mobile adapta cabeçalho, colunas e botões para manter legibilidade e toque de pelo menos 44 px.

Console e exceções de execução: zero na captura final. Resultados: `.cache/reference-review/revised-interactions.json` e `revised-errors.json`.

Verificações executadas: `npm.cmd run typecheck`, `npm.cmd test` (51 testes aprovados), `npm.cmd run build`, `git diff --check`.

Não reexecutados: câmera/RA em aparelho físico, pinça em hardware real, leitor de tela ou avaliação com crianças. Esses limites não são substituídos pela revisão Chrome ou pelos testes automatizados. Publicação fora do escopo desta solicitação.

## Checklist final

Comparação geral e de detalhes concluída; correções P2 recapturadas; controles essenciais conferidos; fontes, cores, imagens e conteúdo preservados; nenhuma pendência P0/P1/P2 conhecida. Aguardar pedido de publicação para atualizar o site remoto.
