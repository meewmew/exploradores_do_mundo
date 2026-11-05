# Auditoria dos fluxogramas — Exploradores do Mundo

**Teste no celular — atualização de 05/11/2026:** testado no celular e funcionou. Esta confirmação atualiza as pendências de funcionamento no aparelho registradas nas etapas anteriores. Avaliação com crianças, leitor de tela, medições de desempenho e casos específicos sem resultado individual informado continuam separados do teste geral. Registro em [TESTE-NO-CELULAR.md](TESTE-NO-CELULAR.md).

Data: 2026-10-29. Referência normativa: SPEC §14, inclusive quando detalha ou reconcilia o PDF.

## Arquivos locais e método

- Fluxograma: `docs/Fluxogramas_Exploradores_do_Mundo.pdf`, cinco páginas renderizadas e inspecionadas visualmente. A extração textual contém apenas os títulos: os passos foram lidos nas imagens das páginas.
- Também existe `Fluxogramas_Exploradores_do_Mundo.pdf` na raiz. As cópias têm SHA-256 idêntico: `6872CC3E8B737ECE03FE5B5F683674D076777ECECA7AAE1D71D28DDC2BE0CCBD`. Os seis PDFs em `public/print/` são folhas A4, não fluxogramas.
- Referência estética: `referencia-visual.png`, imagem local com três telas de aprendizado, lavanda/pêssego, cartões e ilustrações. Usada somente como inspiração; marca, textos e desenhos não são incorporados ao app. SVGs de continentes e QR não são referências concorrentes.
- Evidência de código não equivale a execução no celular. Testado no celular e funcionou, conforme confirmação recebida em 05/11/2026. Câmera, leitura de papel e rastreamento confirmados; voz sem resultado específico informado.

## Reconciliação PDF × SPEC

Os cinco percursos principais correspondem às §§14.1–14.5. O PDF não detalha primeira visita/ano escolar, cancelamento, três erros/resposta revelada, duas celebrações nem distribuição de rascunhos do Organizador. Aplicam-se os detalhes da §14. O retorno do QR inválido da página 4 usa o mesmo leitor da página 2, com aviso e tentativa explícitos. A consulta sem câmera da página 3 exige descoberta prévia (§14.0.3); abrir URL não concede acesso. A América é unificada e a conclusão exige seis continentes.

## Achados iniciais

1. QR válido navega com `state.discovered`, mas a ficha ignora esse estado: falta confirmação da descoberta.
2. Resumo educativo da RA está abaixo da câmera, não sobreposto como PDF p.3 / §14.3.
3. Erro de RA em continente bloqueado não mostra a dica ilustrada do material.
4. Falta atalho de arrastar a ficha para os países previsto no PDF p.4 / §14.4; o botão existente será preservado.
5. A primeira orientação pode ser contornada por “Meu mapa”/“Minha coleção”; alinhar todas as entradas do mapa.
6. Mapa usa símbolo abstrato em lugar de cadeado; importação de arquivo precisa de foco visível no rótulo.

## Situações e limites da evidência

- **C**: conforme por inspeção do código; interação ainda não executada em navegador.
- **T**: comportamento de domínio ou HTML coberto por teste executado. Não implica teste dos eventos de câmera, toque, voz ou WebGL.
- **R**: divergência corrigida; a evidência indica se há também teste automatizado.
- **F**: verificação em aparelho físico; funcionamento geral testado e confirmado em 05/11/2026, com resultados individuais limitados ao registro em `TESTE-NO-CELULAR.md`. Pode coexistir com C/T/R.

E1 = `tests/essential.test.ts` (10 testes de domínio/dados/artefatos). E2 = `tests/navigation.test.ts` (1 teste de HTML estático das decisões de tela; sem efeitos do navegador). Ambos passaram por `npm.cmd test`. Caminhos de código abaixo são relativos à raiz. A renderização do PDF não foi usada como comprovação de funcionamento do app.

## Fluxo 1 — PDF p.1 / SPEC §§14.0, 14.1, 14.6

