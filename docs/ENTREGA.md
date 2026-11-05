# Relatório de entrega — 2026-10-28

## Feito e verificado

O projeto foi criado nesta pasta e versionado por marcos. Os seis continentes foram implementados e publicados em endereço da publicação anterior removido a pedido . Repositório: identificação do repositório anterior removida a pedido . Câmera/AR físicos e interface em navegador não são declarados validados.

Publicação confirmada: workflow antigo #40804625866 (link histórico removido a pedido) — build e deploy concluídos com sucesso, incluindo typecheck/testes no Linux. A checagem HTTP dos seis conjuntos passou; modelos públicos têm o mesmo SHA-256 dos locais. O Organizador recebeu hash pela variável do repositório; a senha aleatória não está no código.

Comandos executados com sucesso no Windows (PowerShell, Node 24.19.0):

| Comando | Evidência |
|---|---|
| `npm.cmd install` | Dependências instaladas e lockfile gerado; tipos Node adicionados com versão exata |
| `npm.cmd run build:data` | 6 JSONs, 193 membros + 2 observadores cruzados com Natural Earth; 195 Estados sem duplicação |
| `npm.cmd run build:models` | 183 GLBs: 6 continentes e 177 países |
| `npm.cmd run build:markers` | 6 QR SVG/PNG, 6 barcode SVG/PNG e 6 PDFs A4 |
| `npm.cmd run typecheck` | Sem erros |
| `npm.cmd run build` | Conteúdo/fontes/arquivos validados; build de produção sem erros |
| `npm.cmd test` | 10 testes essenciais passaram; sem bateria exaustiva |
| `npm.cmd run check:budget` | 183 modelos dentro do orçamento |
| `node scripts/verify-model-determinism.mjs` | Os 183 SHA-256 ficaram idênticos após regeneração |
| `node scripts/verify-subpath.mjs` | Build em /exploradores-do-mundo/ e assets locais presentes; sem execução em navegador |
| `npm.cmd run dev` + `node scripts/check-local-https.mjs` | HTTPS iniciou; página, módulo React, cena AR, módulo compartilhado, parâmetros da câmera, GLB, PDF e overrides responderam HTTP 200 |
| `node scripts/check-published.mjs` | App publicado, JavaScript, cena/bibliotecas locais e seis conjuntos de GLB/QR/marcador/PDF responderam HTTP 200 |

Revisão de artefatos: seis PDFs renderizados com PyMuPDF em cache local; todos A4, uma página, sem texto fora da página. Montagem das seis folhas e silhuetas inspecionada visualmente. O teste de QR decodifica os arquivos PNG com jsQR em Node; não usa câmera e não valida reconhecimento físico.

| Modelo | Triângulos | KB |
|---|---:|---:|
| África | 6.004 | 386,58 |
| América | 4.084 | 277,14 |
| Antártida | 5.692 | 381,50 |
| Ásia | 5.164 | 358,73 |
| Europa | 4.412 | 297,23 |
| Oceania | 3.560 | 246,91 |

## Checklist final, item a item

