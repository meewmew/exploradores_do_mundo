# Teste no celular

## Resultado registrado em 05/11/2026

**Testado no celular e funcionou**, conforme confirmação direta recebida em 05/11/2026 e registro do grupo no README. Câmera, leitura do QR impresso e reconhecimento/alinhamento da realidade aumentada foram testados pelo grupo. O funcionamento geral no celular está confirmado; as indicações antigas de teste físico pendente nos relatórios foram atualizadas com base nesse relato.

O teste físico foi realizado pelo grupo, não pelo agente. Modelos de aparelho, versões de sistema e navegador, data da execução e medições de desempenho não foram informados. A data acima é a do registro da confirmação. Não há resultado individual informado para cada caso do roteiro abaixo, nem comprovação de cobertura simultânea de Android e iPhone. Leitor de tela, compreensão com crianças, medições de FPS/memória e os cinco ciclos de câmera exigem resultados específicos para serem considerados verificados.

## Roteiro para repetir após alterações

Usar HTTPS e as folhas A4 em tamanho real (100%), geradas para a mesma origem e caminho da aplicação. Repetir em Android/Chrome e iPhone/Safari quando disponíveis; registrar aparelho, sistema, navegador, versão do app e resultado de cada caso.

| Caso | Resultado esperado |
|---|---|
| Entrada | Carregamento → escolha de perfil → instruções → mapa; abrir URL de QR não descobre continente |
| Mapa e instruções | Passos e ações visíveis; fechar e reabrir instruções; selecionar continente; ampliar por pinça/botões, arrastar e restaurar sem seleção acidental |
| QR correto e incorreto | Leitor interno descobre somente o continente selecionado com QR válido; QR de outro continente ou origem exibe aviso |
| Permissão e cancelamento | Permitir câmera inicia captura; negar mostra instrução de recuperação; cancelar retorna ao mapa e encerra captura |
| Marcadores dos seis continentes | Modelo acompanha posição e orientação do marcador correspondente; reconhecer marcador não altera progresso; somente o QR válido no leitor interno descobre |
| Perda e retorno do marcador | Modelo some ao perder o marcador e retorna preservando escala e rotação escolhidas |
| Gestos e pontos | Arraste, pinça, troca de dedos e controles alternativos funcionam; pontos acompanham modelo e permitem seleção por toque/lista |
| Câmera expandida | Expandir e restaurar conserva cena, pose e pontos; saída continua acessível com barras do navegador e áreas seguras |
| Mira na página inteira | Antes do reconhecimento, mira visível acima dos controles; some ao encontrar o marcador e retorna na perda; não bloqueia arraste/pinça; conserva posição ao girar aparelho e expandir controles |
| Versões de Android/iPhone | Registrar aparelho, versão do sistema e do navegador em cada execução; conferir carregamento azul, orientação, permissão de câmera, RA normal/página inteira e visualização 3D; emulação não substitui cada teste físico |
| Cinco entradas e saídas da RA | Câmera encerra em cada saída, reabre sem travar e não acumula recursos; medir memória separadamente quando houver ferramenta disponível |
| Sem câmera e progresso | Modelo disponível após descoberta; recarga preserva descobertas/atividades; contadores permanecem independentes |
| Organizador | Entrada, edição e saída funcionam; progresso temporário não altera coleção do aluno, inclusive na RA em página inteira |
| Interface e acessibilidade | Paisagem, texto ampliado, teclado virtual, foco, leitor de tela e áudio disponível; conferir compreensão com crianças em avaliação própria |

Ao repetir, registrar falhas e limitações sem transformar o relato geral de funcionamento em aprovação automática de todos os casos.

## País selecionado em RA — implementação local de 05/11/2026

**NÃO VALIDADO em aparelho físico nesta alteração.** A confirmação histórica acima refere-se à versão anterior. Esta implementação não foi publicada, conforme pedido. O QR da folha continua exclusivo da descoberta pelo leitor interno; a pose da RA é fornecida pelo marcador quadrado AR.js 3×3 que já fica ao lado do QR, e não pelo desenho completo do QR.

Verificado nesta sessão: `npm.cmd run typecheck`, `npm.cmd test` (55/55), `npm.cmd run build`, `npm.cmd run check:budget` (189 modelos), `node scripts/verify-subpath.mjs` (build em subpasta), `node --check public/ar/scene.js` e `git diff --check`. Os testes leem/parseiam GLBs locais, validam país/continente/modelo, rotas, bloqueios e ausência de escrita de progresso pela RA. Não executam câmera física.

