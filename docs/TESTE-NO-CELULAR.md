# Teste no celular — NÃO VALIDADO

Nenhum teste físico foi executado pelo agente. Testes automatizados de lógica/build não validam câmera, leitura de papel nem pose AR.

## Relevo, pontos e gestos — seis continentes — NÃO VALIDADO fisicamente

Os seis continentes usam o mesmo GLB de relevo na RA e no modo sem câmera, com três pontos cada. As alturas são ampliadas visualmente; o DEM histórico amostrado não representa altitude exata de cumes ou monumentos. A tabela abaixo deve ser preenchida em celular; não marque RA como validada com base nos testes automatizados.

| Continente | Três pontos esperados | Relevo e pins no celular |
| --- | --- | --- |
| África | Pirâmides de Gizé, Cataratas Vitória e Kilimanjaro | Não validado |
| América | Grand Canyon, Machu Picchu e Cataratas do Iguaçu | Não validado |
| Antártida | Estações McMurdo, Amundsen–Scott e Vostok | Não validado |
| Ásia | Grande Muralha da China, Taj Mahal e Monte Fuji | Não validado |
| Europa | Coliseu, Acrópole de Atenas e Torre Eiffel | Não validado |
| Oceania | Grande Barreira de Corais, Ópera de Sydney e Parque Uluru-Kata Tjuta | Não validado |

Em cada continente, conferir no visualizador sem câmera e na RA: presença do relevo e dos três pins; seleção por toque e pela lista; arraste e pinça na tela; pins acompanhando zoom/rotação; perda e retorno do marcador. Em RA de página inteira, conferir a mesma lista e os mesmos gestos. Registrar aparelho, navegador, carregamento e fluidez. Fazer cinco ciclos de abrir/fechar a câmera e anotar se ela fica presa.

## Folhas públicas de 2026-11-04

Baixe `https://meewmew.github.io/exploradores_do_mundo/print/todos-continentes-A4.pdf`: seis páginas, uma por continente. Imprima em A4, tamanho real (100%), sem ajustar à página; o quadrado preto mede 9 cm. IDs preservados: África 0, América 1, Antártida 2, Ásia 3, Europa 4 e Oceania 5.

Para cada folha, leia o QR com a câmera do celular, abra o app e toque em “Iniciar realidade aumentada” (ou “Ver em RA” se o continente já estiver descoberto). Autorize a câmera e enquadre o quadrado preto inteiro; mova e incline a folha para conferir se o modelo acompanha a posição e a orientação. A abertura do QR pela câmera nativa apenas seleciona o continente. Registrar aparelho, navegador e resultados antes de marcar como validado.

Os QR/IDs/células dos marcadores e os arquivos publicados foram conferidos automaticamente; as folhas também foram renderizadas e revisadas. Isso não valida reconhecimento nem rastreamento físico.

## Regressão das correções de 2026-11-03 — NÃO VALIDADA fisicamente

Registrar aparelho, navegador, data e responsável para cada caso. A revisão de navegador descrita em `CORRECOES-2026-11-03.md` não substitui esta execução.

| Caso | Resultado esperado | Resultado físico |
| --- | --- | --- |
| Falha de processamento do QR e nova tentativa | Mensagem clara, câmera liberada e retomada pelo botão | Não validado |
| Cancelar/sair durante abertura da câmera ou processamento do QR | Câmera desligada, sem redirecionamento tardio | Não validado |
| ADM → RA em página inteira → retorno ao app | Progresso normal intacto; sessão ADM em memória encerra com a navegação | Não validado |
| Entrar/sair da RA cinco vezes | Sem câmera presa ou crescimento continuado de memória | Não validado |
| Editar conteúdo já publicado e salvar/exportar | Descrição, mídias, atividades e fontes anteriores mantidas | Não validado |
| Página temporariamente indisponível | Recuperação acessível com foco na mensagem; recarregar permite voltar após restabelecer a conexão | Não validado |

Revisão de 2026-10-29: os 11 testes de domínio/artefatos/HTML e o build passaram. O navegador não esteve disponível ao agente; nenhum item manual abaixo foi marcado como aprovado. Esta revisão foi publicada no endereço anterior, removido a pedido, pelo workflow antigo 40814989509; arquivos novos e recursos responderam HTTP 200. Use esse site para o roteiro com as folhas públicas, ou siga a preparação local abaixo.

