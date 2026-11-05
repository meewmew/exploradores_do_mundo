# Exploradores do Mundo

Jogo educativo para conhecer os seis continentes por mapas, fichas, atividades e modelos 3D. A realidade aumentada usa QR Codes e marcadores impressos. O progresso fica salvo no navegador; não há cadastro ou GPS.\n\n**Acesse:** [Exploradores do Mundo](https://meewmew.github.io/exploradores_do_mundo/)

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

**Teste físico:** câmera, leitura de QR impresso e reconhecimento/alinhamento da realidade aumentada em celulares ainda não estão validados. Consulte [as instruções de impressão](docs/IMPRESSAO.md) antes da demonstração e registre aparelho, navegador e resultado físico.

```bash
npm run typecheck
npm test
npm run check:budget
```

## Tecnologias

React, TypeScript e Vite; A-Frame e AR.js para realidade aumentada; jsQR para leitura de QR Code; Three.js/model-viewer para modelos 3D; Zod para validação dos dados.

## Documentação

- [Fontes e licenças](SOURCES.md)
- [Especificação do projeto](SPEC.md)
- [Relatório do projeto](docs/RELATORIO-PROJETO.md)


