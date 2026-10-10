# Código do Horizon Preview

Aplicação de origem: [Horizon Preview](https://horizon-preview.danielxavier.chatgpt.site/). Tela personalizada: [#personalizada](https://horizon-preview.danielxavier.chatgpt.site/#personalizada).

Repositório: [danielnep/horizon-preview](https://github.com/danielnep/horizon-preview).

## Arquivos da aplicação

| Arquivo ou diretório | Responsabilidade |
| --- | --- |
| `dist/index.html` | Documento inicial e carregamento dos estilos e módulos. |
| `dist/app.js` | Composição das telas, navegação e eventos. |
| `dist/config.js` | Configurações públicas, incluindo o contato da Horizon. |
| `dist/core/tools.js` | Catálogo das ferramentas disponíveis. |
| `dist/core/store.js` | Regras, exemplos e armazenamento local. |
| `dist/core/demonstration.js` | Demonstração guiada da operação combinada. |
| `dist/core/assistants.js` | Simuladores locais de atendimento, documentos e sugestões. |
| `dist/styles.css` | Estilos da interface. |
| `dist/horizon-theme.css` | Identidade visual Horizon. |
| `dist/assets/` | Imagens utilizadas pela aplicação. |
| `dist/integrations/` | Integração opcional com Google Sheets e Apps Script. |
| `docs/integracao-planilha.html` | Instruções técnicas da integração opcional. |
| `tests/` | Verificações do domínio, demonstração, interface e integração. |

## Executar

Sirva `dist/` por HTTP. Os módulos JavaScript precisam de um servidor estático.

```bash
python3 -m http.server 8000 --directory dist
```

Abra `http://localhost:8000/`. Para a tela solicitada, use `http://localhost:8000/#personalizada`.

## Hospedar

Publique o conteúdo de `dist/` como raiz do site. Inclua todas as subpastas para preservar imagens, módulos e integrações. Não há instalação de dependências nem etapa de compilação para servir a aplicação.

O arquivo `.openai/hosting.json` identifica a publicação existente em Sites e declara `dist/` como diretório estático. Mantenha o identificador dessa publicação ao trabalhar no mesmo site.

## Verificar mudanças

Os comandos existentes no `package.json` usam Node.js:

```bash
npm test
npm run check
```

Uma organização do repositório deve preservar os bytes dos arquivos de `dist/`. A documentação e os testes complementam o código publicado.