## Preparação
1. Node.js 22.12+ e celular na mesma rede do computador.
2. PowerShell: `npm.cmd install`, `npm.cmd run dev`.
3. Use o endereço HTTPS de rede mostrado pelo Vite. O certificado local é autoassinado: autorize a exceção no aparelho somente na sua rede de desenvolvimento. Se o navegador não permitir câmera assim, use certificado confiável ou túnel HTTPS (README).
4. Configure `VITE_PUBLIC_URL` com esse endereço terminado em `/`, execute `npm.cmd run build:markers` e imprima a folha correspondente em 100%.
5. Também pode exibir uma folha em outra tela para verificar preliminarmente o reconhecimento, mas a aceitação final exige material impresso.
6. Anote modelo do aparelho, SO, navegador, URL, data e responsável.

## Executar separadamente em Android Chrome e iPhone Safari
Copie o checklist para cada dispositivo. Todos os itens começam **NÃO VALIDADOS**.

| Caso | Resultado | Observações |
|---|---|---|
| URL direta seleciona, mas não descobre | [ ] Passou [ ] Falhou | |
| Permissão de câmera negada: orientações, tentar novamente, voltar | [ ] Passou [ ] Falhou | |
| QR do continente selecionado descobre exatamente uma vez | [ ] Passou [ ] Falhou | |
| QR de outro continente/origem: aviso e nenhuma descoberta | [ ] Passou [ ] Falhou | |
| Cancelar QR desliga indicador de câmera | [ ] Passou [ ] Falhou | |
| Leitor QR encerrado antes de iniciar RA; uma câmera apenas | [ ] Passou [ ] Falhou | |
| Cada um dos 6 barcodes reconhece só seu continente | [ ] Passou [ ] Falhou | |
| Reconhecimento contínuo >= 500 ms descobre | [ ] Passou [ ] Falhou | |
| Passagem breve (<500 ms) não descobre | [ ] Passou [ ] Falhou | |
| Modelo acompanha posição E orientação do papel físico | [ ] Passou [ ] Falhou | |
| Perda do marcador esconde modelo; retorno preserva ajustes | [ ] Passou [ ] Falhou | |
| Um dedo gira, dois ampliam; limites e botões funcionam | [ ] Passou [ ] Falhou | |
| Restaurar volta à orientação e escala padrão | [ ] Passou [ ] Falhou | |
| Ver sem câmera desliga câmera e abre ficha liberada | [ ] Passou [ ] Falhou | |
| Sair da RA 5 vezes: câmera não trava, memória sem crescimento continuado | [ ] Passou [ ] Falhou | |
| Aba em segundo plano pausa render; retorno não descobre sem estabilidade | [ ] Passou [ ] Falhou | |
| Página inteira de RA (plano B) persiste pela mesma implementação | [ ] Passou [ ] Falhou | |
| Fechar/reabrir navegador mantém descobertas/ano/atividades | [ ] Passou [ ] Falhou | |
| Consulta 3D dos seis e modelos de países sob demanda | [ ] Passou [ ] Falhou | |
| América Norte–Sul e Antártida polar têm silhuetas reconhecíveis | [ ] Passou [ ] Falhou | |
| Antártida não oferece países; regiões da América filtram | [ ] Passou [ ] Falhou | |
| Ouvir pt-BR/áudio local, Saiba mais e navegação por botões | [ ] Passou [ ] Falhou | |
| Atividades: dica, 3 erros, resposta sem contar, novo acerto | [ ] Passou [ ] Falhou | |
| Dois contadores independentes; duas celebrações distintas | [ ] Passou [ ] Falhou | |
| Organizador: hash, editor, exportar/importar, publicar override | [ ] Passou [ ] Falhou | |
| Layout 360 px, alvos 44 px, teclado/leitor de tela | [ ] Passou [ ] Falhou | |

Não remover o status de não validado sem anotar evidência e responsável. Se iframe falhar no Safari, testar o botão de página inteira e registrar o comportamento.

## Retornos e regressões da auditoria de 2026-10-29 — NÃO VALIDADOS

Executar somente os percursos essenciais abaixo; não é uma bateria exaustiva. Usar um perfil de teste separado para não apagar progresso de uso.

