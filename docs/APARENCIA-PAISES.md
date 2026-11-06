# Aparência 3D dos países — 06/11/2026

Alteração local, sem publicação. O acabamento criado para a ficha do Brasil agora é usado pelas fichas sem câmera dos 177 países que têm GLB. Os 18 países sem geometria continuam com o símbolo e a ficha educativa existentes; não foi criada malha para eles.

O acabamento usa materiais foscos, cores de terreno já gravadas nos modelos, rios discretos quando presentes, laterais em tom neutro e o ambiente HDR de luz lateral suave. O enquadramento inicial passou de 112% para 105% do raio automático do modelo, deixando a forma maior sem encostar no limite do visor. Um fundo em degradê azul-claro para verde-claro dá unidade à área de visualização e usa os tokens da interface. Os pins, os dados, as malhas e as coordenadas não mudaram.

O visualizador aplica o perfil somente a caminhos `models/countries/XXX.glb` vindos da ficha de país. Os materiais originais são restaurados quando a ficha é desmontada, preservando o cache do `model-viewer`. As fichas de continente, a cena e o marcador da RA continuam com a apresentação atual.

## Verificação

- O código foi revisado para confirmar que as 177 fichas com modelo usam o perfil compartilhado e que países sem GLB mantêm a alternativa existente.
- `npm.cmd run typecheck` e `npm.cmd run build` passaram. O build validou conteúdo, fontes e os arquivos dos seis continentes.
- Não foram adicionados nem executados testes automatizados nesta alteração.
- Revisão em Chrome local: Brasil, Nepal, Andorra e Fiji em 1280 px; Brasil também em 390 e 320 px. Os quatro modelos carregaram com um ou dois pins. A 320 px, a largura do documento foi 320 px, sem rolagem horizontal. Capturas em `.cache/country-appearance-review-20261106/`; perfil do navegador isolado, sem alterar o progresso do usuário.
- Texto ampliado a 200%, navegação por teclado e teste em aparelho físico continuam pendentes. Também não foram medidos FPS ou memória.
- Nenhum celular foi usado para validar a aparência ou a RA. Não foram medidos FPS ou memória.
