# Relatório do projeto — Exploradores do Mundo

**Teste no celular — atualização de 05/11/2026:** testado no celular e funcionou. Esta confirmação atualiza as pendências de funcionamento no aparelho registradas nas etapas anteriores. Avaliação com crianças, leitor de tela, medições de desempenho e casos específicos sem resultado individual informado continuam separados do teste geral. Registro em [TESTE-NO-CELULAR.md](TESTE-NO-CELULAR.md).

## Apresentação

Exploradores do Mundo é um jogo educativo para estudantes do ensino fundamental. O projeto apresenta os seis continentes adotados no modelo escolar brasileiro, com a América unificada. O estudante pode explorar mapas, consultar informações geográficas, realizar atividades e visualizar modelos tridimensionais. A realidade aumentada usa folhas impressas com QR Code e marcador visual.

## Linguagens e tecnologias

A aplicação foi desenvolvida principalmente em TypeScript, com React para construir as telas e organizar a navegação. HTML e CSS estruturam e apresentam a interface. JavaScript é usado nos scripts de geração, preparação, validação e publicação, e também na cena isolada de realidade aumentada.

As ferramentas e bibliotecas principais incluem Vite para desenvolvimento e geração da versão de publicação; React Router para navegação; Zod para validar os dados; A-Frame e AR.js para reconhecimento de marcadores e realidade aumentada; jsQR para leitura de QR Code; model-viewer e Three.js para visualização 3D; e bibliotecas de geoprocessamento e geração de modelos, como D3-Geo, TopoJSON, Earcut e glTF Transform. As versões estão fixadas no projeto e os recursos de realidade aumentada e visualização são hospedados localmente.

Também são usados Natural Earth como fonte cartográfica, dados abertos de elevação da NOAA para os relevos, fontes institucionais e registros do Wikidata para informações e pontos de interesse. As fontes e licenças estão catalogadas em `SOURCES.md`.

## Ferramentas e funções desenvolvidas

- **Mapa e navegação:** apresentam os continentes, permitem ampliar e mover o mapa e conduzem às fichas, à coleção e às atividades.
- **Conteúdo geográfico:** mostra informações sobre continentes e países, com busca e referências de fonte. Campos não confirmados são identificados para verificação.
- **Realidade aumentada:** solicita acesso à câmera e procura o marcador impresso correspondente ao continente escolhido. O modelo 3D acompanha o marcador; o QR Code serve para abrir ou selecionar o conteúdo e não desbloqueia sozinho.
- **Leitura de QR Code:** usa a câmera para ler os códigos das folhas e encaminhar o estudante ao continente correspondente, respeitando as regras de descoberta.
- **Modelos 3D e relevo:** os seis continentes têm modelos de contorno e modelos com relevo. A visualização funciona na realidade aumentada e em uma página sem câmera. Há três pontos de interesse por continente, apresentados também por uma alternativa textual.
- **Coleção e progresso:** registra localmente os continentes descobertos e as atividades concluídas. O progresso fica no navegador do usuário, sem cadastro ou servidor.
- **Atividades educativas:** permitem responder e acompanhar a conclusão das atividades disponíveis.
- **Área do Organizador:** oferece acesso protegido para revisar e editar conteúdo do projeto. As alterações podem ser preparadas para exportação e publicação.
- **Materiais para impressão:** gera marcadores, QR Codes e folhas dos continentes em PDF.
- **Acessibilidade e interface:** inclui instruções em etapas, controles com rótulos acessíveis, navegação por teclado e alternativas aos gestos. A interface prioriza celulares e usa as fontes Fredoka e Nunito, servidas localmente.
- **Geração e conferência:** scripts atualizam os dados, produzem os modelos e materiais impressos e conferem os limites de tamanho e geometria dos modelos.

## Estado atual

As funções centrais, os seis continentes, os materiais impressos, os modelos com relevo e as principais telas estão implementados. O histórico do projeto registra builds, verificações automatizadas e publicações bem-sucedidas no endereço anterior, removido a pedido. A interface também foi conferida em navegador em tamanhos de celular e desktop em etapas recentes. Além dessas verificações, o teste no celular foi realizado e funcionou, conforme confirmação recebida em 05/11/2026. Câmera, leitura de QR impresso e reconhecimento/alinhamento da RA estão confirmados; registro em `docs/TESTE-NO-CELULAR.md`.

## O que falta para concluir

1. **Teste no celular concluído:** testado e funcionou, conforme confirmação recebida em 05/11/2026. Câmera, QR impresso e reconhecimento/alinhamento da RA confirmados. O roteiro de `docs/TESTE-NO-CELULAR.md` fica disponível para repetição; aparelho, navegador, cinco ciclos e resultados individuais dos demais casos não foram informados.
2. **Conferir acessibilidade e uso real:** testar leitor de tela, áudio, teclado virtual, áreas seguras da tela e compreensão das instruções com crianças. Esses itens não devem ser considerados validados apenas por testes automatizados ou pela revisão em navegador.
3. **Finalizar a conferência dos dados:** área e população dos continentes ainda estão marcadas para verificação. Algumas informações de países, como áreas e populações, têm limitações de fonte e ano de referência; consultar `docs/DADOS-EM-VERIFICACAO.md` e `PENDENCIAS.md` antes de completar ou apresentar esses campos como confirmados.
4. **Concluir a publicação no novo repositório:** o projeto foi preparado para `https://meewmew.github.io/exploradores_do_mundo/`, mas a conta conectada tem apenas permissão de leitura no repositório `meewmew/exploradores_do_mundo`. É necessário liberar escrita para essa conta ou usar uma conta autorizada, enviar o projeto e conferir a publicação pelo GitHub Pages.
5. **Fechar a conferência do projeto:** manter `PROGRESSO.md` e `PENDENCIAS.md` atualizados com os resultados dos testes físicos, dados confirmados e situação final da publicação.

## Comandos principais

- `npm run dev` inicia o ambiente de desenvolvimento.
- `npm run typecheck` verifica os tipos TypeScript.
- `npm test` executa os testes automatizados.
- `npm run build` gera a versão de produção.
- `npm run build:data` atualiza os dados locais dos continentes e países.
- `npm run build:models` gera os modelos tridimensionais.
- `npm run build:markers` gera os QR Codes e materiais de marcadores.
- `npm run check:budget` confere os limites definidos para os modelos 3D.

## Conclusão

O projeto está implementado em suas funções principais e já possui registro de publicação e conferências técnicas no navegador. O teste no celular foi realizado e funcionou. Permanecem as verificações específicas de acessibilidade e de dados e a permissão de escrita para publicar no novo endereço.