| Percurso | Resultado esperado | Resultado real / responsável |
|---|---|---|
| Primeira visita por Explorar e pelo atalho Meu mapa | Orientação ilustrada sem pergunta obrigatória de ano; conteúdo geral; Voltar ao início funciona | NÃO VALIDADO |
| Voltar ao mapa em visita seguinte e tocar Como jogar | Mapa direto; ajuda pode ser reaberta; ano continua salvo | NÃO VALIDADO |
| Bloqueado → câmera negada → Tentar novamente ou Voltar ao mapa | Instrução, dica ilustrada, nenhum modelo completo nem descoberta | NÃO VALIDADO |
| Selecionar África e ler QR da Ásia → Tentar novamente → QR da África | Aviso de continente errado sem progresso; depois câmera fecha, aparece “Continente descoberto!” e ficha sem câmera | NÃO VALIDADO |
| Cancelar enquanto o leitor inicia | Mapa, câmera desligada; resultado tardio não deve abrir ficha após o cancelamento | NÃO VALIDADO |
| Descoberto → Ver em RA → perder/reencontrar marcador → Ver sem câmera | Resumo sobre a câmera, rastreamento real, estado preservado e câmera desliga ao estudar | NÃO VALIDADO |
| Erro de RA de continente já descoberto | Ver em 3D sem câmera abre a mesma ficha; Tentar novamente reinicia | NÃO VALIDADO |
| Ficha → Conhecer os países → ficha do país → dois retornos | Botão funciona sem gesto, modelo/ícone adequado, Voltar ao continente e Voltar ao mapa preservam progresso | NÃO VALIDADO |
| Arrastar só a alça da ficha para baixo / Entendi | Abre países; dica dispensada não volta; rolagem normal fora da alça não deve navegar | NÃO VALIDADO |
| Abrir Antártida pela ficha e tentar URL de países | Sem lista/botão de países; rota volta à ficha antártica | NÃO VALIDADO |
| Atividade → três erros → Mostrar a resposta → Refazer → acerto | Dicas sem punição; revelação não conclui; novo acerto conta uma vez; saída sem concluir preserva contagem | NÃO VALIDADO |
| Mapa com seis descobertas, antes/depois de seis atividades | Duas celebrações diferentes e consulta continua disponível | NÃO VALIDADO |
| Organizador → senha errada → correta → editar/revisar/cancelar/salvar → Sair | Atraso após erro, cancelamento não salva, salvar volta ao mapa e Sair encerra sessão em cada tela | NÃO VALIDADO |
| Organizador → importar inválido → exportar/importar rascunho válido | Aviso sem aplicar inválido; rascunho local; não altera descobertas dos alunos | NÃO VALIDADO |
| 360 px / teclado / movimento reduzido / leitor de tela | Sem corte dos cartões/botões; mapa desliza lateralmente e lista funciona; foco claro, importação focável e animação dispensável | NÃO VALIDADO |

Se qualquer percurso falhar, registrar o passo da tabela em AUDITORIA-FLUXOGRAMAS.md e atualizar PENDENCIAS.md, sem transformar evidência de código em aprovação manual.

## Refinamento infantil e mobile — 2026-10-29 — NÃO VALIDADO

Repetir em Android Chrome e iPhone Safari, em perfil de teste, com largura pequena e texto ampliado. Nenhuma linha abaixo foi executada em aparelho físico nesta revisão.