| Passo | Tela ou botão | Resultado esperado | Evidência verificada | Situação |
|---|---|---|---|---|
| 1.1 Acessar o site | App / carregamento | Carregar fichas e progresso deste navegador | `src/hooks/useApp.tsx`: `StaticContentRepository.load`, `refresh`; E1: persistência em nova instância | C + T |
| 1.2 Armazenamento bloqueado | Aviso global | Usar memória e avisar que não salvará | `collectionRepository.ts`: fallback; `useApp.tsx`: warning; E1: storage que lança erro | C + T |
| 1.3 Escolher modo | Início: Explorar / Organizador | Duas entradas explícitas | `Home.tsx`: botões principais agora lado a lado; coleção permanece como link | R, C |
| 1.4 Primeira visita | Explorar, Meu mapa ou Minha coleção | Orientação antes do mapa | `App.tsx`: guarda de `/mapa`; `Home.tsx`: destino inicial; `preferences.ts`: memória de sessão sem storage | R, C; fallback de preferência em E1 |
| 1.5 Orientar e informar ano | Orientação ilustrada / seletor / Prefiro pular | Salvar ano ou usar geral e entrar no mapa | `Orientation.tsx`, `useApp.setYear`, `collectionRepository.setProfile` | C |
| 1.6 Retornar da orientação | Voltar ao início | Sair sem descobrir continentes | `Orientation.tsx`: link `/`; nenhuma chamada de descoberta | R, C |
| 1.7 Reabrir orientação | Mapa: Como jogar | Ajuda sempre acessível; visitas seguintes vão ao mapa | `Collection.tsx`, `safePreference('exploradores:intro:v1')` | C |
| 1.8 Alterar ano depois | Configurações | Atualizar perfil local | `Settings.tsx`: seletor; `descriptionForYear`, `forYear` | C |
| 1.9 Entrar no Organizador | Informar senha / Entrar / Voltar à tela inicial | Validar hash; voltar sem sessão | `Organizer.tsx`: `login`, link `/`; `organizerAuth.ts`; E1: hash correto/incorreto/inválido | C + T de hash; formulário não executado |
| 1.10 Senha incorreta | Aviso / Entrar | Permitir nova tentativa após atraso crescente | `Organizer.tsx`: `attempts`, timeout limitado a 8000 ms, senha apagada | C |
| 1.11 Senha ausente | Aviso de configuração / Voltar / Sair | Explicar configuração sem entrar no editor | `Organizer.tsx`: ramo `configured`; não há senha em texto no código | C; configuração publicada anterior não revalidada |
| 1.12 Selecionar conteúdo | Mapa do organizador / ano escolar / Editar continente | Abrir editor do continente e ano escolhidos | `Organizer.tsx`: `selected`, `year`, chave do editor | C |
| 1.13 Editar ficha e material | Texto, imagem/áudio, Saiba mais, dica QR | Aceitar caminhos locais e fontes registradas | `OrganizerEditor.tsx`, `contentSchema.ts`: campos, limites, `media/`, links HTTPS e IDs de fontes | C + T de schema |
| 1.14 Configurar atividade | Tipo, enunciado, opções, resposta, dica e explicação | Revisar atividade adequada ao ano, inclusive extras | `OrganizerEditor.tsx`: seletor, `setA`, atividade extra; `activitySchema` | C |
| 1.15 Revisar inválido | Revisar modificações | Mostrar erro; não salvar rascunho inválido | `prepare`, `validateOverrides`, bloco `error`; E1 rejeita override inválido | C + T de schema |
| 1.16 Revisar e salvar | Salvar rascunho revisado | Salvar local e voltar ao mapa do organizador | `OrganizerEditor.tsx`: `review/onSave`; `Organizer.tsx`: `saveDraft`, `setSelected(undefined)` | C |
| 1.17 Cancelar edição | Voltar ao mapa do organizador | Descartar edição não salva e retornar ao mapa | `OrganizerEditor.onCancel`, `Organizer.setSelected(undefined)` | C |
| 1.18 Encerrar sessão em qualquer tela | Sair | Encerrar sessão e voltar ao início | Toolbar de `Organizer.tsx` fica fora dos ramos senha/mapa/editor; `exit` limpa autorização, senha e seleção | C |
| 1.19 Exportar/importar | Exportar overrides / Importar overrides | Validar JSON; rejeitar inválido; conteúdo só chega aos alunos após publicação | `organizerRepository.ts`, `importFile`, aviso permanente; E1: schema. Rótulo de arquivo agora tem `:focus-within` | C + T de schema; R de foco |

