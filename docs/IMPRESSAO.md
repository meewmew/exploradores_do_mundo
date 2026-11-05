# Impressão — seis folhas A4

## Gerar para o endereço certo
1. Configure `VITE_PUBLIC_URL` no `.env.local` com o endereço HTTPS completo e `/` no final. O QR exige a mesma origem e caminho do app. Se for usar o IP da rede ou um túnel, gere para esse endereço, não para localhost.
2. Execute `npm.cmd run build:markers`.
3. As folhas ficam em `public/print/`: `africa-A4.pdf`, `america-A4.pdf`, `antartida-A4.pdf`, `asia-A4.pdf`, `europa-A4.pdf`, `oceania-A4.pdf`.
4. O deploy GitHub Actions regenera as folhas para o endereço público. Baixe-as de `https://SEU-ENDERECO/print/ID-A4.pdf`.

## Configurações
- Papel A4 (210×297 mm), branco e fosco. Evite plastificação brilhante e reflexos.
- Tamanho real / 100%; desative “ajustar à página”. Meça o quadrado preto: **9 cm** de lado (mínimo aceito 8 cm).
- Preto sólido, boa resolução (arquivos PNG 1200 px e SVG vetorial disponíveis em `public/markers/`). Não recorte bordas, acrescente desenhos ou cubra o miolo do marcador.
- Mantenha a margem branca ao redor do quadrado. QR e marcador ficam separados, lado a lado, com funções diferentes.
- Fixe a folha plana em mesa ou parede, sem dobras. Use iluminação difusa e uniforme, sem sombras sobre o quadrado.

## Conferir antes de distribuir
- Abra a URL escrita no rodapé. Deve ser o app que será usado pela turma.
- No app, selecione o continente da folha e use **Escanear QR code**. QR de outra folha deve ser recusado sem aumentar o contador.
- Para RA, enquadre o marcador preto inteiro. Comece a 25–50 cm e ajuste conforme o aparelho; essa distância é orientação inicial, não medida de desempenho validada.
- Mova e gire o papel: o modelo deve acompanhar sua posição e orientação. Ao cobrir o marcador, o modelo deve desaparecer.
- Execute o checklist de Android/iOS antes de imprimir em quantidade. **Reconhecimento em papel ainda não validado fisicamente.**

| Continente | Barcode 3×3 | QR | PDF |
|---|---|---|---|
| África | 0 | africa-qr.svg/png | africa-A4.pdf |
| América | 1 | america-qr.svg/png | america-A4.pdf |
| Antártida | 2 | antartida-qr.svg/png | antartida-A4.pdf |
| Ásia | 3 | asia-qr.svg/png | asia-A4.pdf |
| Europa | 4 | europa-qr.svg/png | europa-A4.pdf |
| Oceania | 5 | oceania-qr.svg/png | oceania-A4.pdf |

O QR serve para abrir o site/descobrir pelo leitor interno; o barcode é lido pelo ARToolKit para estimar a pose 3D. Não são intercambiáveis.