| Percurso | Resultado esperado | Resultado real / responsável |
|---|---|---|
| Início → Explorar / Minha coleção / Organizador | Ações legíveis, orientação na primeira visita e entrada do professor separada | NÃO VALIDADO |
| Mapa a 320, 360 e 390 px, paisagem e texto ampliado | Página sem rolagem lateral; só o mapa desliza; nomes e alvos legíveis; lista oferece os mesmos destinos | NÃO VALIDADO |
| Ficha / país → modelo carregando e falha de conexão | Status legível; controles indisponíveis durante carga; Tentar novamente recupera o visualizador | NÃO VALIDADO |
| RA com ficha curta longa e texto ampliado | Status, ficha e saídas sem colisão; área para ver marcador; botões acessíveis pela rolagem; iframe alinhado à área da câmera | NÃO VALIDADO |
| RA → Ajuda com câmera → página inteira | Ajuda expansível e plano B abrem a cena real; retornos e teardown continuam corretos | NÃO VALIDADO |
| Atividades no celular, por toque e teclado | Alternativas em coluna, silhuetas com mesmo tamanho, dica/acerto claros, foco visível e sem punição | NÃO VALIDADO |
| ADM → Ver como público → Voltar ao Organizador | Retorno disponível também quando a ficha já está desbloqueada; rascunho não aplicado como conteúdo publicado | NÃO VALIDADO |
| Editor → Revisar modificações | Foco chega ao painel de revisão; dados legíveis; salvar/cancelar/importar/exportar mantêm o fluxo | NÃO VALIDADO |
| Navegação com leitor de tela, zoom de 200% e movimento reduzido | Rótulos claros, ordem de foco coerente, controles ≥ 44 px, texto base ≥ 16 px, sem animação de movimento | NÃO VALIDADO |

## Reformulação ilustrada e navegação móvel — 2026-10-29 — NÃO VALIDADA

Revisão de telas no navegador bloqueada nesta sessão; nenhuma comparação antes/depois foi executada. Preencher por aparelho/navegador, com data, responsável e resultado real. Repetir também no desktop. A inspeção isolada dos SVGs não aprova nenhuma linha abaixo.

| Percurso | Resultado esperado | Resultado real / responsável |
|---|---|---|
| Início a 320/360/390 px e desktop | Planeta integrado à acolhida, sem distorção ou rolagem lateral; Explorar e Organizador disponíveis | NÃO VALIDADO |
| Navegação inferior, fim da página e teclado | Nenhum conteúdo/foco oculto pela barra; ícone e texto visíveis; item atual sublinhado; saídas claras | NÃO VALIDADO |
| Paisagem e rotas QR/AR | Navegação estática, sem cobrir câmera, status ou saídas; proporções e teardown preservados | NÃO VALIDADO |
| Texto a 200%, com e sem zoom de página | Marca, etapas, legendas QR/marcador, progressos e destinos quebram sem cortes; navegação e todas as ações acessíveis | NÃO VALIDADO |
| Como jogar e página bloqueada | Criança distingue o QR do marcador e entende qual usar; diagramas não substituem material imprimível | NÃO VALIDADO |
| Descoberto → ficha, dica de gesto aberta/fechada e Antártida | Arte não cobre a alça/dica; ficha curta, Ouvir e Saiba mais legíveis; países ocultos na Antártida | NÃO VALIDADO |
| Teclado, leitor de tela, preferências de movimento/transparência/contraste | Foco visível, sem transformação ao acionar por teclado; barra sólida quando solicitado; rótulos e ordem compreensíveis | NÃO VALIDADO |
| QR da folha e AR em Android Chrome/iPhone Safari | Desbloqueio só por leitura válida ou marcador estável; modelo acompanha pose; perda/retorno e cinco ciclos de saída funcionam | NÃO VALIDADO |

## Direção Apple e sálvia — 2026-10-29 — NÃO VALIDADA

Revisão no navegador bloqueada por indisponibilidade do host e interrupção do Chrome nativo por identificação insegura da URL. Executar também no desktop. Testes de cálculo da mola não validam os eventos de toque ou o layout real.

| Percurso | Resultado esperado | Resultado real / responsável |
|---|---|---|
| Início em 320/360/390 px, desktop e 200% | Fonte do sistema, fundo sálvia, título/convite/ações legíveis; faixa de missão e legenda do planeta sem corte horizontal | NÃO VALIDADO |
| Mapa → seis destinos por lista, toque e teclado | Nomes, cadeado/descoberta e atividade claros; lista agrupada e progresso separado; foco visível | NÃO VALIDADO |
| Ficha → arrastar alça devagar / soltar abaixo do limiar | Ficha acompanha o dedo; volta por mola sem oscilação; página continua rolável fora da alça | NÃO VALIDADO |
| Ficha → flick para baixo / reverter para cima / tocar durante retorno | Flick abre países; reversão cancela; pegar a ficha em movimento continua da posição atual, sem salto ou bloqueio | NÃO VALIDADO |
| Gesto horizontal, cancelamento e segundo dedo | Não abre países por gesto horizontal/cancelado; segundo dedo não muda a origem do primeiro | NÃO VALIDADO |
| Ficha por teclado, movimento reduzido e Antártida | Botão Conhecer os países funciona sem gesto; preferência remove deslocamento; Antártida não oferece países | NÃO VALIDADO |
| Barra flutuante, texto 200%, paisagem e fim da página | Foco/conteúdo não ficam escondidos; rótulos quebram; navegação estática em telas baixas e câmera | NÃO VALIDADO |
| Transparência reduzida / contraste maior | Barra sólida, bordas claras, estado atual também pelo peso/traço do ícone | NÃO VALIDADO |
| Organizador, fontes e AR inteira | Tema coerente; retorno público e editor preservados; câmera, pose e teardown seguem roteiro físico acima | NÃO VALIDADO |

