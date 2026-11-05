# Entrada conforme as referências — 2026-11-04

**Teste no celular — atualização de 05/11/2026:** testado no celular e funcionou. Esta confirmação atualiza as pendências de funcionamento no aparelho registradas nas etapas anteriores. Avaliação com crianças, leitor de tela, medições de desempenho e casos específicos sem resultado individual informado continuam separados do teste geral. Registro em [TESTE-NO-CELULAR.md](TESTE-NO-CELULAR.md).

Implementado `PROMPT-INTERFACE-AVENTURA.md` no app. Consultados AGENTS, SPEC, PROGRESSO, PENDENCIAS, as oito páginas do Plano de Projeto 1.3 e as referências locais. A página 3 do Plano também foi renderizada e inspecionada. As imagens de referência permanecem fora do produto; reutilizadas somente as ilustrações autorais e as fontes locais existentes.

## Decisões e implementação

| Before | After | Why |
| --- | --- | --- |
| Entrada com capa, passaporte e vários links | “Eu sou...” e duas escolhas grandes | Priorizar a composição da referência e a decisão de perfil |
| Instruções dispensadas pela preferência antiga | Toda nova abertura passa por perfil e instruções | Cumprir a sequência vigente, inclusive nos links diretos |
| URL de QR navegava diretamente à ficha | ID guardado em memória e destacado no mapa após as instruções | Preservar o destino sem descobrir pela URL |
| Instruções em cartões numa página própria | Painel creme sobre a mesma geometria do mapa | Manter relação espacial com a exploração e leitura clara |
| Indicador ilustrado genérico de carga | Oito pontos enquanto conteúdo, progresso, fontes ou chunks carregam | Seguir a referência sem porcentagem ou espera artificial |
| Progresso apenas no mapa | Barra e percentual reais também nas instruções | Apresentar a mesma informação ao longo do percurso |
| Sem atalho de câmera nas duas telas | “Ler QR Code” com seleção de continente quando necessário | Reutilizar o leitor real existente com cancelamento |
| Texto ampliado quebrava rótulos e deixava a câmera sobre a leitura | Botões adaptáveis e câmera no fluxo quando há pouco espaço por unidade de texto | Preservar leitura e operação a 200% |

`JourneyProvider` mantém somente papel, conclusão das instruções e destino pendente nesta abertura. Não cria progresso paralelo. A preferência antiga de introdução não permite pular etapas; a configuração opcional de ano continua em Configurações, com `geral` por padrão quando não configurada. Escolher Explorador encerra uma eventual sessão ADM antes de usar o progresso do aluno. Escolher Organizador descarta o destino pendente e segue o login existente.

O Organizador mantém o componente de login, a verificação PBKDF2, a configuração de hash e seu mapa/editor atuais. Nenhuma credencial foi consultada, transcrita ou alterada. Não houve alteração nos dados, GLBs, coordenadas do mapa, cena AR, repositórios de descoberta ou bibliotecas locais nesta tarefa. O mapa reutiliza os seis paths Natural Earth; suas cores agora referenciam os tokens existentes.

Aplicação das skills: frontend-design orientou a composição central dos perfis e o painel de papel sobre o mapa; apple-design orientou a sequência previsível, ausência de esperas artificiais e respostas imediatas; emil-design-eng orientou hierarquia, foco e a correção das quebras observadas; mobile-native orientou safe areas, alvos de toque e adaptação do atalho com texto ampliado. A nova folha de estilos usa somente cores dos tokens. A carga usa animação de opacidade, com pontos estáticos sob `prefers-reduced-motion`; esse modo foi conferido no código, não nas preferências físicas do aparelho.

## Verificado

- `npm.cmd run typecheck`: exit 0.
- `npm.cmd test`: 49 testes em 15 arquivos, todos aprovados. Os testes novos cobrem barreiras de entrada, destinos válidos/inválidos, progresso real, ausência de controles ocultos no fundo e ausência de câmera no simples atalho.
- `npm.cmd run build`: exit 0, incluindo validação de conteúdo/fontes dos seis continentes; build normal final com prefixo `/testtt/`.
- `node scripts/verify-subpath.mjs`: exit 0, build adicional em `/exploradores-do-mundo/` com recursos locais.
- `node scripts/check-ui-contrast.mjs`: 38/38 pares aprovados; não é auditoria WCAG completa.
- `git diff --check`: exit 0.