## Fluxo 2 — PDF p.2 / SPEC §14.2

| Passo | Tela ou botão | Resultado esperado | Evidência verificada | Situação |
|---|---|---|---|---|
| 2.1 Mostrar mapa | Mapa e lista de seis continentes | Nomes, símbolos, cores e seleção; América unificada | `WorldMap.tsx`, `Collection.tsx`, `src/data/generated/map.json`; E1 confere os seis IDs | C + T |
| 2.2 Explicar progresso | Dois contadores, percentual e legenda | Descobertas e atividades independentes; orientar a encontrar QR | `Collection.tsx`: dois `<progress>`, percentual, mensagem e legenda; E1: atividade não altera descobertas | C + T; R: cadeado explícito e estado de atividade no nome acessível |
| 2.3 Selecionar continente | Região do mapa ou cartão | Lembrar seleção e abrir uma única ficha/guarda | `Collection.select`, `safePreference`, `/continente/:id` | C |
| 2.4 Já descoberto | Ficha / Ver em RA opcional | Reabrir sem pedir câmera ou QR | `Continent.tsx`: ramo desbloqueado; E2 renderiza ficha com atividade e países | C + T de HTML |
| 2.5 Ainda bloqueado | Dica ilustrada / Escanear QR code / Voltar ao mapa | Mostrar onde está o material; sem modelo nem conteúdo completo | `Continent.tsx`: retorno antecipado bloqueado; E2 confirma ausência de `model-panel` | C + T |
| 2.6 Abrir URL externa ou digitar rota | Query `?continente=id` | Somente selecionar; nunca descobrir | `App.tsx`, `continentFromURL`; `rg` das chamadas `unlock` encontra somente os dois serviços de reconhecimento; E1 | C + T |
| 2.7 Autorizar câmera | Leitor QR / enquadramento / Cancelar | Pedir câmera por gesto de navegação, sem áudio | `QRScanner.tsx`: `getUserMedia`, `facingMode`, `audio:false`, vídeo e guia | C; F |
| 2.8 Câmera negada/ausente | Aviso / Tentar novamente / Voltar ao mapa | Instruir permissões ou explicar incompatibilidade; manter bloqueio | `QRScanner.start/catch`: `NotAllowedError`, `NotFoundError`, HTTPS e API ausente; dica ilustrada adicionada | R, C; F |
| 2.9 Cancelar ou sair | Cancelar / Voltar ao mapa | Parar tracks e retornar ao mapa | `stop.current`, cleanup do efeito, `srcObject=null` em `QRScanner.tsx` | C; F para indicador físico |
| 2.10 QR inválido | Aviso / Tentar novamente / Voltar ao mapa | Rejeitar endereço malformado, outra origem/caminho, ID ausente/desconhecido ou parâmetro duplicado | `validateQR` usa `new URL`, origem, pathname, IDs e unicidade; E1 cobre os casos essenciais de URL | C + T; UI da captura F |
| 2.11 QR do continente errado | “Este QR é de outro continente” | Não descobrir nenhum continente; permitir tentar novamente | `validateQR`: comparação com `selected`; E1 verifica ausência de desbloqueio | C + T; F para papel |
| 2.12 QR correto | Encerrar leitura → descoberta → ficha | Parar stream antes de descobrir/abrir RA; atualizar progresso sem duplicar | `QRScanner.tsx:29`: `close` antes de `discoverFromQR`, `refresh` e navegação; E1: unlock idempotente | C + T de domínio; F para câmera |
| 2.13 Confirmar descoberta | “Continente descoberto!” / Minha coleção | Abrir ficha sem câmera com confirmação e acesso à coleção | `Continent.tsx`: usa `state.discovered` somente no ramo desbloqueado; E2 verifica confirmação e bloqueio | R + T de HTML |
| 2.14 Leitor pausado/falha de biblioteca | Tentar novamente | Parar câmera ao ocultar; reiniciar tentativa; permitir recarregar decoder | `QRScanner.tsx`: visibility/cleanup; promessa do decoder é limpa nos dois tipos de falha de carregamento | R, C; F |

