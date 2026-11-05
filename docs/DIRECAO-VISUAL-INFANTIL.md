# Reformulação visual infantil — 2026-10-29

**Teste no celular — atualização de 05/11/2026:** testado no celular e funcionou. Esta confirmação atualiza as pendências de funcionamento no aparelho registradas nas etapas anteriores. Avaliação com crianças, leitor de tela, medições de desempenho e casos específicos sem resultado individual informado continuam separados do teste geral. Registro em [TESTE-NO-CELULAR.md](TESTE-NO-CELULAR.md).

## Plano antes da implementação

Referência `referencia-visual.png` examinada localmente. AGENTS, SPEC (incluindo §14), PROGRESSO e PENDENCIAS lidos. Skills frontend-design, apple-design e emil-design-eng lidas nos caminhos instalados. Nenhuma mudança em modelos, dados 3D ou desempenho: as skills de Three.js não se aplicam.

Tokens principais: branco papel #FFFFFF, lavanda personagem #B5ADEB, pêssego #F5C5B8, menta #D9EFE5, tinta #302C43, roxo de ação #63549F. Tons claros derivados mantêm o texto escuro; rosa permanece como superfície da identidade existente. A cor mais saturada concentra-se na acolhida. Trebuchet MS para títulos e corpo: fonte local, sem nova transferência, formas abertas e arredondadas adequadas ao material infantil; hierarquia por tamanho, peso e entrelinha. Corpo >= 1rem e textos sem caixa alta decorativa.

Composição: um grande planeta-guia na acolhida, integrado ao painel lavanda, em vez de uma imagem em cartão ao lado de outros cartões. No celular a ilustração antecede o convite e a ação Explorar. Navegação com ícone e nome, próxima do polegar; conteúdo alinhado à esquerda, ações centrais. Orientação com imagens junto de cada etapa real. Coleção com silhuetas sobre campos orgânicos e estados escritos. Bloqueio com uma tarefa clara e diagrama da folha; ficha descoberta mantém modelo, ficha curta e Saiba mais.

```text
Celular / início       Orientação              Coleção
marca                  voltar + título         título + guia
[planeta-guia]         imagem / escolha        descobertas | atividades
convite curto          imagem / folha          mapa real + legenda
Explorar               imagem / câmera         seis destinos ilustrados
Minha coleção          ano + Explorar mapa     navegação com nomes
entrada Organizador
nav: início mapa ajustes
```

Revisão do plano contra o pedido: rejeitada a mera troca de cores e repetição de cartões iguais. A composição memorável será o planeta que ocupa a abertura; as telas internas terão superfícies mais calmas e arte que explica a tarefa. Não copiar o personagem, tipografia serifada, marca ou desenhos da referência. Seu texto branco sobre lavanda também não será reproduzido: usar tinta escura com contraste calculado. Sem animação de entrada repetitiva, flutuação contínua ou biblioteca adicional de gestos. O atalho de gesto existente e todos os botões permanentes continuam.

## Revisão inicial do código

| Before | After | Why |
| --- | --- | --- |
| Texto primeiro no celular, arte em bloco separado abaixo | Planeta-guia integrado à abertura e convite curto | Personalidade e compreensão visual antes da leitura |
| Ilustração da folha separada das três instruções | Uma pequena cena junto de cada etapa | Relacionar desenho e ação para crianças em alfabetização |
| Navegação textual ocupa duas linhas no topo | Navegação móvel inferior com ícones e nomes | Mais espaço para o conteúdo e ações ao alcance do polegar |
| Silhuetas em cartões brancos uniformes | Campos orgânicos, nome destacado e estado por texto/símbolo | Facilitar reconhecimento sem depender só de cor |
| Ações principais e secundárias com peso próximo | Botão escuro para ação principal e superfícies brancas para alternativas | Próximo passo mais evidente |

## Revisão visual: bloqueio observado antes das edições

Não foi possível capturar o antes no navegador. `cua.getState()` informou `The browser access host is unavailable`, sem navegadores disponíveis. A tentativa nativa pelo Chrome aberto foi encerrada por Computer Use: `could not determine the current browser URL on Windows with enough confidence to enforce policy`. Nenhuma outra automação de navegador foi usada para contornar esse bloqueio. Inspeção da referência local e leitura do código não equivalem a comparar telas renderizadas. Revisão antes/depois, texto ampliado e teclado no navegador ficam pendentes, e a avaliação com crianças. Câmera/AR foram posteriormente testadas no celular e funcionaram, conforme confirmação de 05/11/2026.

## Implementação concluída localmente

Acolhida em uma composição integrada: planeta-guia autoral, convite curto e ação escura Explorar. A arte vem primeiro no celular; no desktop compartilha o painel com o texto. Progresso e Como jogar ficam abaixo, com a entrada Organizador separada. Navegação com três destinos e ícones acompanhados de texto; barra inferior no celular, estática em telas baixas e nas rotas de câmera. Item atual também sublinhado. Reserva de espaço abaixo do conteúdo e safe area; sem bloquear zoom.