## Atlas mobile — 2026-10-29

Revisão no navegador executada a 320/360/390 px e desktop, inclusive fonte raiz de 200% em página descartável. Isso não substitui os testes físicos abaixo. Registrar aparelho, navegador, responsável e data.

| Verificação em aparelho físico | Resultado |
| --- | --- |
| Barra inferior e topo respeitam recortes da tela; nenhum controle fica sob o indicador de início | NÃO VALIDADO |
| Ampliar texto a 200%; navegação entra no fluxo, rótulos continuam legíveis e não há rolagem horizontal | NÃO VALIDADO |
| Abrir teclado em busca e editor; foco e ações permanecem acessíveis sem zoom inesperado | NÃO VALIDADO |
| Girar para paisagem; mapa completo, nomes e saídas continuam disponíveis | NÃO VALIDADO |
| Toque dá retorno imediato e não deixa hover preso; texto das fichas continua selecionável | NÃO VALIDADO |
| Voz, leitor de tela, foco e preferências de movimento/transparência/contraste do aparelho | NÃO VALIDADO |
| Ler o QR correto, rejeitar outro continente, testar marcador estável, perda/retorno e cinco ciclos de AR | NÃO VALIDADO |
| Crianças compreendem folha, QR, marcador e estados de descoberta/atividade | NÃO VALIDADO |

## Entrada conforme as referências — roteiro físico de 2026-11-04

Status: NÃO VALIDADO em aparelho. Registrar aparelho, navegador, responsável e data antes de marcar os itens.

| Caso | Resultado esperado | Resultado físico |
| --- | --- | --- |
| Abrir app novo ou URL com `?continente=america` | Pontos apenas na carga real; primeira escolha “Eu sou...” | NÃO VALIDADO |
| Escolher Explorador, inclusive com introdução antiga já salva | Instruções sobre o mapa, progresso real, sem pergunta de ano | NÃO VALIDADO |
| Tocar em “Vamos explorar” após entrar pela URL | Mapa com América selecionada; URL sozinha não altera descoberta | NÃO VALIDADO |
| Câmera nas instruções sem destino | Escolher continente antes de abrir o leitor; cancelar seleção mantém instruções | NÃO VALIDADO |
| Câmera no mapa com seleção | Leitor do continente escolhido; QR errado rejeitado; Cancelar desliga câmera e retorna ao mapa | NÃO VALIDADO |
| Perfil Organizador com destino de QR na URL | Login existente, senha atual, mapa/editor do Organizador; Sair volta à escolha | NÃO VALIDADO |
| Voltar de uma sessão ADM e escolher Explorador | Progresso do aluno preservado, sem liberação temporária do ADM | NÃO VALIDADO |
| Texto a 200%, orientação e teclado real | Sem palavras cortadas ou rolagem horizontal; atalho não cobre instruções e controles | NÃO VALIDADO |
| Leitor de tela, áudio e movimento reduzido | Ordem compreensível, Ouvir só quando disponível, pontos estáticos com movimento reduzido | NÃO VALIDADO |
| Avaliação acompanhada com crianças | Entendem escolher continente, ler QR e diferenciar QR de marcador | NÃO VALIDADO |

As conferências no navegador e os comandos executados estão em `docs/INTERFACE-ENTRADA-REFERENCIAS.md`. Não marcar câmera/RA ou compreensão infantil como aprovadas com base nelas.

## Mapa ampliável, pop-up e câmera em tela cheia — 2026-11-04

