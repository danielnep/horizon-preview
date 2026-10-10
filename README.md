# Horizon Preview

Aplicativo comercial mobile-first da Horizon. Uma vitrine de ferramentas combináveis, com exemplos individuais e uma operação montada a partir da seleção do visitante.

**Sua empresa, seu sistema. Escolha as ferramentas que precisa. Nós conectamos e personalizamos tudo para você.**

## Experiência do cliente

- Oito ferramentas: planilhas, serviços, checklists, agenda, etapas e aprovações, ocorrências, indicadores e comprovantes.
- `Experimentar` abre a ferramenta para uso livre. `Ver demonstração`, logo abaixo, abre um exemplo guiado que usa os mesmos dados e ações do aplicativo.
- `Montar solução` abre um aplicativo utilizável somente com as ferramentas escolhidas. A demonstração guiada mostra cada mudança nos formulários, listas, etapas e planilha.
- Serviços, conferências, compromissos, aprovações, ocorrências e comprovantes atualizam a planilha quando ela faz parte da combinação. Indicadores são calculados a partir dos registros.
- Checklists e comprovantes funcionam individualmente, sem exigir a seleção de serviços.
- O cliente pode baixar a planilha, os relatórios e os comprovantes.
- Os exemplos simulados de IA mostram atendimento, organização de texto de documentos e sugestões de ferramentas. São regras locais; nenhum modelo de IA ou OCR de imagens está conectado.
- `Criar ferramenta personalizada` coleta nome, empresa, cargo, ferramentas e necessidade. Prepara a mensagem para **(37) 99943-7884** e deixa o visitante confirmar o envio no WhatsApp.
- Links compartilhados preservam a seleção e a indicação do parceiro. A incorporação usa `?embed=1`.

## Marca

Nome público: **Horizon Preview**. A identidade obrigatória está em `dist/horizon-theme.css`: branco, azul celeste tecnológico mais forte, cinzas e detalhes azul-prateados; componentes de cantos discretos, navegação clara e textos curtos para o cliente. Reutilize esses tokens e componentes nos futuros aplicativos da Horizon.

O nome público é Horizon Preview; o repositório e o endereço existentes continuam `horizon-preview`, preservando os links já utilizados. O site institucional `danielnep/horizon-site` é um projeto separado.

## Executar

Este repositório corresponde ao site **https://horizon-preview.danielxavier.chatgpt.site/**, versão publicada 6, fonte `17767477dec60f7778f047a21bd7191e26363488`. Os arquivos em `dist/` são os mesmos da publicação original.

A raiz contém `index.html` e `.nojekyll` para abrir o aplicativo quando o GitHub Pages publica `main` a partir de `/(root)`. Depois de editar `dist/index.html`, execute `npm run pages` para atualizar essa entrada, preservando as rotas como `#personalizada` e os parâmetros de seleção e indicação. A cópia do código não altera as configurações de hospedagem do repositório.

Sirva `dist/` por HTTP/HTTPS em qualquer hospedagem estática. Não exige instalação ou chave de API para as demonstrações. O aplicativo usa módulos JavaScript. Os dados fictícios permanecem neste navegador; cada combinação tem armazenamento próprio. O formulário de contato permanece na memória até abrir a mensagem.

`dist/core/tools.js` define o catálogo; `store.js` contém regras e dados; `demonstration.js` executa o guia; `assistants.js` contém os simuladores; `dist/app.js` compõe as telas e eventos.

O número padrão fica em `dist/config.js`. A demonstração não grava em planilhas externas. O adaptador opcional de Google Sheets e o Apps Script permanecem em `dist/integrations/`; a documentação de implantação está em `docs/integracao-planilha.html`, fora da navegação do cliente.

## Verificar

`npm test` valida domínio, interface por eventos, downloads, WhatsApp, adaptador e as **255 combinações** não vazias das oito ferramentas. `npm run check` verifica a sintaxe dos módulos.

Esses testes executam um DOM simulado, sem inspecionar pixels ou gestos em um celular real. A revisão visual no navegador móvel permanece pendente no ambiente de execução atual.

## Incorporar

Use o endereço publicado com `?embed=1` em um iframe. A mensagem `horizon-preview:height` informa somente a altura; o site que recebe deve validar `event.origin` e `event.source`. Links de indicação usam `?parceiro=IDENTIFICACAO`; links de seleção usam `?f=checklists,servicos,planilhas,indicadores#solucao`.