Revisão no navegador integrado: escolha, instruções e mapa em 320/390 px e desktop 1280 px; login existente em 390/1280 px; nenhum overflow horizontal nas medições realizadas. Conferidos seleção do continente por Enter, Tab e foco visível, seletor do QR com seis opções, Escape com foco devolvido ao atalho, rota do leitor para o continente selecionado e Cancelar de volta ao mapa. Não foi concedida permissão de câmera nem executada leitura física.

Conferido `?continente=america`: escolha → instruções → mapa com América selecionada, ainda bloqueada e com progresso 0/6. Recarregar uma rota também retorna à escolha de perfil. Escolher Organizador abre o formulário existente; Sair retorna à escolha. O login positivo com a senha real não foi executado; o mecanismo permanece coberto pelos testes existentes de autenticação e não foi modificado.

Texto a 200% foi conferido em 390 px por um HTML descartável com fonte raiz de 32 px, sem manipular progresso ou credenciais. Escolha, instruções e mapa mantiveram largura dentro da página. Corrigidos rótulos de perfil, título das instruções e sobreposição da câmera encontrados nessa rodada. O build normal final removeu o HTML de QA.

Capturas locais em `artifacts/interface-entrada/` (pasta ignorada): escolha/instruções em 390 px, instruções/mapa em desktop. Prévia local do build final em `http://127.0.0.1:4175/testtt/`; não foi realizada publicação remota.

## Publicação

Refinamento posterior solicitado nos comentários do navegador: navegação só com ícones, remoção de título/frase redundantes, mapa mais alto com progresso diretamente acima e retirada das três nuvens SVG. A solicitação explícita de ícones substitui o rótulo visível desses três links; nomes de leitor de tela, atributo `title`, foco e alvos de 48 px permanecem. “Meu mapa-múndi” é o único h1 do mapa. Atividades/avisos foram movidos para depois da área geográfica. Conferidos 320/1280 px e texto a 200% em 390 px, Tab/Enter e ausência de overflow. Skills aplicadas por redução de repetição, hierarquia, foco e alvos de toque; sem dados, modelos, credenciais ou mudanças de domínio.

Refinamento publicado em `ca21d48`, workflow `41953187470` com `success`. Ambos os verificadores de publicação passaram; mapa público aberto e conferido no navegador, com captura `artifacts/interface-entrada/mapa-sem-nuvens-publicado.jpg`.

| Before | After | Why |
| --- | --- | --- |
| Três links com texto permanente | Três ícones com nome acessível e `title` | Atender ao pedido mantendo identificação assistiva e foco |
| Dois títulos para o mapa e atividades antes dele | Um h1 “Meu mapa-múndi”, barra logo acima e atividades abaixo | Antecipar a geografia e retirar repetição |
| Três nuvens SVG sobre a água | Sem essas formas decorativas | Deixar o fundo limpo conforme solicitado |

Publicação posterior autorizada e concluída: commit `d7de3a6`, workflow `41950913497` com `success`, em `endereço da publicação anterior removido a pedido`. Os dois verificadores de publicação passaram; escolha, instruções e acesso ao mapa públicos conferidos no navegador. Captura em `artifacts/interface-entrada/publicado.jpg`. O registro anterior de prévia local descreve a etapa de implementação, antes do pedido de envio.

## Testado no celular e verificações específicas

Testado no celular e funcionou, conforme confirmação recebida em 05/11/2026. Câmera, QR em papel e reconhecimento/alinhamento confirmados. Leitor de tela, áudio, avaliação com crianças, medições de desempenho e casos específicos do roteiro sem resultado individual informado permanecem em verificação. Roteiro para repetição em `docs/TESTE-NO-CELULAR.md`.
