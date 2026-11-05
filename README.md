# Exploradores do Mundo

Jogo educativo para conhecer os seis continentes por mapas, fichas, atividades e modelos 3D. A realidade aumentada usa QR Codes e marcadores impressos. O progresso fica salvo no navegador; não há cadastro ou GPS.

**Acesse:** [Exploradores do Mundo](https://meewmew.github.io/exploradores_do_mundo/).

## Executar

Requisitos: Node.js 22.12 ou superior e npm.

```bash
npm install
npm run dev
```

Abra o endereço HTTPS mostrado pelo Vite. Para preparar os arquivos de publicação:

```bash
npm run build
```

## Testes

**Validações automatizadas:** typecheck, testes do Vitest, build e verificações de contraste e orçamento dos modelos foram executados em etapas recentes do projeto.

**Teste físico validado:** câmera, leitura de QR impresso e reconhecimento/alinhamento da realidade aumentada foram testados em celulares pelo grupo.

Funcionamento no celular confirmado pelo responsável em 05/11/2026. Registro e roteiro para repetir os testes em [Teste no celular](docs/TESTE-NO-CELULAR.md).

```bash
npm run typecheck
npm test
npm run check:budget
```

## Tecnologias

React, TypeScript e Vite; A-Frame e AR.js para realidade aumentada; jsQR para leitura de QR Code; Three.js/model-viewer para modelos 3D; Zod para validação dos dados.

## Android e iPhone

Use Chrome atualizado no Android ou Safari atualizado no iPhone/iPad, por HTTPS e com acesso à câmera. A experiência de RA também depende de gráficos 3D disponíveis no aparelho. Há uma opção de abrir a câmera em página inteira quando o navegador tem limitações dentro do app.

O código do aplicativo é compilado para a sintaxe de Chrome 100 e Safari 15.4, com alternativas para navegadores sem as unidades de altura dinâmica da tela. Isso amplia a compatibilidade do código; não é uma certificação de câmera, WebGL ou das bibliotecas 3D em todas essas versões. O `model-viewer` recomenda as duas versões principais mais recentes dos navegadores ([documentação oficial](https://modelviewer.dev/)).

Na revisão de 05/11/2026, a mira e a câmera em página inteira foram conferidas em sete tamanhos de tela, incluindo paisagem, com vídeo sintético no Chrome. Não foram executados Safari real nem Android físico nesta revisão. O relato anterior de funcionamento em celular continua registrado acima; aparelhos e versões individuais precisam ser registrados no roteiro de teste para confirmar a cobertura.

## Documentação

- [Fontes e licenças](SOURCES.md)
- [Especificação do projeto](SPEC.md)
- [Relatório do projeto](docs/RELATORIO-PROJETO.md)
