# Direção Apple com sálvia — 2026-10-29

**Teste no celular — atualização de 05/11/2026:** testado no celular e funcionou. Esta confirmação atualiza as pendências de funcionamento no aparelho registradas nas etapas anteriores. Avaliação com crianças, leitor de tela, medições de desempenho e casos específicos sem resultado individual informado continuam separados do teste geral. Registro em [TESTE-NO-CELULAR.md](TESTE-NO-CELULAR.md).

Pedido: aplicar `apple-design` como direção principal, usar a paleta da imagem enviada e publicar no GitHub. A nova referência de cor tem prioridade sobre a paleta anterior da SPEC §7; os fluxos da §14 e as regras de descoberta permanecem.

## Plano antes da implementação

Referência `C:/Users/ayan-/Desktop/Sem título.png` inspecionada. Amostragem dos pixels com PNGJS: fundo `#eef3e9` (26 499 pixels), suporte `#e0e9d8` (929), neutro `#e0e5d9` (387), ícone `#789071` e texto `#344b46`. A imagem não será incorporada ao site. Tons claros serão usados em superfícies; texto secundário e foco terão derivados mais escuros para contraste AA.

Base: branco `#ffffff`, canvas `#f8faf6`, sálvia `#eef3e9`, suporte `#e0e9d8`, tinta `#344b46`, ação verde `#4d6947`. Fonte do sistema (`-apple-system`, BlinkMacSystemFont, Segoe UI, system-ui). Títulos com peso 650–700, tracking negativo proporcional ao tamanho e entrelinha curta; texto ≥ 16 px, entrelinha confortável. Nenhuma fonte Apple redistribuída.

Composição: acolhida editorial com título amplo, uma ação principal e planeta-guia em uma área própria, sem bloco lavanda nem bordas orgânicas. Faixa de missão inspirada nas cores da referência liga ao mapa; progresso continua explícito. Na coleção, mapa primeiro e destinos como linhas de uma lista agrupada com silhueta, nome, estado e seta. Orientação mantém desenhos que explicam cada etapa. Fichas e Organizador compartilham o sistema, com conteúdo curto e Saiba mais preservados.

```text
Início / celular           Mapa                     Ficha
marca                      voltar / título          voltar / nome
título e convite           2 progressos separados   modelo com controles
Explorar | Minha coleção   mapa e legenda           ilustração / ficha curta
planeta sálvia             lista de 6 destinos      Ouvir / Saiba mais
missão / progresso         Como jogar               países / atividade
navegação flutuante        navegação flutuante      navegação flutuante
```

Apple: material translúcido apenas na navegação; superfícies de leitura sólidas; hierarquia por proximidade/tipografia, não cartões coloridos em tudo. Pressão responde imediatamente, ações confirmam no click; nenhum bloqueio de entrada ou atraso artificial. O gesto opcional da ficha deve acompanhar o dedo com Pointer Events/capture e voltar por mola sem overshoot, carregando a velocidade atual; o botão de países permanece. Movimento, transparência reduzida e contraste reforçado têm alternativas.

## Revisão do plano contra o pedido

| Before | After | Why |
| --- | --- | --- |
| Trebuchet, lavanda/pêssego e formas orgânicas dominam | Fonte do sistema, sálvia amostrada e geometria regular | Direção Apple visível no conjunto, além de detalhes |
| Painel infantil pesado e destinos como cartões com decoração | Acolhida com respiro, faixa de missão e lista agrupada | Priorizar conteúdo e próxima ação sem perder as ilustrações úteis |
| Gesto da alça só reage no touchend | Rastreamento 1:1, captura de ponteiro e retorno por mola | apple-design: manipulação direta, resposta contínua e interrupção |
| Navegação móvel com borda forte e fundo quase opaco | Material flutuante com estado atual legível | Profundidade funcional; opção sólida nas preferências de acessibilidade |

## Limite de revisão visual observado antes das edições

`cua.getState()` retornou `The browser access host is unavailable`. A seleção do Chrome nativo foi interrompida porque a ferramenta não conseguiu identificar a URL atual com segurança. Nenhuma automação alternativa será usada para contornar esse bloqueio. A comparação das telas renderizadas, 320/360/390 px, desktop, 200%, teclado e gesto real continua pendente. Leitura de CSS, cálculos de contraste e testes de domínio não equivalem à revisão visual. Testado no celular e funcionou, conforme confirmação recebida em 05/11/2026. Avaliação com crianças permanece pendente.

## Implementação e verificações locais