Status físico: NÃO VALIDADO. Registrar aparelho/navegador, responsável e data. Os testes de layout do navegador estão em `docs/AJUSTES-MOBILE-CAMERA-MAPA.md`.

| Caso físico | Resultado esperado | Resultado |
| --- | --- | --- |
| Abrir Explorador em 320–390 px, com barras do Safari/Chrome visíveis | Dialog inteiro, passo legível e “Vamos explorar” visível sem rolar a página de fundo | NÃO VALIDADO |
| Percorrer três passos; X, Escape/voltar e “Trocar perfil” | Saídas coerentes e foco acessível; mapa real permanece ao fundo | NÃO VALIDADO |
| Texto a 200% e paisagem | Cabeçalho e ações visíveis; corpo pode rolar dentro do dialog, sem corte ou scroll horizontal da página | NÃO VALIDADO |
| “Ler QR Code” nas instruções | Destino válido vai ao leitor correspondente; sem destino, selecionar continente antes da leitura | NÃO VALIDADO |
| Pinça e arraste do mapa; trocar de dois dedos para um | Zoom contínuo dentro de 1×–5×, sem salto nem abertura acidental de continente | NÃO VALIDADO |
| Ampliar/Reduzir/Ver tudo e setas com teclado | Mesmo resultado dos gestos, enquadramento completo disponível, seleção por nome preservada | NÃO VALIDADO |
| Tela cheia na RA com câmera autorizada | Câmera ocupa o viewport; mesma pose e modelo, sem pedir uma nova sessão só por expandir | NÃO VALIDADO |
| Sair da tela cheia, girar aparelho e entrar novamente | Retorna ao local correto; modelo e pins permanecem alinhados e saídas não são cobertas por recortes/barras | NÃO VALIDADO |
| Usar moldura e miniatura do continente escolhido | Quadrado preto inteiro com margem clara; QR não é confundido com marcador; só evento real descobre | NÃO VALIDADO |
| Perder/reencontrar marcador e sair/entrar na câmera cinco vezes | Guia reaparece na perda, rastreamento retorna e câmera é liberada ao sair | NÃO VALIDADO |


## Correção de contraste e resolução — 2026-11-05

Relato recebido: iPhone/Safari perdendo o marcador da África visível em outra tela. A captura fornecida demonstra a falha, mas não comprova a causa exclusiva.

A cena agora solicita câmera 1280 × 960 (valores ideais, negociados com o aparelho), processa 640 × 480 independentemente do perfil automático e usa o limiar automático Otsu do ARToolKit. Antes, o perfil do iPhone processava 320 × 240 e o limiar era fixo em 100. Não foram alterados IDs, folhas, modelos, gesto, persistência ou a condição de 500 ms. URLs da cena/script foram versionadas para carregar a correção após atualização.

Verificação executada em Edge headless com perfil de viewport/user-agent de iPhone, AR.js 3.4.7 e detector ARToolKit real. A entrada foi um MediaStream de canvas controlado para a bancada, sem emitir eventos artificiais de reconhecimento. Os arquivos de bancada permanecem locais, em tmp/.

- Imagem do marcador em fundo branco, com movimento leve e tamanho variável: detector antigo e novo reconheceram em contraste normal.
- Contraste reduzido (preto misturado ao branco com opacidade 0,45), tamanhos 60/90/160 pixels em fonte 640 × 480: a versão anterior não reconheceu; a corrigida reconheceu e confirmou a descoberta.
- Os seis IDs, um por sessão: imagem de baixo contraste reconhecida; matriz da pose mudou acompanhando a imagem; fundo branco inicial não descobriu; remoção da imagem ocultou o modelo; nenhum erro JavaScript.
- Marcador de outro continente não manteve o marcador da África visível.
- Isso é uma bancada automatizada de visão, não teste físico nem garantia de estabilidade no Safari.

Pendente em aparelho físico: repetir com papel fosco a 100% e com folha em outra tela, variando distância, inclinação, brilho e iluminação. Conferir continuidade por 30 segundos, perda/retorno, ausência de falsa descoberta em passagem breve e temperatura/fluidez por alguns minutos. Registrar aparelho, iOS, navegador e resultado. A estabilidade física permanece NÃO VALIDADA.