## Fluxo 3 — PDF p.3 / SPEC §§14.0.2–3, 14.0.12, 14.3

| Passo | Tela ou botão | Resultado esperado | Evidência verificada | Situação |
|---|---|---|---|---|
| 3.1 Escolher RA | Ver em RA / Iniciar realidade aumentada | Abrir cena real isolada, mesmo modelo da ficha | `ARExperience.tsx`, `ARFrame.tsx`: iframe same-origin, modelo do continente e bibliotecas locais fixadas | C; F |
| 3.2 Sem suporte/permissão | Aviso / Tentar novamente / Voltar ao mapa | Explicar HTTPS, câmera, WebGL, erro de modelo ou permissão | `scene.js`: `start/error`; `ARExperience.message`: eventos tipados de erro | C; F |
| 3.3 Fallback com descoberta | Ver em 3D sem câmera | Abrir mesma ficha completa | `ARExperience.tsx`: ação condicional ao progresso; `Continent` valida progresso novamente | C + T de guardas em E2; F |
| 3.4 Fallback bloqueado | Ver dica do QR / dica ilustrada / Voltar ao mapa | Sem prévia nem ficha 3D; explicar material e pedir ajuda | `ARExperience.tsx`: `camera-help`, ramo bloqueado; E2 não renderiza resumo educativo bloqueado | R + T de HTML; F para erro real |
| 3.5 Reconhecer marcador selecionado | Cena AR | Reagir só ao ID correspondente por >=500 ms | `scene.js`: barcode `ids.indexOf(id)`, temporizador/visibilidade; `discoverFromMarker`; E1: continente errado e 499/500 ms | C + T de domínio; F para reconhecimento |
| 3.6 Validar mensagens | Ponte React ↔ cena | Exigir origem, janela, app, versão, tipo e payload | `arBridge.ts`, listener da cena; E1: ponte rejeita origem/janela/payload incorretos | C + T |
| 3.7 Exibir modelo e resumo | Modelo ancorado / ficha sobreposta | Modelo segue posição e orientação; resumo na câmera | `scene.js`: modelo filho de `a-marker`; `ARExperience.tsx`: `.ar-fact` dentro de `.ar-stage`, acima do iframe; E2 verifica resumo | R + T de HTML; F para pose/oclusão |
| 3.8 Marcador perdido/retorno | Status e orientação de enquadramento | Esconder modelo sem congelar pose; preservar escala/rotação | `scene.js`: `markerLost`, timer cancelado, transformações locais do filho; mensagem do app | C; F |
| 3.9 Manipular modelo | Pinça/arrastar ou +, −, Girar, Restaurar | Limitar escala 0,5–3 e inclinação; manter controles alternativos | `scene.js`: `transform/action/touch`; toolbar do app; rótulos e foco também na página inteira | C; F |
| 3.10 Estudar sem câmera/sair | Ver sem câmera / Voltar ao mapa | Enviar stop, esperar ACK ou limite 1500 ms, liberar recursos e remover iframe | `ARFrame.tsx`: teardown e timeout; `scene.js`: stop de tracks, vídeos, canvas e dispose | C; F, inclusive cinco ciclos |
| 3.11 Retornar à RA | Ficha: Ver em RA | Nova verificação de capacidade e permissão | Links da ficha e novo ciclo de `ARFrame` | C; F |
| 3.12 Plano B | Abrir RA em página inteira / Voltar | Mesma origem e mesmo repositório; sair encerra câmera | `scene.js`: detecção embedded, gesto “Iniciar câmera”, `pagehide/stop`; `arStandalone.ts` reexporta o mesmo domínio | C; F, especialmente Safari |