Chrome local automatizado: ficha do Brasil com GLB carregado, ação “Ver em RA”, endereço da cena com `continente=america`, `pais=BRA` e `models/countries/BRA.glb`; resumo do país, expansão/Escape sem troca de endereço, retorno à ficha do Brasil e remoção do iframe. Conferidos 320/390/1280 px e texto a 200% em 390 px, sem overflow horizontal, com foco por teclado. Conferidos aviso do Vaticano sem GLB, RA sem país usando o relevo da América e início/retorno da página inteira conservando o Brasil. Progresso permaneceu igual durante a navegação. Contexto de navegador descartável com coleção preparada para revisão da interface; nenhuma leitura de QR, imagem de câmera ou evento de marcador foi simulado. Capturas e resultados em `.cache/ar-countries-review/`.

Executar cada caso em Android/Chrome e iPhone/Safari. Registrar aparelho, sistema/navegador, versão local do app, data, responsável e observações.

| Caso físico | Resultado esperado | Registro |
|---|---|---|
| Descoberta | URL e reconhecimento AR não descobrem; QR correto no leitor interno descobre somente seu continente | [ ] Passou [ ] Falhou — Observações: |
| País da América | Países → Brasil → Ver em RA → marcador AR da América mostra o Brasil; repetir com Argentina na mesma folha | [ ] Passou [ ] Falhou — Observações: |
| Outros continentes | Um país com GLB em África, Ásia, Europa e Oceania aparece apenas no marcador correspondente; marcador de outro continente não exibe o modelo | [ ] Passou [ ] Falhou — Observações: |
| Movimento | Translação e orientação do marcador movem/orientam o modelo real, sem ancoragem em superfície | [ ] Passou [ ] Falhou — Observações: |
| Perda/retorno | Tirar marcador do enquadramento esconde modelo; retorno mantém escala/rotação; restaurar volta ao padrão | [ ] Passou [ ] Falhou — Observações: |
| Sem país | Ver em RA pela ficha de continente mantém seu relevo e seus pontos; Antártida continua sem países | [ ] Passou [ ] Falhou — Observações: |
| País sem modelo | Vaticano (ou outro sem GLB) informa limitação sem abrir câmera nem mostrar continente no lugar | [ ] Passou [ ] Falhou — Observações: |
| Falha/permissão | Negar câmera e falhar carregamento exibem recuperação; tentar novamente mantém o país; Ver sem câmera retorna à ficha correta | [ ] Passou [ ] Falhou — Observações: |
| Saída e reentrada | Ver sem câmera, mapa e página inteira desligam captura; cinco ciclos reabrem sem travar; progresso/atividades permanecem iguais | [ ] Passou [ ] Falhou — Observações: |
| Gestos e acessibilidade | Arraste/pinça e botões de zoom/girar/restaurar funcionam; tela cheia conserva país e oferece saída | [ ] Passou [ ] Falhou — Observações: |
| Página inteira | Repetir país, marcador correto/incorreto, perda/retorno e saída em ar/scene.html; conferir o link para a mesma ficha e o percurso de entrada existente | [ ] Passou [ ] Falhou — Observações: |

A página inteira volta ao endereço da mesma ficha. Como esse retorno recarrega o app, a escolha de perfil/instruções existente é solicitada novamente e leva ao mapa com o continente pendente. A ficha precisa ser reaberta pelo percurso existente; esse fluxo de entrada não foi alterado nesta tarefa.

## Relevo e lugares dos países — versão local de 06/11/2026

**NÃO VALIDADO em aparelho físico nesta alteração.** A confirmação de funcionamento recebida do usuário durante a implementação não identifica os novos modelos, ainda em geração naquele momento. Não converter esse relato em aprovação do novo relevo/pins/desempenho. Alteração local, sem publicação.

Implementados 177 países com geometria DEM (mesmo GLB na ficha/RA) e 195 países com até dois locais confirmados. Elevações/costas/limites e verificações automatizadas descritos em `RELEVO-PAISES.md`. 59 testes passaram; no Chrome, GLBs, interface, navegação e metadados foram conferidos, sem câmera falsa ou evento de rastreamento simulado.

Usar as mesmas folhas/QR/marcadores: não precisam ser regenerados. Registrar aparelho, sistema, navegador, data, versão do app e responsável. Repetir Android/Chrome e iPhone/Safari.

