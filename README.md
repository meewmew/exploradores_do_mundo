# Exploradores do Mundo

Jogo educativo mobile-first em React e TypeScript: seis continentes, leitura real de QR dentro do app, realidade aumentada por marcador físico, modelos 3D sem câmera, países e atividades. Dados e progresso ficam no navegador; não há cadastro, GPS, backend ou serviço pago.

## Interface infantil de aventura - 04/11/2026

Novo visual implementado localmente a partir das telas e da prancha recebidas: céu azul, papel creme, marinho, laranja e amarelo, com Fredoka e Nunito servidas pelo próprio app. Entrada com Explorador e Organizador, instruções ilustradas com áudio disponível, passaporte, mapa com percentual e fichas padronizadas. No celular, a escolha de perfil vem antes da capa ilustrada. Detalhes em [Interface de aventura](docs/INTERFACE-AVENTURA-2026-11-04.md).

Typecheck, build, 48 testes e 38 pares de contraste aprovados; revisão de navegador em 320/390 px, desktop e texto a 200%. Câmera/QR/RA em celular físico continuam pendentes. Esta atualização visual ainda não foi publicada; os links públicos abaixo podem mostrar o visual anterior.

## Folhas para testar a realidade aumentada

O novo endereço de acesso será [meewmew.github.io/exploradores_do_mundo](https://meewmew.github.io/exploradores_do_mundo/). A publicação ainda está pendente de permissão de escrita no repositório e configuração do GitHub Pages. Depois do primeiro deploy, baixe nessa página o PDF com as seis folhas A4. Cada página tem o QR do continente e seu marcador RA de 9 cm. Imprima em tamanho real (100%), sem ajustar à página. Ler o QR com a câmera do celular abre o continente; no app, toque em “Iniciar realidade aumentada” ou “Ver em RA” e aponte para o quadrado preto. Abrir o endereço sozinho não registra a descoberta.

Folhas individuais serão disponibilizadas no mesmo endereço após o deploy. Exibir a folha em outra tela serve para uma verificação preliminar; a validação final exige o material impresso e o roteiro em `docs/TESTE-NO-CELULAR.md`.

## Auditoria e visual de 2026-10-29

[Auditoria dos fluxogramas](docs/AUDITORIA-FLUXOGRAMAS.md): comparação das cinco páginas locais com a SPEC §14, tabela por passo, correções e limites das evidências. `referencia-visual.png` foi consultada localmente, sem incorporar marca, textos ou imagem no build. A nova arte SVG é autoral MIT.

Paleta e valores reutilizáveis ficam em `src/styles/tokens.css`. `app.css`/`components.css` usam os tokens; `expedition.css` padroniza os componentes e `welcome.css` compõe o início e a orientação. O preparo de desenvolvimento/build copia os tokens para `public/styles/tokens.css`, também usado pela página AR isolada; editar a fonte em `src/`, não a cópia gerada. Textos usam tons escuros, foco visível e controles alternativos aos gestos.

Depois de entrar no Organizador, o **modo ADM** libera os seis continentes na navegação normal. QR, marcador, atividades, perfil e reinício passam a usar uma coleção temporária em memória. **Sair do ADM** encerra a sessão e descarta esse progresso; descobertas, atividades e ano dos alunos não são alterados. O login pede a mesma capitalização configurada. O hash vem de `VITE_ORGANIZER_PASSWORD_HASH` nas variáveis do GitHub Actions; não inclua o texto da senha no repositório.

Dados pontuais confirmados que complementam o Natural Earth ficam em `data-src/country-facts.json`, com fonte em SOURCES.md; o pipeline aplica a capital de Juba confirmada na UNdata. Demais dados não confirmados continuam em verificação. Esta revisão passou em typecheck, build e 11 testes essenciais; câmera, RA e revisão manual da interface continuam pendentes. A publicação histórica desta revisão ocorreu no endereço anterior, agora removido a pedido; workflow antigo #40814989509 concluiu build/deploy e verificação HTTP dos arquivos daquela versão. Isso não comprova a publicação no novo destino.

## Rodar no Windows

Pré-requisito: Node.js 22.12+ (recomendado 22 LTS) e npm. No PowerShell, use `npm.cmd` se a política de execução bloquear `npm.ps1`.

```powershell
npm.cmd install
npm.cmd run dev
```

Abra **https://localhost:5173/** no computador. O Vite usa `@vitejs/plugin-basic-ssl` e escuta a rede local. O servidor precisa continuar aberto.

### HTTPS no celular

1. Conecte computador e celular à mesma rede. Em `ipconfig`, identifique o IPv4 do adaptador ativo.
2. Abra no celular `https://IP-DO-COMPUTADOR:5173/`. O endereço **http://** com IP não dá acesso à câmera.
3. O certificado de desenvolvimento é autoassinado. A exceção deve ser autorizada manualmente no seu aparelho, em rede de confiança. Se o navegador ainda bloquear a câmera, use um certificado confiável instalado no celular ou a alternativa de túnel abaixo.
4. Crie `.env.local` com `VITE_PUBLIC_URL=https://IP-DO-COMPUTADOR:5173/` e `VITE_BASE_PATH=/`. Termine a URL com `/`. Reinicie o Vite.
5. Execute `npm.cmd run build:markers`. Imprima as seis folhas em `public/print/`, em tamanho real, ou abra os PDFs no computador para uma verificação preliminar.
6. No app, escolha Explorar, informe/pule o ano e selecione o continente. Leia o QR **dentro do app**. Uma URL aberta pela câmera nativa apenas seleciona o continente.
7. Depois da descoberta, use a ficha e o modelo sem câmera. Em **Ver em RA**, aponte para o marcador preto da mesma folha. Gire/mova o papel: o objeto deve acompanhar a pose física, não ficar fixo à tela.
8. Execute [o roteiro de teste físico](docs/TESTE-NO-CELULAR.md). Android Chrome e iPhone Safari ainda estão **não validados**.

Alternativa gratuita, se `cloudflared` estiver instalado pela fonte oficial:

```powershell
cloudflared tunnel --url https://localhost:5173 --no-tls-verify
```

O navegador usa o certificado público do túnel; `--no-tls-verify` é somente para o certificado autoassinado entre o túnel e o Vite local. Coloque a URL HTTPS temporária emitida em `VITE_PUBLIC_URL`, reinicie o servidor e regenere as folhas. A URL muda ao recriar o túnel. Compartilhe somente o app destinado à atividade; encerre o túnel depois.

## Comandos e reprodução

| Comando | Função |
|---|---|
| `npm run dev` | HTTPS local, inclui geração do módulo compartilhado da RA |
| `npm run typecheck` | TypeScript estrito, sem emissão |
| `npm test` | Vitest: verificações essenciais de persistência, reconhecimento, dados/modelos, atividades e Organizador |
| `npm run build` | Gera módulo da RA, valida conteúdo/fontes/arquivos e produz `dist/` |
| `npm run build:data` | Reproduz JSONs a partir dos snapshots Natural Earth e ONU e do editorial |
| `npm run build:models` | Gera GLBs, mapa, silhuetas e `models-report.json` |
| `npm run build:markers` | Gera seis QR, barcodes e PDFs A4 para `VITE_PUBLIC_URL` |
| `npm run check:budget` | Confere tamanho e contagem de triângulos |
| `npm run data:fetch` | Reobtém dados e bibliotecas versionadas; só necessário para atualização/reprodução |
| `npm run organizer:hash` | Produz PBKDF2/SHA-256 com sal aleatório; não salva a senha |

Todos os recursos necessários ao build já estão versionados. Nenhuma CDN é usada em produção. Scripts são Node.js e usam caminhos multiplataforma. Artefatos GLB são determinísticos; PDFs incluem metadados de criação e podem diferir byte a byte entre execuções.

## Arquitetura e regras de descoberta

- `src/services`: repositório assíncrono, descoberta, ponte AR, atividades, validação de conteúdo e hash. Componentes não chamam `unlock()`.
- Únicas portas: `discoverFromQR` valida QR capturado pela câmera; `discoverFromMarker` aceita somente o marcador selecionado com estabilidade contínua de 500 ms. URLs, navegação e Organizador não descobrem continentes.
- Persistência versionada em `exploradores:v1`, validação na leitura e fallback em memória com aviso. Progresso do navegador não é proteção contra adulteração pelo próprio usuário.
- React usa HashRouter e páginas pesadas carregadas sob demanda. `VITE_BASE_PATH` permite subpastas de GitHub Pages. As query strings de QR são convertidas para seleção sem conceder descoberta.
- A cena em `public/ar/scene.html` é estática e isolada num iframe da mesma origem; somente mensagens validadas por origem, janela, app, versão e payload atravessam a fronteira. O iframe fica numa camada alinhada ao espaço da câmera, fora da árvore desmontada pelo React; permanece no mesmo nó/posição de DOM até o ACK ou 1500 ms, evitando reinicialização por movimentação de iframe durante teardown. Streams tardios também são fechados.
- `public/ar/domain.js` é gerado de **exatamente os mesmos serviços TypeScript** de descoberta/persistência. O botão de página inteira é o plano B para Safari; grava o progresso pela mesma implementação. Não foi promovido a padrão sem teste físico.
- AR.js 3.4.7 + A-Frame 1.6.0, model-viewer 4.0.0 e jsQR 1.4.0 em `public/vendor/`; licenças locais. Barcodes 3×3 0–5, gerados por matriz binária reproduzível, não confundidos com QR.
- Modelos são filhos do marcador. Gestos só mudam escala/rotação locais; há botões equivalentes. Sem câmera/WebGL não é possível fazer uma nova descoberta; conteúdos já descobertos continuam acessíveis quando o visualizador é suportado.
- Um único mapa Natural Earth é reutilizado na coleção e nas atividades, com lista acessível alternativa. Descobertas e atividades têm contadores independentes. Qualquer atividade correta conta apenas uma vez por continente; revelar resposta não conclui.

## Geografia, fontes e limites dos dados

Adotamos o modelo escolar de **seis continentes**, com América unificada (Norte, Central, Caribe e Sul). O Saiba mais da América explica a alternativa de sete continentes.

Países são os 193 membros da ONU mais Santa Sé e Palestina, cruzados por nome/aliases explícitos com Natural Earth 5.1.2. Cada um aparece uma única vez. Territórios, dependências e áreas disputadas ficam separados da contagem. Antártida tem ficha sobre ambiente e pesquisa, sem países.

Regra de atribuição: maior parte do território, com Rússia, Turquia e Cazaquistão na Ásia, Egito na África; limite convencional do Cáucaso ao norte de Geórgia/Azerbaijão, que ficam na Ásia. Transcontinentais têm nota. Os polígonos inteiros dos países seguem esse agrupamento: a divisão didática de Europa/Ásia é administrativa e não um recorte exato nos Urais. Territórios oceânicos recebem atribuição explícita. Regiões americanas derivam de SUBREGION. Fronteiras do mapa são simplificadas e não manifestam posição sobre soberania.

Exceções exclusivamente geométricas, versionadas em `data-src/geographic-parts.json`: Guiana Francesa na forma da América e Havaí na Oceania. França e Estados Unidos continuam nas listas de Europa e América pela regra da maior parte do território. Isso evita que terras ultramarinas deformem o enquadramento da Europa. Pontos artificiais no Polo Sul que fechavam o GeoJSON são removidos antes da projeção polar, sem remover a costa.

Populações nacionais são estimativas **históricas** POP_EST/POP_YEAR, nunca chamadas de atuais. Capitais vêm de pontos ADM0CAP do Natural Earth e são omitidas quando ausentes. Valores não confirmados têm `valor:null` e `verificar:true`; a interface mostra “Dado em verificação”. Lista completa em [dados em verificação](docs/DADOS-EM-VERIFICACAO.md) e [pendências](PENDENCIAS.md).

Textos são originais e conservadores, com fontes por campo. SVGs ilustrados são autorais. Fontes, termos de uso e licenças em [SOURCES.md](SOURCES.md) e no rodapé do app.

### Pipeline dos modelos

Natural Earth 1:50m → mapa explícito `data-src/country-continent.json` → dissolução de fronteiras com TopoJSON → projeção azimutal equivalente por continente, polar na Antártida → simplificação por área efetiva (Visvalingam) → clipping esférico do d3-geo antes da triangulação para tratar antimeridiano → earcut com buracos → extrusão e bisel → GLB com weld/dedup/prune.

Ilhas inferiores a 0,0000001 esterradiano (aproximadamente 4 km²) são omitidas da malha, não da lista de países. Microestados abaixo de 0,00000025 sr usam símbolo; o JSON registra ausência de modelo. A tolerância aumenta deterministamente até atender aos limites: continentes 20.000 triângulos/400 KB; países 3.000/60 KB. Sem textura ou compressão, para evitar dependência de decodificador. Base em y=0, raio <=1; GLBs testados por parse. Inspeção da forma no celular continua pendente.

Os limiares podem ser configurados com `MODEL_MIN_ISLAND_SR` e `MODEL_MICROSTATE_SR` no ambiente do comando de geração; os padrões acima são os usados nesta entrega.

### Adicionar ou alterar conteúdo

Os seis IDs são fixos. Para corrigir um continente, edite `data-src/editorial.mjs`, registre a fonte em SOURCES.md e rode `build:data`, `build:models`, `build:markers` e as verificações. Atualize explicitamente o mapa país→continente e aliases quando a fonte mudar; não omita países para fazer o build passar. Para modelos novos, respeite os mesmos orçamentos e fonte/licença.

## Modo Organizador

Na entrega publicada, o hash já está configurado na variável do repositório. A senha aleatória foi entregue somente ao responsável, fora do código. Para trocar essa senha ou configurar um ambiente local, siga os passos abaixo.

1. Execute `npm.cmd run organizer:hash` e informe uma senha de pelo menos 8 caracteres no terminal.
2. Copie somente `pbkdf2:sha256:...` para `VITE_ORGANIZER_PASSWORD_HASH` em `.env.local` (ignorado pelo Git) ou na variável do repositório GitHub. São 210.000 iterações, sal aleatório de 16 bytes e hash de 32 bytes.
3. Reinicie o dev/build. Entre por Organizador e informe a senha. Não existe senha padrão embutida. A sessão termina em Sair ou ao deixar a área.
4. Selecione continente/ano; edite fichas, mídia, dica QR, atividade/resposta/explicação e, opcionalmente, ficha de país. Revise e salve.
5. Exporte `content-overrides.json`. Coloque em `public/content/overrides.json`; coloque imagens/áudios em `public/media/`, com licença em SOURCES.md; faça commit e deploy. Importar valida schema, fontes, respostas e caminhos antes de salvar. O build rejeita overrides inválidos e referências de mídia ausentes; em runtime, conteúdo inválido é ignorado com aviso.

Rascunhos em `exploradores:organizer:v1` são locais. **A senha é uma barreira de conveniência, não segurança**: hash, código e dados são públicos; não é autenticação nem autorização de servidor. Não inclua dados privados. Não há sincronização automática para alunos. `ContentRepository` permite outro backend no futuro, que não foi implementado aqui.

## Publicar no GitHub Pages

O destino solicitado é https://github.com/meewmew/exploradores_do_mundo . A URL planejada é https://meewmew.github.io/exploradores_do_mundo/ . O workflow `.github/workflows/pages.yml` lê automaticamente a URL e o caminho do Pages; `.env.production` contém os mesmos valores para build local.

1. O remote `origin` aponta para `meewmew/exploradores_do_mundo`. A branch padrão está configurada pelo GitHub.
2. Em Settings → Pages, escolha **GitHub Actions**. Em Settings → Secrets and variables → Actions → Variables, configure `VITE_ORGANIZER_PASSWORD_HASH` se for usar o Organizador.
3. Envie a branch `master` ou `main`. O workflow instala, faz typecheck/testes, regenera os seis PDFs para a URL do Pages, faz build com subpasta correta e publica.
4. Abra a URL retornada pelo job `deploy`; confira as seis folhas em `print/`, assets, QR e rastreamento no celular. As folhas do checkout foram regeneradas para esse destino. Para testar por IP/túnel, configure `.env.local` e regenere novamente.
5. Para build manual, defina `VITE_BASE_PATH=/NOME-DO-REPO/` e `VITE_PUBLIC_URL=https://USUARIO.github.io/NOME-DO-REPO/` no `.env.local`, depois `build:markers` e `build`.

## Verificação e limitações

Evidências e etapa atual em [PROGRESSO.md](PROGRESSO.md). Verificações automatizadas não substituem teste com câmera física. Navegador/inspeção visual em execução não estavam disponíveis no ambiente de entrega. Roteiro Android/iOS: [TESTE-NO-CELULAR](docs/TESTE-NO-CELULAR.md). Impressão: [IMPRESSAO](docs/IMPRESSAO.md).

Contraste: texto principal #5c3a45, rosa de texto escurecido para #9d3156; #ff75a0 só como fundo com texto #472b35. Alvos >=44 px, foco visível, texto >=16 px, redução de movimento e alternativas a gestos. A ausência de voz pt-BR esconde Ouvir, exceto quando há áudio local.