## Fluxo 4 — PDF p.4 / SPEC §14.4

| Passo | Tela ou botão | Resultado esperado | Evidência verificada | Situação |
|---|---|---|---|---|
| 4.1 Apresentar continente | Modelo e ficha curta ilustrada | Localização e curiosidade curtas; números em Saiba mais | `Continent.tsx`, `fichaCurta`, `descriptionForYear`; E1 schema/limites/arquivo, E2 HTML | C + T; WebGL F |
| 4.2 Ouvir | Ouvir / Parar áudio | Áudio local prioritário; voz pt-BR, ocultar se indisponível | `ListenButton.tsx`: `voiceschanged`, voz exata pt-BR, cleanup | C; F para áudio no celular |
| 4.3 Expandir conteúdo | Saiba mais | Recolhido por padrão; fontes e links seguros | `<details>` sem `open`, `rel="noopener noreferrer"`; `Datum` agora oculta também valor com `verificar:true` | C + R; E2 verifica dado em verificação |
| 4.4 Antártida | Ficha / Voltar ao mapa | Ambiente, tratado, pesquisa, clima e fauna; sem países | `antartida.json`, `Continent` e guarda de `Countries`; E1: array vazio; E2: botão ausente | C + T |
| 4.5 Conhecer países | Botão secundário abaixo da ficha / arrastar alça | Botão permanente e atalho opcional; dica dispensável lembrada | `Continent.tsx`, `useCountryShortcut.ts`: gesto vertical na alça e preferência; E2 confere botão | R + T de HTML; gesto F |
| 4.6 Voltar da ficha do continente | Voltar ao mapa | Continuar consultando sem perder progresso | Links antes e depois da ficha; nenhum reset no caminho | C |
| 4.7 Selecionar país | Países / busca / região da América | Filtrar sem acentos e abrir ficha do país no continente | `Countries.tsx`: busca normalizada, quatro regiões, validação `countryId` | C |
| 4.8 Ficha do país | Modelo, Ouvir e Saiba mais | Geometria sob demanda ou símbolo; capital só se conhecida; números com fonte e ano | `Countries.tsx`, `ModelViewer3D.tsx`; E1 parse/orçamento de GLBs e fontes; Juba confirmada na UNdata | C + T de artefatos; WebGL/áudio F |
| 4.9 Retornos do país/lista | Voltar ao continente / Voltar ao mapa / Ver outros países | Retornos explícitos com progresso preservado | `Countries.tsx`: links no topo, na ficha e guarda de rota | C |
| 4.10 País/continente inválido ou bloqueado | Guardas de rota | Voltar à lista válida ou ao mesmo fluxo de dica/QR, sem conteúdo liberado | `Countries.tsx`: `Navigate` para continente/lista/mapa; `Continent` centraliza o bloqueio; E2 cobre ficha bloqueada | C + T parcial de HTML |

## Fluxo 5 — PDF p.5 / SPEC §14.5

