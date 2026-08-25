# Linktree estático com Google Sheets

Página de links sem backend, feita com HTML, CSS e JavaScript puro para hospedagem no GitHub Pages. As configurações e os links são lidos de duas abas públicas de uma planilha Google; assim, o conteúdo pode mudar sem novo deploy.

## Arquitetura e arquivos

O navegador busca as abas `config` e `links` em CSV, valida os dados e monta a página com APIs seguras do DOM. Não há credenciais, API key, banco de dados ou processo de build.

- `index.html`: estrutura semântica e metadata estática;
- `css/styles.css`: layout mobile-first;
- `js/config.js`: URLs públicas das planilhas;
- `js/csv.js`: parser CSV;
- `js/validators.js`: validação e normalização;
- `js/app.js`: carregamento, estados e renderização;
- `tests/`: testes nativos do Node.

## Configurar o Google Sheets

Crie uma planilha com duas abas. Não coloque senhas, dados pessoais confidenciais, tokens ou qualquer segredo: a planilha publicada é pública e somente deve conter o conteúdo exibido no site.

Na aba `config`, use exatamente estas colunas:

```csv
key,value
title,Empresa Exemplo
description,Nossos principais links
avatar,https://example.com/avatar.jpg
footer,© Empresa Exemplo
theme,default
```

Na aba `links`, use exatamente estas colunas:

```csv
order,title,url,icon,enabled,highlight
1,Nosso site,https://example.com,globe,TRUE,FALSE
2,WhatsApp,https://wa.me/5511999999999,whatsapp,TRUE,TRUE
3,Instagram,https://instagram.com/exemplo,instagram,TRUE,FALSE
```

No Google Sheets, acesse **Arquivo → Compartilhar → Publicar na Web**. Selecione uma aba por vez, escolha **Valores separados por vírgulas (.csv)** e publique. Repita para as abas `config` e `links`.

Copie as duas URLs geradas para [`js/config.js`](./js/config.js):

```js
export const APP_CONFIG = {
  configSheetUrl: 'URL_CSV_DA_ABA_CONFIG',
  linksSheetUrl: 'URL_CSV_DA_ABA_LINKS',
};
```

Uma URL publicada costuma se parecer com `https://docs.google.com/spreadsheets/d/e/.../pub?gid=...&single=true&output=csv`. Use a URL final de cada aba, não a URL normal de edição da planilha.

## Como alterar os links (sem conhecimento técnico)

1. Abra a planilha e entre na aba `links`.
2. Para adicionar um link, crie uma linha e preencha `order`, `title`, `url`, `icon`, `enabled` e `highlight`.
3. Use `TRUE` em `enabled` para mostrar o link e `FALSE` para escondê-lo sem apagar.
4. Altere `order` para mudar a posição: números menores aparecem primeiro.
5. Use `TRUE` em `highlight` para marcar o botão como destaque.
6. Não altere os nomes das colunas nem as abas `config` e `links`.

Ícones reconhecidos: `instagram`, `whatsapp`, `youtube`, `github`, `linkedin`, `globe` e `email`. Um ícone genérico aparece para qualquer outro valor. Após salvar a planilha, atualize o site; o Google pode levar alguns instantes para propagar a mudança.

Para mudar nome, descrição, avatar ou rodapé, altere apenas o campo `value` correspondente na aba `config`. O avatar precisa ser uma URL pública iniciada por `https://` ou `http://`.

## Executar localmente

Abrir `index.html` como `file://` pode bloquear as requisições. Na raiz do projeto, execute:

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080`. Para rodar os testes, use Node.js moderno:

```bash
npm test
```

## Publicar no GitHub Pages

1. Envie os arquivos para a branch `main` de um repositório GitHub.
2. No repositório, acesse **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch `main`, a pasta `/ (root)` e salve.
5. Abra a URL mostrada pelo GitHub após a publicação.

Os caminhos são relativos e o arquivo `.nojekyll` está incluído, portanto o site funciona também em `usuario.github.io/nome-do-repositorio/`.

## Diagnóstico

Se aparecer “Não foi possível carregar os links”, abra as ferramentas do desenvolvedor do navegador e consulte o Console e a aba Network. Confirme que:

- as duas URLs em `js/config.js` foram substituídas;
- cada URL abre ou baixa CSV sem pedir login;
- as abas foram publicadas, e não apenas compartilhadas;
- os cabeçalhos estão escritos corretamente;
- o endereço não é a URL de edição da planilha.

Linhas desabilitadas ou com título/URL inválidos são ignoradas e geram aviso no console sem impedir os demais links. Protocolos perigosos como `javascript:`, `data:` e `file:` são rejeitados.

## Metadata e compartilhamento

Título, descrição e imagem Open Graph estão estáticos no HTML. Embora o conteúdo visível seja atualizado pelo JavaScript, alguns aplicativos e crawlers não executam JavaScript ao criar prévias. Ajuste a metadata diretamente em `index.html` se precisar personalizar essas prévias.

## Validação após publicar

Altere um título na planilha e atualize o site sem fazer novo deploy. Depois crie um link, altere `enabled` para `FALSE` e mude `order`, confirmando que cada mudança aparece na página. Isso valida o fluxo completo da planilha como CMS simples.