Orientação com mapa dobrado, folha e demonstração ilustrativa do marcador ao lado das respectivas instruções. A folha possui nova arte e legendas HTML na página bloqueada, que acompanham a ampliação de texto. Nenhum desenho substitui os QR/barcodes imprimíveis ou simula reconhecimento. Os dois caminhos reais de descoberta são os mesmos.

Coleção com campos orgânicos para as silhuetas, nomes maiores e estados por texto/símbolo, preservando mapa verdadeiro, lista alternativa e contadores independentes. Seis paisagens redesenhadas com camadas, formas arredondadas e paleta coerente; a ficha as mostra em uma faixa maior acima do conteúdo curto. Saiba mais continua recolhido. Botões de países, estudo e RA preservados. Novos componentes pequenos: `DestinationCard`, `DiscoveryGuide`, `GuideScene` e `InterfaceIcon`.

| Before | After | Why |
| --- | --- | --- |
| Texto e ilustração em blocos independentes; paisagens com poucos elementos | Planeta na abertura, paisagens com planos e silhuetas em campos orgânicos | frontend-design: identidade de exploração e mudança de composição, além de cores e espaçamento |
| Navegação ocupa o topo no celular; ações com peso semelhante | Navegação próxima do polegar, ícones com nomes, ação principal escura | apple-design: alcance, previsibilidade e hierarquia; translucidez leve apenas no chrome flutuante |
| Acessibilidade dependia principalmente de mínimos fixos | Grades e etapas podem quebrar por tamanho do texto; transparência/contraste/movimento respeitam preferências | apple-design: layout acompanha o texto; materiais viram sólidos quando solicitado |
| Arte sem tamanho intrínseco no início; imagem da ficha pequena | Proporção reservada para o planeta; faixa ilustrada na ficha | emil-design-eng: reduzir salto durante a carga e ajustar detalhes que compõem o conjunto |
| Feedback de pressão não distinguia foco por teclado | Escala 0,97 só em pressão sem focus-visible; movimento reduzido elimina deslocamento | emil-design-eng e apple-design: resposta imediata sem animar ações de teclado |

Não foram criados gestos, springs, animações de entrada ou loops. A decisão de não animar a navegação e a leitura segue o filtro de frequência/propósito da emil-design-eng. Hover permanece restrito a ponteiro preciso; transições de pressão especificam apenas transform e cor, com 140 ms. Não foi necessário adicionar bibliotecas.

## Verificações executadas e limites

- `npm.cmd run typecheck`: exit 0.
- `npm.cmd test`: 11/11 testes, dois arquivos, passaram no código/dados finais; cobrem domínio e HTML, não layout interativo.
- `npm.cmd run build`: exit 0; conteúdo, fontes e arquivos dos seis continentes validados.
- `node scripts/check-ui-contrast.mjs`: 35/35 pares; menor contraste de texto avaliado 4,58:1, botão principal 13,40:1, borda de controle mínima 3,33:1. Não é auditoria WCAG completa.
- `node artifacts/revisao-visual/check-art-generation.mjs`: `build:data` executou com exit 0 e preservou os hashes de todos os SVGs. O gerador agora escreve somente dados, preservando a arte autoral versionada. A geração de dados brutos reinclui referências de modelos que o pipeline posterior trata; os JSONs finais foram preservados/restaurados byte a byte pelo verificador. Não houve reconstrução de modelos, e nenhum JSON final foi alterado.
- SVGs rasterizados por Sharp e examinados isoladamente: planeta, folha e prancha das seis paisagens, em `artifacts/revisao-visual/`. Uma ligação dos braços foi corrigida. São imagens da arte vetorial, não capturas do app ou evidência de comparação de layout no navegador.
- `git diff --check`: sem erros. `git diff --exit-code HEAD -- AGENTS.md SPEC.md src/services src/hooks src/data public/ar public/models package.json package-lock.json`: sem diferenças antes do commit desta etapa. Tokens públicos e `fontes.html` atualizados pelo build.

Correções por inspeção do código: retirar margem superior negativa da arte da ficha para não invadir a dica de gesto; quebra automática de etapas/progressos/destinos/legendas com texto maior; marca pode quebrar sem ultrapassar a tela. Essas são decisões de implementação, ainda sem conferência de layout renderizado. Sem comparação antes/depois no navegador, teste real de 200%, teclado, leitor de tela ou aparelho físico. Próximo passo: executar a seção nova de `docs/TESTE-NO-CELULAR.md` quando o acesso ao navegador estiver disponível e registrar resultados, sem aprovar câmera/AR antes de testes físicos.

## Publicação posterior, autorizada pelo responsável

`git push origin main` enviou a implementação `d6f8a23` em 2026-10-29. Workflow workflow antigo #40953119140 (link histórico removido a pedido) concluiu build/deploy com success. Em endereço da publicação anterior removido a pedido , `node scripts/check-published.mjs` e `node artifacts/revisao-visual/check-published-redesign.mjs` passaram: modelos/QR/marcadores/PDF/bibliotecas locais disponíveis; oito SVGs e tokens idênticos ao checkout por SHA-256; Home e CSS públicos contêm a nova composição. Chunks obtidos da entrada pública atual, sem presumir os nomes locais. Isso confirma a publicação dos arquivos, sem revisão visual nem execução de câmera/WebGL.