| Passo | Tela ou botão | Resultado esperado | Evidência verificada | Situação |
|---|---|---|---|---|
| 5.1 Entrar na atividade | Fazer atividade na ficha e mapa | Usar ano salvo; bloquear entrada antes da descoberta | `Continent`, `Collection` e `Activity.tsx`: guarda e `forYear`; E2 confere entrada na ficha | C + T de HTML |
| 5.2 Escolher atividade | Abas / alternativas / mapa e lista | Formato e localização disponíveis; alternativa de teclado no mapa | `defaultActivities`, `Activity.Exercise`, `WorldMap` e `answer-list` | C |
| 5.3 Resposta errada | Dica / Tentar novamente | Sem punição nem conclusão; tentativas ilimitadas | `Exercise.answer`: incrementa erros e aguarda; `answerActivity`; E1: erro não persiste conclusão | C + T de domínio |
| 5.4 Três erros seguidos | Mostrar a resposta | Revelar resposta e explicação sem concluir | `errors>=3`, `revealed`; botões desabilitados até refazer; E1: consulta revelada não registra conclusão | C + T de domínio; sequência de cliques não executada |
| 5.5 Refazer após consulta | Refazer do início | Limpar revelação/erros e permitir novo acerto | `Exercise`: resets explícitos, sem punição | C |
| 5.6 Resposta correta | Confirmação / explicação / Continuar a viagem | Salvar uma vez, atualizar atividades e permitir voltar ao mapa | `answerActivity`, `repository.completeActivity`, `onCompleted=refresh`; E1 idempotência | C + T de domínio |
| 5.7 Sair antes de concluir | Voltar sem concluir | Mapa sem nova atividade concluída | Link `/mapa` sem chamada de persistência; gravação só no acerto | C |
| 5.8 Ainda faltam continentes | Mapa | Continuar explorando, sem conclusão antecipada | `isExplorationComplete`, guarda de `Completion`; E1 exige seis | C + T de domínio |
| 5.9 Seis descobertos | Faixa de conquista / Ver conquista | Celebrar exploração; manter fichas/países/atividades acessíveis | `Collection.tsx`: faixa condicional e link; `Completion.tsx`: passaporte e Continuar explorando | C + T da condição em E1 |
| 5.10 Seis atividades além das descobertas | Segunda celebração | Mensagem “Exploração e atividades completas” distinta | `activityContinents`, `Collection`, `Completion`; E1: várias atividades do mesmo continente contam uma vez | C + T da contagem |
| 5.11 Reiniciar/cancelar reset | Configurações / confirmação / Cancelar | Apagar progresso só após confirmação; cancelar mantém | `Settings.tsx`: só “Sim, reiniciar” chama reset; novo aviso ao concluir | C |

## Referência visual, contraste e acessibilidade

- Tokens canônicos: `src/styles/tokens.css`; `app.css` e `components.css` usam as variáveis e `playful.css` ajusta a composição infantil. `prepare-ar.mjs` copia os mesmos tokens para `public/styles/tokens.css` (RA estática). SHA-256 das três cópias fonte/public/dist coincidiu: `3E075AA7A93DAA84F5278F5F6813F98CDDD28F2A2D857D666A4D554BB5918CFD`.
- Lavanda e pêssego complementam rosa, menta e amarelo da §7 conforme pedido desta revisão. Títulos sem serifa, botões grandes, cartões arredondados e ilustração SVG autoral do planeta. Sem marca/textos/desenhos da referência. SVG novo renderizado e inspecionado, sem defeitos observados na arte; o layout completo não foi inspecionado em navegador.
- Contraste calculado por luminância relativa sRGB para as combinações principais, sem ferramentas de câmera. Foco de 3 px preservado; importação tem foco no rótulo. Links de fontes da ficha têm altura mínima 44 px. Botões principais 52 px e alternativas do mapa por cartões/lista. No celular, o mapa tem rolagem horizontal para manter rótulos legíveis, com instrução e lista alternativa; conferir no dispositivo.
- Animação da descoberta respeita `prefers-reduced-motion`. O atalho de países mantém o botão permanente; somente a alça captura o gesto.

| Par | Cores | Contraste calculado | Mínimo |
|---|---|---|---|
| Texto principal | #39334f / #faf7fd | 11,24:1 | 4,5:1 |
| Texto secundário | #655a73 / #ffffff | 6,44:1 | 4,5:1 |
| Título | #62549b / #faf7fd | 6,07:1 | 4,5:1 |
| Botão principal | #39334f / #ded8f5 | 8,66:1 | 4,5:1 |
| Botão em hover / aviso | #39334f / #f9ddd3 | 9,27:1 | 4,5:1 |
| Cartão menta | #39334f / #d7eee1 | 9,77:1 | 4,5:1 |
| Dica lavanda | #655a73 / #eeeafb | 5,45:1 | 4,5:1 |
| Foco | #62549b / #ffffff | 6,44:1 | 3:1 |
| Borda de campo | #887a96 / #ffffff | 3,98:1 | 3:1 |

