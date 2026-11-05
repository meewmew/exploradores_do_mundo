# Atlas mobile — 2026-10-29

Reformular toda a interface, preservando a SPEC §14. A correção posterior do responsável substitui o verde pela paleta da captura enviada. Somente as cores são referência; a imagem não entra no site.

## Plano antes de editar

Aplicação de bolso, estreita inclusive no computador. O mapa real é a imagem principal do início; as seis descobertas formam um passaporte. Coleção com atlas e fichas de destinos. Estudo em uma coluna: modelo, ficha curta e ações. Barra inferior rotulada em todas as larguras; durante a câmera, navegação no fluxo para liberar a cena.

Paleta amostrada com PNGJS na captura: canvas `#faf7fd`, branco `#ffffff`, lilás `#eeeafb`, destaque `#ded8f5`, pêssego `#f9ddd3`, menta `#d7eee1`, tinta `#39334f`, apoio `#655a73`. Títulos compactos com fonte do sistema e peso 700; texto ≥16 px. Sem gradientes, brilho ou animações contínuas. Geografia dos dados existentes Natural Earth.

```text
Início                 Mapa                  Ficha
marca / ajuda          título / ajuda        voltar / nome
pergunta curta         dois progressos       modelo e controles
mapa ilustrado         atlas e legenda       ficha curta ilustrada
Explorar / coleção     seis fichas           Ouvir / Saiba mais
seis descobertas       estados e atividades  países / atividade
ajuda / Organizador    navegação inferior    navegação inferior
```

| Before | After | Why |
| --- | --- | --- |
| Landing com duas colunas e chamada genérica | Aplicação estreita centrada no mapa | Preservar formato mobile e identidade da geografia |
| Chamadas repetidas e planeta em halo | Mapa, passaporte e fichas com papéis distintos | Hierarquia por conteúdo e composição |
| Sálvia em toda a interface | Cores da última captura com texto/foco escuros | Seguir a correção explícita e preservar contraste |
| Navegação muda conforme largura | Barra inferior consistente e rotulada | Familiaridade e alcance no celular |
| Viewport sem safe areas e chrome rosa | Insets e chrome coerente com o fundo | mobile-native sem desativar zoom |

Skills: emil-design-eng/mobile-native solicitadas; frontend-design/apple-design conforme AGENTS.md. Pressão em 100 ms, hover apenas para mouse, foco sem movimento, preferências reduzidas preservadas. Gesto existente da ficha mantido.

## Verificação inicial

SPEC, progresso, pendências, telas e estilos lidos. Referência local e captura nova inspecionadas. Interface anterior observada no navegador a partir do build existente. HTTPS local interrompido por certificado; revisão usa prévia HTTP de QA, sem mudar HTTPS de desenvolvimento nem aceitar avisos de certificado.

Câmera/QR/AR, safe areas, teclado de celular, áudio e avaliação com crianças continuam sem validação física. Resultados finais serão registrados abaixo.

## Implementação e revisão executadas

Início substituído por mapa de capa e passaporte de seis silhuetas. Barra inferior constante, coluna de até 520 px também no computador, novas fichas de destinos, orientação em três etapas, informações e atividades em uma coluna. Configurações e Organizador recebem o mesmo sistema. A referência de cor foi registrada em SOURCES.md; geometrias e dados existentes foram preservados. Silhuetas das alternativas usam o mesmo lilás, sem pistas pela cor; o gerador altera somente a escrita desses SVGs, sem alterar geração de GLB.

Na revisão a 390 px, o antigo mapa com largura mínima de 840 px mostrou somente uma parte do mundo. Foi substituído pela visão completa, com nomes/símbolos em botões de pelo menos 44 px no mesmo painel. A lista ilustrada permanece disponível. O contorno tem espessura independente da escala, inclusive no foco. A lógica de seleção e os estados continuam os mesmos.

Na revisão a 200%, a navegação fixa ocupava grande parte da tela. A navegação passa ao fluxo quando a largura disponível fica abaixo de 18 vezes o tamanho real da fonte raiz. ResizeObserver mede espaço para texto, sem detectar aparelho. Os controles continuam legíveis e a ampliação permanece permitida. O atalho de pular conteúdo agora foca o conteúdo sem trocar a rota do HashRouter.

| Before | After | Why |
| --- | --- | --- |
| Mapa de 840 px exigia rolagem dentro do celular | Visão completa e seis botões rotulados | Geografia reconhecível e alvos utilizáveis |
| Texto a 200% deixava a barra fixa cobrir a tela | Barra no fluxo quando faltar espaço para o texto | Manter leitura, navegação e zoom |
| Borda inicial tinha contraste 2,83:1 sobre lilás | Borda `#827391`, contraste 3,17:1 | Limites de controles distinguíveis |
| Atalho de pular conteúdo alterava o hash | Foco programático sem navegação | Preservar a tela ao usar teclado |