| Caso | Esperado | Registro |
|---|---|---|
| Brasil | Terreno e dois locais (Rio de Janeiro e Parque Nacional do Iguaçu); lista/pins abrem a informação e fonte | [ ] Passou [ ] Falhou — Observações: |
| Mesmo arquivo | Ficha e RA exibem o mesmo relevo; cores, proporções e coordenadas dos pins correspondem | [ ] Passou [ ] Falhou — Observações: |
| Relevo acentuado | Nepal/Andorra apresentam terreno sem picos procedurais; indicação de alturas ampliadas visível | [ ] Passou [ ] Falhou — Observações: |
| Antimeridiano e ilhas | Rússia/Fiji não saltam pelo mapa nem ligam ilhas por terreno; contornos permanecem reconhecíveis | [ ] Passou [ ] Falhou — Observações: |
| Países planos e depressões | Conferir Países Baixos/Jordânia; não esperar variação artificial; limites da normalização costeira são cartográficos | [ ] Passou [ ] Falhou — Observações: |
| Locais textuais | Trinidad e Tobago oferece Forte King George na lista sem fabricar pin; países sem GLB mantêm símbolo/ficha e locais | [ ] Passou [ ] Falhou — Observações: |
| Rastreamento | Somente marcador do continente correspondente ancora o país; movimento e orientação acompanham o marcador | [ ] Passou [ ] Falhou — Observações: |
| Perda/retorno | Modelo/pins somem com marcador perdido e voltam preservando gesto; restaurar funciona | [ ] Passou [ ] Falhou — Observações: |
| Gestos e acesso | Arraste/pinça/botões, seleção por lista, foco e texto ampliado funcionam; saída à ficha continua acessível | [ ] Passou [ ] Falhou — Observações: |
| Falhas e troca rápida | Modelo/metadados indisponíveis têm erro e nova tentativa; trocar país não mostra modelo/pontos do anterior | [ ] Passou [ ] Falhou — Observações: |
| Cinco ciclos | Entrar/sair cinco vezes; câmera libera a cada saída; medir FPS/memória sem declarar aprovação só por impressão visual | [ ] Passou [ ] Falhou — Observações: |
| Página inteira | País e pontos disponíveis; indicação de alturas ampliadas; locais sem pin permanecem legíveis; câmera para na saída | [ ] Passou [ ] Falhou — Observações: |
| Progresso | RA/URL não descobrem nem concluem atividade; somente QR válido no leitor interno mantém descoberta | [ ] Passou [ ] Falhou — Observações: |

## Aparência somente da ficha do Brasil — 06/11/2026

Pendente de aparelho físico. Perfil visual aplicado apenas no visualizador sem câmera da ficha BRA; RA, malha, GLB, posições dos pontos/rios e demais países permanecem como estavam antes desta tarefa. Nenhum reconhecimento simulado.

| Caso | Esperado | Registro |
|---|---|---|
| Brasil | Material fosco, rios discretos, iluminação lateral e norte inteiro dentro do enquadramento | [ ] Passou [ ] Falhou — Observações: |
| Giro/zoom/restaurar | Gestos e botões funcionam; restaurar recupera o novo enquadramento | [ ] Passou [ ] Falhou — Observações: |
| Pontos | Dois pins/lista continuam selecionáveis e alinhados, sem alteração de coordenadas | [ ] Passou [ ] Falhou — Observações: |
| Isolamento | Benim e outros países mantêm o visual anterior; sair/voltar ao Brasil reaplica somente seu perfil | [ ] Passou [ ] Falhou — Observações: |
| Carregamento | Luz local carrega sem erro; conferir fluidez e medir FPS/memória antes de declarar desempenho aprovado | [ ] Passou [ ] Falhou — Observações: |

## Piloto do relevo da África com Copernicus GLO-30 — 10/11/2026

**Teste físico pendente.** Usar a versão local do piloto em uma origem HTTPS confiável no celular. Abrir a África no mapa, tocar em **Ver em RA** e apontar para o quadrado preto da folha vigente da África. Usar o leitor interno e o QR correspondente à origem da instalação para verificar a descoberta. A versão de 05/11/2026 usava outro relevo.

| Caso | Esperado | Resultado |
|---|---|---|
| 3D sem câmera, pelo mapa e pela coleção | África e Madagascar enquadradas. Pins de Gizé, Cataratas Vitória e Kilimanjaro sobre o terreno. Seleção pela lista e aviso de alturas ampliadas. | Pendente |
| RA embutida e em página inteira | As duas cenas exibem o mesmo relevo e os mesmos pins. Mover e inclinar a folha, afastar o marcador e reenquadrá-lo. Modelo e pins acompanham a pose, somem e reaparecem juntos. | Pendente |
| Gestos e saída | Testar arraste, pinça e botões nos dois modos. Ao voltar para **Ver sem câmera**, confirmar que o indicador da câmera se apaga. Repetir cinco ciclos. | Pendente |
| Descoberta e país | Reconhecer o marcador e abrir a URL do QR sem ganhar progresso. Ler o QR correto no leitor interno para registrar a descoberta. Selecionar um país africano e conferir seu modelo no mesmo marcador. | Pendente |
| Desempenho | Registrar aparelho, sistema e navegador, tempo para carregar o GLB, FPS durante o giro e o rastreamento e memória antes/depois dos cinco ciclos, conforme recursos do aparelho. | Pendente |