Os cálculos não certificam sozinhos toda a acessibilidade: foco real, tamanho renderizado, reflow, voz e leitor de tela ainda precisam de revisão manual.

## Dados confirmados e pendências preservadas

Juba foi confirmada no campo “Capital city” da [UNdata — South Sudan](https://data.un.org/legacy/en/iso/ss.html), acesso 2026-10-29. A correção está em `data-src/country-facts.json`, `scripts/build-data.mjs` e `africa.json`; fonte `undata-south-sudan` registrada em `SOURCES.md`. O relatório `docs/DADOS-EM-VERIFICACAO.md` foi regenerado; não marca mais essa capital como ausente. Nenhuma área/população foi calculada a partir de estimativas incompatíveis. Demais `null`/`verificar:true` permanecem.

## Modo ADM pedido após a publicação anterior

A senha é conferida pelo hash da variável `VITE_ORGANIZER_PASSWORD_HASH`. O valor solicitado foi atualizado diretamente no repositório via API; o texto da senha não entrou no código ou commit.

Após login, o próprio app libera mapa, fichas, atividades e ferramentas para os seis continentes. As descobertas por QR/marcador, atividades, ano e reinício usam repositório em memória e são descartados ao sair do ADM. O desbloqueio normal dos alunos continua limitado aos reconhecimentos válidos. A sessão ADM não sobrevive a recarregar o site.

A senha é curta e só oferece barreira de conveniência, pois o site executa no navegador público. Não deve ser reutilizada em outros serviços.

## Execução desta revisão

| Comando / procedimento | Resultado real |
|---|---|
| Renderização local do PDF com PyMuPDF | Cinco páginas visualmente lidas; cópias raiz/docs comparadas por SHA-256 |
| `npm.cmd run typecheck` | Exit 0; TypeScript sem erros |
| `npm.cmd run build` | Exit 0; conteúdo/fontes/arquivos de seis continentes validados; 90 módulos transformados |
| `npm.cmd test` | Exit 0; 2 arquivos e 11 testes passaram; mantida suíte essencial, sem testes exaustivos |
| `node scripts/report-pending.mjs` | Relatório regenerado com Juba confirmada |
| Cálculo local de contraste | Pares acima atingiram seus mínimos; script e resultado intermediários em `artifacts/auditoria/` |
| `git diff --check` | Sem erros de whitespace |
| Computer Use — inventário de apps/navegadores | Indisponível: “The browser access host is unavailable” e “Computer Use native pipe is unavailable” |
| Câmera, QR impresso, pose/gestos/teardown no celular | Testado no celular e funcionou; câmera/QR/pose confirmados em 05/11/2026. Gestos e cinco ciclos sem resultado individual informado; roteiro em `docs/TESTE-NO-CELULAR.md` |
| Publicação desta revisão | Concluída posteriormente em 2026-10-29: `git push origin main`; código `7a5b95a`; workflow antigo #40814989509 (link histórico removido a pedido) com build/deploy `success` |
| Verificação pública após deploy | `node scripts/check-published.mjs`, exit 0: página/JS, hash do Organizador, bibliotecas locais e seis conjuntos HTTP 200; GLBs iguais aos locais |
| Publicação da configuração ADM | Hash atualizado pela GitHub API, HTTP 204; o novo deploy consome a variável configurada |
| Confirmação dos novos conteúdos | Verificador local em `artifacts/auditoria/check-new-published.mjs`, exit 0: Home/ficha/RA novos, fonte de Juba, CSS pastel, SVG e tokens públicos iguais aos locais por SHA-256 |
