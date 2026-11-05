# Piloto da África: relevo, lugares e toque

**Teste no celular — atualização de 05/11/2026:** testado no celular e funcionou. Esta confirmação atualiza as pendências de funcionamento no aparelho registradas nas etapas anteriores. Avaliação com crianças, leitor de tela, medições de desempenho e casos específicos sem resultado individual informado continuam separados do teste geral. Registro em [TESTE-NO-CELULAR.md](TESTE-NO-CELULAR.md).

Pedido confirmado em 2026-11-04: relevo e três lugares marcados na realidade aumentada e no visualizador sem câmera. A África foi o piloto inicial; por pedido do responsável, o mesmo sistema foi expandido aos seis continentes antes da validação em telefone. O modelo extrudado anterior permanece disponível como alternativa leve.

## Direção e decisões

Preservar o atlas lilás e os fluxos existentes. O modelo é o elemento principal; tocar, arrastar e fazer pinça deve funcionar diretamente na superfície. Informação complementar e controles alternativos podem ser abertos sem cobrir permanentemente o mapa. Seguir frontend-design, apple-design, emil-design-eng e mobile-native: resposta direta, composição contida, controles com nomes claros, alvo mínimo de 44 px e alternativa ao gesto.

| Before | After | Why |
| --- | --- | --- |
| Contorno extrudado plano da África | Segundo GLB com elevações de DEM real | Mostrar o relevo sem inventar montanhas |
| Sem lugares marcados | Três pins nas coordenadas projetadas do modelo e lista com nomes | Relacionar lugares conhecidos à posição geográfica |
| Painel grande sobre o modelo | Ficha recolhida e área de gesto livre | Manter o mapa visível e tocável |
| Gestos interrompidos ao mudar o número de dedos | Captura e continuidade dos ponteiros | Arrastar, ampliar e girar sem saltos |
| Botões de zoom e giro em destaque | Gestos principais; botões em controles alternativos | Atender ao pedido e preservar acessibilidade |

threejs-assets orienta a carga local, estados de erro e liberação; threejs-spatial-data separa WGS84 de coordenadas locais com transformação documentada; threejs-performance orienta orçamento e ausência de trabalho/alocação desnecessária a cada quadro. Não é aceitável afirmar ganho de FPS sem medir em telefone.

## Dados e limites

Pontos escolhidos editorialmente: Pirâmides de Gizé, Cataratas Vitória e Kilimanjaro. Não é um ranking de visitação. Evidências, precisão e licenças em `AFRICA-PONTOS-TURISTICOS.md` e `SOURCES.md`; nenhum dado estimado de memória.

O DEM e a malha de relevo são documentados em `AFRICA-DEM.md`. Alturas ampliadas devem ser explicadas na tela. A cena continua rastreando um marcador físico; os gestos alteram somente a transformação local do modelo. A URL não desbloqueia o continente.

## Aceitação

Verificar TypeScript, testes, build e `check:budget`. Revisar visualmente a geometria, pins e controles no navegador; isso não valida câmera/RA. Em telefone, conferir marcador encontrado/perdido, pinça e arraste, três pontos alinhados, seleção por toque/lista, movimento reduzido e cinco ciclos de câmera. A expansão aos seis continentes já foi feita; o funcionamento no celular foi testado e confirmado em 05/11/2026; não foram informados resultados individuais por continente.

## Verificação executada

Passaram `npm.cmd run typecheck`, 48 testes, `npm.cmd run build`, `npm.cmd run check:budget` (184 arquivos), sintaxe da cena e diff. O GLB piloto tem 9.731 triângulos, 291.640 bytes, dois materiais e zero texturas; os GLBs de contorno anteriores permaneceram iguais. Os pontos são vértices da superfície e os testes conferem a transformação reversível WGS84/projeção/local.

Revisão em navegador a 320/390 px e desktop 1280 px: renderização real do visualizador sem câmera, três pins, seleção de descrições e rotação por arraste sobre o modelo; os pins acompanharam a rotação. Nas larguras medidas, scrollWidth foi igual a clientWidth. Na tela RA, hit-test no centro da área de gesto retornou o iframe, com overlays em pointer-events:none e botões alternativos recolhidos. Isso comprova composição e roteamento de interface, sem executar rastreamento físico nem gesto multitouch em aparelho.

A revisão inicial mostrou relevo pouco legível e cores esmaecidas. A malha passou de exagero vertical80× para160×, com o fator documentado e aviso na tela; a paleta sRGB foi convertida para os valores lineares esperados por COLOR_0 do glTF. O enquadramento e o espaço do visualizador foram ajustados. São escolhas de leitura visual, sem alterar as alturas do DEM de origem.

Builds descartáveis de QA foram substituídos pelo build normal. Testado no celular e funcionou, conforme confirmação recebida em 05/11/2026. Texto a 200%, leitor de tela, medições de desempenho e resultados individuais de pinça, perda/retorno e pins não foram informados. O roteiro físico foi ampliado em `TESTE-NO-CELULAR.md`.