Aplicações concretas das skills: emil-design-eng orientou pressão de 100 ms, ausência de entradas decorativas e movimento durante foco de teclado; mobile-native orientou viewport-fit, insets, dvh/svh, fonte de inputs ≥16 px, toque com manipulation, hover apenas com mouse e seleção bloqueada somente nos controles. frontend-design orientou atlas/passaporte em vez da composição anterior; apple-design orientou navegação previsível, materiais apenas na barra e preservação do gesto opcional da ficha, sem nova dependência.

Verificação no navegador via cua_repl: 320×740, 360×800, 390×844 e 1280×900. Início, orientação, mapa, bloqueio, ficha descoberta, países, atividade, conclusão, Configurações e editor examinados. No desktop a coluna mediu 520 px. Em amostras mobile, scrollWidth igual ao clientWidth. Texto a 200% verificado em HTML descartável de QA com fonte raiz de 32 px a 320 px: início, mapa, bloqueio, ficha, países, atividade, conclusão e editor sem rolagem horizontal. Não é teste de zoom por pinça em aparelho físico.

Interações executadas: primeira orientação → mapa; seleção bloqueada sem prévia; login ADM de QA → ficha; busca por Angola → país; erro de atividade → dica → tentar novamente → acerto → mapa; visualização pública do Organizador → ficha; navegação por Tab em campos (outline sólido de 3 px); atalho de pular conteúdo (foco em content, rota preservada). O modelo da África apareceu no navegador e seus controles ficaram disponíveis. Isso não valida câmera/AR física, outros modelos ou todo gesto WebGL.

O login ADM da revisão usou um hash descartável apenas no processo do build de QA, sem editar .env, senha real ou autenticação do projeto. O build normal final substitui a prévia de QA. A página descartável text-200.html e o hash de teste devem estar ausentes do build final. Não houve publicação.

Comandos finais: `npm.cmd run typecheck` (exit 0), `npm.cmd test` (15/15), `npm.cmd run build` (exit 0, seis conjuntos validados), `node scripts/check-ui-contrast.mjs` (33/33), `node --check scripts/build-models.mjs` e `git diff --check`. Dados, GLBs, cena/ponte AR, persistência, descoberta, dependências e regras de atividade sem alteração no diff.

Evidências locais ignoradas pelo Git em `artifacts/interface-atlas/`: inicio-360.jpg, inicio-desktop.jpg, ficha-390.jpg, inicio-final-mobile.jpg e mapa-final-390.jpg. A versão anterior foi observada no navegador antes da edição; não foi salva uma captura local da versão anterior.

Conferência final adicional: paisagem a 640×360 com navegação no fluxo e sem rolagem horizontal; foco visível nos cartões da coleção; barras dos dois progressos alinhadas (mesma posição vertical medida). `node artifacts/interface-atlas/final-check.mjs` confirmou tokens idênticos nas duas cópias, seis silhuetas na paleta e ausência de página/hash de QA no build normal final.

Continuam pendentes: câmera, QR/AR e rastreamento em celular; safe areas, teclado virtual, toque/hover reais; voz, leitor de tela, preferências do sistema e avaliação com crianças. Roteiro em docs/TESTE-NO-CELULAR.md. Nenhuma validação física ou com crianças foi declarada.

## Publicação posterior solicitada — 2026-10-29

`git push origin main` enviou até `18f409307db8d0b31f4485f805792cb9b7a5800a` ao repositório `identificação do repositório anterior removida a pedido`. SHA remoto conferido com `git ls-remote`. A API confirmou Pages em modo workflow, main e HTTPS ativo; a configuração existente já era correta. Workflow `workflow antigo #40962855759 (link histórico removido a pedido)` concluiu build e deploy com success.

`node scripts/check-published.mjs` e `node artifacts/interface-atlas/check-published.mjs` passaram. Chunks resolvidos pela entrada pública atual; nova composição e CSS confirmados, tokens/arte/silhuetas/fontes/cena iguais ao local por SHA-256. Seis conjuntos de GLB, QR, marcador e PDF responderam corretamente, assim como as bibliotecas locais e overrides. O Organizador mantém seu hash real configurado, sem exposição em relatórios.

Site `endereço da publicação anterior removido a pedido` conferido no navegador em 390 px: novo início, Explorar → orientação → mapa; sem rolagem horizontal na amostra medida. Captura em `artifacts/interface-atlas/publicado-390.jpg`. Isso não valida câmera/QR/AR física. O registro documental posterior não altera o bundle publicado.
