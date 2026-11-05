# Correções e otimização — 2026-11-03

Correções locais de funcionamento, preservando o atlas mobile, os fluxos da SPEC §14 e as regras de reconhecimento. Nenhuma publicação foi feita nesta tarefa.

## Falhas corrigidas

- O repositório agora mantém em memória o progresso já lido quando o armazenamento falha posteriormente, inclusive por falta de espaço. O aviso de persistência passa a refletir essa falha.
- A troca de sessão ADM não recarrega o conteúdo publicado. Leituras antigas não substituem o estado depois de sair; o início distingue progresso persistido de uma sessão temporária.
- A carga de conteúdo personalizado tem limite de cinco segundos, incluindo a leitura do corpo JSON. Em falha, cancela a requisição e usa as fichas originais.
- Overrides parciais preservam imagem da dica QR, variantes de outros anos e links complementares. O editor preserva descrição importada, atividades publicadas/extras, mídias publicadas e referências de continente, país e atividade.
- Sair durante a verificação da senha invalida o login pendente. O leitor QR cancela continuações depois de sair, trata falhas de processamento e oferece nova tentativa; não redimensiona o canvas sem necessidade nem processa vídeo sem dimensões.
- A RA em página inteira no ADM usa apenas memória. Navegar para essa página encerra a sessão ADM do React; nenhum progresso temporário é transferido ao progresso normal.
- Rejeição de uma página carregada sob demanda mostra recuperação com recarregamento e retorno ao início. O foco vai para a mensagem e a rolagem retorna ao topo, inclusive com texto ampliado.
- O ambiente local estava sem `VITE_ORGANIZER_PASSWORD_HASH`. O hash já presente no bundle público foi aplicado somente em `.env.local`, ignorado pelo Git, mantendo a senha existente. Nenhuma senha ou hash foi incluído neste relatório.

## Medida de otimização

Removidos 996 anéis SVG reduzidos a um único ponto. O JSON do mapa passou de 190.860 para 143.589 bytes (-24,77%); gzip de 72.750 para 62.082 bytes (-14,66%). As demais coordenadas, contornos e rótulos foram comparados com a versão anterior e permaneceram iguais. Nenhum GLB foi alterado; não foi medido ganho de tempo ou FPS em telefone.

## Decisões de interface

Aplicação pontual de frontend-design, apple-design e emil-design-eng: composição, cores e navegação existentes preservadas; mensagens curtas, ação de recuperação explícita, foco e resposta imediata. Sem novas animações ou dependências.

| Before | After | Why |
| --- | --- | --- |
| Página ausente derrubava toda a interface | Mensagem com “Recarregar a página” e “Voltar ao início” | Permitir recuperação sem tela vazia |
| Recuperação herdava a rolagem da tela anterior | Mensagem no topo, com foco programático e título associado | Manter orientação com teclado e texto a 200% |
| Mídia e fontes publicadas apareciam vazias ou eram substituídas | Campos mostram os caminhos permitidos e mantêm referências | Permitir edição fiel ao conteúdo existente |
| Início afirmava que o progresso estava salvo mesmo em fallback | Texto acompanha persistência e sessão ADM | Evitar confirmação falsa |

## Verificações executadas

`npm.cmd run typecheck`, `npm.cmd test` (34 testes em nove arquivos), `npm.cmd run build`, `npm.cmd run check:budget` (183 modelos), `node scripts/check-ui-contrast.mjs` (33 pares), `node scripts/verify-subpath.mjs`, `node --check public/ar/scene.js` e `git diff --check` passaram.

Navegador local: orientação e mapa em 320 px; editor e foco em desktop 1280 px; mapa e recuperação com fonte raiz de 32 px (200%) em 390 px. Nas telas medidas, scrollWidth foi igual a clientWidth. Bloqueio da África manteve zero visualizadores e não descobriu o continente. Login com credencial descartável de QA, preenchimento do editor por conteúdo publicado, revisão/salvamento/reabertura do rascunho e saída do ADM foram executados; o mapa normal voltou a zero descobertas/atividades. Em uma origem local nova, o campo de fontes herdou `autoral` do conteúdo publicado de QA.

A falha de rota foi reproduzida retirando temporariamente somente o chunk de Configurações do build descartável. A mensagem apareceu com foco correto; restaurar o arquivo e tocar em recarregar abriu Configurações. Não houve bloqueio ou alteração do site público.

O build normal substituiu os builds descartáveis. Confirmados: ausência de `text-200.html` e mídias de QA, overrides iguais aos de `public/content/overrides.json` e hash local normal configurado. As senhas e os textos descartáveis não fazem parte dos arquivos distribuídos.

## Limites e próximo passo

Câmera, QR impresso, estabilidade/pose AR, perda/retorno do marcador, cinco ciclos de teardown, áudio, gestos reais e desempenho em telefone continuam NÃO VALIDADOS fisicamente. Executar os novos casos em `TESTE-NO-CELULAR.md` antes de aceitar esses percursos. Revisão com crianças e leitor de tela também não foi realizada. Backlog de relevo/pontos turísticos e dados ainda em verificação continua em `PENDENCIAS.md`.
