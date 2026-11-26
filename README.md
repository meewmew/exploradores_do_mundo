# Explorador de Mundos

Site educativo para explorar os seis continentes e seus países com mapas 3D, realidade aumentada e atividades. [Abrir o Explorador de Mundos](https://meewmew.github.io/exploradores_do_mundo/)

## Realidade aumentada

Na ficha de um continente ou país, toque em **Ver em RA**. Em um navegador com rastreamento WebXR, o mapa aparece à sua frente assim que o modelo carregar e a câmera reconhecer a posição do aparelho. Ele permanece naquele ponto quando você se move. **Trazer à frente** reposiciona o mapa diante da câmera.

Para escolher o lugar, toque em **Escolher posição**, aponte para uma mesa ou para o chão e aguarde o círculo. Toque em **Colocar aqui** para fixar o mapa nesse ponto.

Em **Ajustar mapa**, use os botões para mover, ampliar, reduzir ou girar. Também é possível arrastar com um dedo para mover e usar dois dedos para mudar a escala e o ângulo.

No Android, o rastreamento espacial requer um navegador com WebXR e um aparelho compatível com ARCore. No iPhone compatível, **Preparar mapa para o Quick Look** gera o modelo para abrir no visualizador da Apple, que pode pedir que você enquadre uma superfície para colocá-lo. [Requisitos do WebXR no Android](https://developers.google.com/ar/develop/webxr/requirements) · [Quick Look](https://developer.apple.com/augmented-reality/quick-look/)

## Folhas e QR codes

Use os mesmos QR codes das folhas impressas para abrir as opções de RA do continente correspondente. Se o navegador oferecer WebXR, toque em **Abrir RA no ambiente** para fixar o mapa à sua frente ou escolher uma superfície. **Usar marcador da folha** abre o modo que acompanha o quadrado impresso. [Baixar as folhas dos seis continentes em PDF](https://meewmew.github.io/exploradores_do_mundo/print/todos-continentes-A4.pdf)

## Atividades

O 3º ano tem uma pergunta por continente. As perguntas apresentam situações de leitura, e as respostas podem ser encontradas na ficha do continente. O perfil Geral também abre essas atividades.

## Publicação

O repositório contém os arquivos do site estático. O GitHub Pages publica a partir da branch `main`. Para testar localmente, sirva a pasta por HTTP em `localhost`. Para usar a câmera no celular, abra o endereço publicado por HTTPS.
