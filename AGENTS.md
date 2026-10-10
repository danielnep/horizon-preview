# Horizon Preview

Este repositório contém a aplicação de demonstração comercial da Horizon. O endereço de origem confirmado pelo proprietário é `https://horizon-preview.danielxavier.chatgpt.site/`, incluindo a tela `#personalizada`. O repositório correspondente é `danielnep/horizon-preview`.

Antes de uma transferência ou edição, identifique o projeto pelo endereço informado e confirme seu repositório de destino. Use essa correspondência como referência; não deduza o projeto apenas pela palavra Horizon.

O código completo da aplicação está em `dist/`. Preserve esse diretório no Git; ele contém os arquivos HTML, CSS, JavaScript, imagens e integrações usados na publicação. O projeto é estático e não precisa de compilação.

Em pedidos de organização ou transferência do código, preserve os arquivos e o comportamento da aplicação existente. Alterações no visual ou nas funcionalidades dependem do escopo solicitado.

Para mudanças no código, utilize os testes existentes (`npm test`) e a verificação de sintaxe (`npm run check`) conforme a alteração. Para documentação, confira caminhos, comandos e a correspondência entre a fonte e o repositório.

## Publicação no GitHub Pages

1. Código transferido ao repositório não comprova que a página publicada abre o aplicativo.
2. Para a publicação de main em /(root), mantenha index.html e .nojekyll na raiz. Gere a entrada com npm run pages depois de alterar dist/index.html; não use o README como página inicial.
3. Execute npm run check para conferir a entrada gerada e os módulos. Confira todos os caminhos de estilos, scripts e imagens, preservando as rotas, a seleção e os parâmetros de indicação.
4. Depois do push, confirme a publicação e a página pública antes de declarar que o aplicativo está no ar. Se a conferência pública estiver indisponível, informe a limitação com precisão.