Abertura sem painel lavanda: título com hierarquia, ação principal escura, planeta sálvia em halo estático e faixa de missão. Navegação com material translúcido e estado atual por fundo, peso e espessura do ícone, incluindo as fichas e atividades no percurso Meu mapa. Lista agrupada de destinos com nome, silhueta, estado escrito/ícone e acesso à atividade. Orientação e bloqueio mantêm os desenhos QR/marcador. A arte já existente foi recolorida; planeta e folha rasterizados por Sharp e examinados isoladamente, sem constituir revisão do app.

Materiais sólidos para leitura; sombras restritas ao halo/legenda e à navegação. Fonte do sistema, tracking por tamanho, controles arredondados regulares. Cores principais medidas: texto secundário sobre o neutro mais exigente 4,60:1; texto principal sobre branco 9,37:1; texto branco na ação 9,37:1; bordas avaliadas ≥ 3,18:1. Cores claras dos ícones da referência não foram copiadas como texto informativo. Movimento e transparência reduzidos/contraste maior continuam contemplados.

Gesto da alça acompanha o ponteiro: histerese de 10 px, captura de ponteiro, origem de captura preservada, resistência progressiva, decisão por projeção exponencial de velocidade e sinal de reversão. Retorno com solução analítica de mola crítica, interrompível a partir de posição/velocidade atuais. Arraste horizontal/cancelamento não navega. Segundo ponteiro não substitui o primeiro. Antártida sem gesto de países; botão Conhecer os países permanece para as demais. Movimento reduzido remove deslocamento.

Implementação em `src/styles/{tokens,app,components,journey}.css`, início/coleção/navegação/destinos, ícones, `useCountryShortcut.ts` e `services/sheetMotion.ts`. `playful.css` substituído por `journey.css`. A cena AR recebeu somente a renomeação de duas variáveis CSS; seu código de reconhecimento e ponte não foram alterados. Fontes/licenças usa os mesmos tokens a partir do gerador `validate-content.mjs`. Sem novas dependências, dados geográficos, modelos ou alterações de persistência.

Comandos executados:
- `npm.cmd run typecheck`: exit 0.
- `npm.cmd test`: 15/15, três arquivos; quatro testes de matemática do gesto, além de navegação/HTML e domínio existentes. Não exercitam eventos reais do navegador.
- `npm.cmd run build`: exit 0; dados/fontes/arquivos dos seis continentes validados.
- O último build exigiu repetir `npm.cmd run build` fora do sandbox depois de uma negativa de leitura do esbuild; a repetição terminou com exit 0. Não foi feita alteração de código para contornar a permissão.
- `node scripts/check-ui-contrast.mjs`: 33/33 pares aprovados; não é auditoria WCAG completa.
- `node artifacts/apple-salvia/verify-assets.mjs`: tokens de app/cena idênticos e nenhuma variável CSS sem definição nas superfícies alteradas.
- `git diff --check`: sem erros. Comparação com HEAD dos dados, GLBs, QR/marcadores, conteúdo publicado, repositório de coleção, descoberta, ponte, scripts da cena e dependências: sem diferenças.

Correções por inspeção de código: histerese fixa após começar o arraste para evitar salto ao cruzar a origem; referências CSS da cena inteira atualizadas com os nomes semânticos; faixa de missão e ajuda quebram linha com texto grande; margem de rolagem reserva espaço para navegação; setas decorativas dispensadas no celular estreito. Layout e interação reais permanecem sem revisão por bloqueio do navegador. Roteiro acrescentado em `docs/TESTE-NO-CELULAR.md`.

## Publicação concluída

Implementação `5ad46f67a39ad553f99f18f0dd0a0eb1d20f3bd3` enviada para o repositório anterior (identificação removida a pedido); `git push origin main` concluiu e `git ls-remote` confirmou o mesmo SHA.

Workflow workflow antigo #40957898631 (link histórico removido a pedido) terminou com `success`, incluindo typecheck, testes, marcadores, build e deploy. Site: endereço da publicação anterior removido a pedido .

`node scripts/check-published.mjs` e `node artifacts/apple-salvia/check-published.mjs`: exit 0. Recursos dos seis continentes responderam; GLBs iguais aos locais. Chunks públicos atuais de Home/Collection/Continent e CSS contêm a implementação; tokens, planeta, diagrama, paisagens alteradas, cena HTML e fontes têm SHA-256 igual ao local. O verificador de publicação foi ajustado para resolver tanto `assets/...` como `./...` a partir da entrada pública, sem presumir nomes locais.

Isso confirma publicação dos arquivos, sem executar layout, eventos do gesto, câmera ou WebGL. Próximo passo exato: cumprir a seção Apple/sálvia do roteiro no navegador autorizado e em aparelhos físicos. Registro posterior somente documental, com `[skip ci]`.