| Item solicitado | Resultado e limite da verificação |
|---|---|
| 1. Seis GLBs gerados pelo pipeline, dentro do orçamento | **Concluído e verificado** por geração, parse, orçamento, normalização e SHA-256 |
| 2. Seis arquivos de dados com fontes e verificar | **Concluído**; valores não confirmados são null/verificar:true, com relação completa em DADOS-EM-VERIFICACAO.md |
| 3. Seis QR + seis marcadores distintos + seis folhas A4 | **Concluído e verificado como arquivo**; PNGs decodificados e PDFs finais renderizados. Leitura de papel não validada. Folhas apontam para a URL pública correta |
| 4. Mapa bloqueado/descoberto/selecionado, X de 6 e lista acessível | **Implementado**; progresso/lógica verificados; navegação, layout e acessibilidade manual não validados em navegador |
| 5. QR dentro do app, só do selecionado, e desbloqueio AR | **Implementado**; validação de URL, origem, janela, continente e estabilidade coberta. Câmera/pose reais **não validadas** |
| 6. Fichas ilustradas, Ouvir, Saiba mais, botões, países sob demanda, Antártida sem países | **Implementado**; dados/arquivos validados. Modelos nacionais: 177; microestados sem geometria útil usam símbolo. Interface/voz em aparelhos não validadas |
| 7. Atividades padrão e por ano, dica, repetição, sem duplicação, contadores e conclusão | **Implementado**; lógica essencial de erro, resposta revelada, contagem por continente e seis descobertas testada. Duas atividades gerais e variantes para os nove anos; editor acrescenta outras |
| 8. Organizador com hash, editor, exportar/importar e limitação documentada | **Implementado e hash configurado** na variável do repositório; PBKDF2 e rejeição de override inválido testados. Senha fornecida fora do código. Fluxo visual/importação pelo navegador não validado |
| 9. Exploração sem câmera dos seis com países | **Implementado**; mesmos GLBs da AR e carregamento sob demanda. Parse Node verificado, interação WebGL em celular não validada |
| 10. Typecheck, build e npm test | **Passaram**; 10 testes essenciais |
| 11. Pages, README, SOURCES, PENDENCIAS e guias | **Concluído e publicado** no repositório anterior (identificação removida a pedido); build/deploy com success e verificação HTTP pública. Documentação e PDF dos fluxogramas incluídos |

## Feito mas não verificado

- Câmera Android Chrome e iPhone Safari; rastreamento da posição e orientação do marcador; gestos; perda/retorno; permissão negada; cinco ciclos de teardown.
- Interface real, leitor de tela, voz pt-BR, editor e importação/exportação pela UI. Computer Use retornou host de navegador/pipe nativo indisponíveis.
- A publicação e o carregamento por HTTP foram verificados. A execução da interface pelo navegador continua sem validação manual.

## Pendente

1. Publicação resolvida: repositório informado, Pages ativado, main enviada e recursos públicos verificados. Não há bloqueio de publicação restante.
2. Para testar por IP/túnel local, configurar `VITE_PUBLIC_URL` e regenerar as folhas. As folhas públicas já estão corretas para o site publicado.
3. Executar TESTE-NO-CELULAR.md em Android e iPhone. Não remover o status de não validado sem registrar resultados.
4. Confirmar áreas/populações continentais e áreas nacionais conforme DADOS-EM-VERIFICACAO.md; campos permanecem honestamente em verificação.
5. Para trocar a senha aleatória ou usar localmente, gerar outro hash e configurar a variável correspondente. A barreira é local e não protege conteúdo público contra inspeção.

O PDF original dos cinco fluxogramas foi recebido na raiz durante a execução e copiado para docs/, preservando o original. Navegação implementada pela transcrição normativa da SPEC §14.

## Como rodar e testar no celular

1. `npm.cmd install` e `npm.cmd run dev` na raiz.
2. Mesmo Wi-Fi no computador e celular; usar o endereço **HTTPS** de rede informado pelo Vite.
3. Autorizar manualmente o certificado local de desenvolvimento ou usar o túnel/certificado confiável descrito no README.
4. Definir `VITE_PUBLIC_URL=https://IP-DO-COMPUTADOR:5173/` em `.env.local`, reiniciar o Vite e rodar `npm.cmd run build:markers`.
5. Imprimir os seis PDFs de public/print/ em A4, 100%, marcador de 9 cm. Não usar folha de localhost no celular.
6. Escolher um continente, escanear o QR dentro do app, abrir a ficha e testar Ver em RA com o quadrado preto. Conferir que o objeto acompanha o papel.
7. Seguir todos os itens de TESTE-NO-CELULAR.md, inclusive sair/reentrar cinco vezes e revisar persistência/atividades.
