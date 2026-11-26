# Explorador de Mundos

Site educativo para explorar os seis continentes e seus países com mapas 3D, realidade aumentada e atividades. [Abrir o Explorador de Mundos](https://meewmew.github.io/exploradores_do_mundo/)

## Realidade aumentada

Na ficha de um continente ou país, toque em **Ver em RA**. Em um navegador com WebXR Hit Test, mova o celular devagar e aponte para o chão, uma mesa ou uma parede à sua frente. O mapa aparece no primeiro ponto válido entre 35 cm e 2 m de distância horizontal e permanece fixo quando você se move. **Buscar outra superfície** reinicia a busca automática.

Para escolher o lugar, toque em **Escolher posição**, aponte para uma mesa, o chão ou uma parede e aguarde o círculo. Toque em **Colocar aqui** para fixar o mapa nesse ponto.

Em **Ajustar mapa**, use os botões para mover, ampliar, reduzir ou girar. Também é possível arrastar com um dedo para mover e usar dois dedos para mudar a escala e o ângulo.

No Android, a colocação automática requer um navegador com WebXR Hit Test e um aparelho compatível com ARCore. No iPhone compatível, **Ver em RA** abre o Quick Look, que pode pedir que você enquadre uma superfície para colocar o mapa. [Requisitos do WebXR no Android](https://developers.google.com/ar/develop/webxr/requirements) · [Quick Look](https://developer.apple.com/augmented-reality/quick-look/)

## Folhas e QR codes

Use os mesmos QR codes das folhas impressas para descobrir o continente e abrir sua ficha. Na ficha, **Ver em RA** abre o WebXR ou o Quick Look, conforme a compatibilidade do navegador. **Usar marcador da folha** abre a câmera para reconhecer o quadrado preto impresso ao lado do QR. [Baixar as folhas dos seis continentes em PDF](https://meewmew.github.io/exploradores_do_mundo/print/todos-continentes-A4.pdf)

## Atividades

O 3º ano tem uma pergunta por continente. As perguntas apresentam situações de leitura, e as respostas podem ser encontradas na ficha do continente. O perfil Geral também abre essas atividades.

## Publicação

O repositório contém os arquivos do site estático. O GitHub Pages publica a partir da branch `main`. Para testar localmente, sirva a pasta por HTTP em `localhost`. Para usar a câmera no celular, abra o endereço publicado por HTTPS.
