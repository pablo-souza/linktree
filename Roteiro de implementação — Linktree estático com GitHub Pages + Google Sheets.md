# Objetivo

Criar uma aplicação web semelhante ao Linktree, hospedada no **GitHub Pages**, utilizando apenas:

- HTML;
- CSS;
- JavaScript puro;
- Google Sheets como fonte de dados.

O projeto não deve possuir backend próprio e não deve exigir banco de dados.

A principal finalidade da utilização do Google Sheets é permitir que pessoas sem conhecimento de programação possam alterar:

- título da página;
- descrição;
- imagem/avatar;
- links;
- ordem dos links;
- visibilidade dos links;
- ícones;
- destaques.

A atualização dos dados da planilha não deve exigir novo deploy do site.

---

# Princípios técnicos

A implementação deve priorizar:

1. simplicidade;
2. baixa manutenção;
3. ausência de dependências desnecessárias;
4. funcionamento integral no GitHub Pages;
5. layout mobile-first;
6. boa acessibilidade;
7. segurança ao trabalhar com URLs vindas da planilha;
8. tolerância a erros de preenchimento da planilha.

Não utilizar inicialmente:

- React;
- Vue;
- Angular;
- Next.js;
- Node.js no runtime;
- Firebase;
- Supabase;
- banco de dados;
- Google Sheets API autenticada;
- OAuth;
- API keys.

Node.js poderá ser utilizado apenas para testes locais caso seja útil.

---

# Arquitetura

A arquitetura esperada é:

```text
Google Sheets
     │
     │ planilha publicada
     │ CSV
     ▼
JavaScript
     │
     ├── carregar configurações
     ├── carregar links
     ├── validar dados
     ├── ordenar links
     └── renderizar página
     │
     ▼
HTML + CSS
     │
     ▼
GitHub Pages
```

A página deve buscar os dados da planilha quando for carregada pelo navegador.

Nenhuma informação dinâmica deve precisar estar hardcoded no HTML, exceto configurações técnicas como URLs das fontes de dados.

---

# Estrutura do projeto

Criar inicialmente a seguinte estrutura:

```text
/
├── index.html
├── .nojekyll
│
├── css/
│   └── styles.css
│
├── js/
│   ├── config.js
│   ├── app.js
│   ├── csv.js
│   └── validators.js
│
├── assets/
│   └── default-avatar.svg
│
├── tests/
│   ├── csv.test.js
│   └── validators.test.js
│
└── README.md
```

Responsabilidades:

```text
config.js
    configurações técnicas da aplicação

app.js
    carregamento dos dados
    normalização
    renderização
    estados da interface

csv.js
    parser CSV

validators.js
    validações e sanitização

styles.css
    apresentação

index.html
    estrutura semântica básica
```

Evitar criar arquivos ou abstrações sem necessidade concreta.

---

# Fase 1 — Criar a estrutura HTML inicial

Criar o `index.html`.

A página deverá conter semanticamente:

```text
main
 ├── profile
 │    ├── avatar
 │    ├── título
 │    └── descrição
 │
 ├── links
 │    └── lista dinâmica
 │
 └── footer
```

Os links não devem ser escritos diretamente no HTML.

Criar containers com IDs ou atributos apropriados para renderização via JavaScript.

Exemplo conceitual:

```html
<main>
    <section id="profile">
        ...
    </section>

    <section id="links">
        ...
    </section>
</main>
```

Não utilizar `innerHTML` com dados vindos da planilha.

Preferir:

```javascript
document.createElement(...)
element.textContent = ...
element.setAttribute(...)
```

---

# Fase 2 — Criar a planilha

A aplicação deverá trabalhar com duas abas:

```text
config
links
```

## Aba `config`

Estrutura:

| key | value |
|---|---|
| title | Nome da pessoa ou empresa |
| description | Pequena descrição |
| avatar | https://... |
| footer | Texto opcional |
| theme | default |

Exemplo:

```text
key            value

title          Empresa Exemplo
description    Nossos principais links
avatar         https://example.com/avatar.jpg
footer         © Empresa Exemplo
theme          default
```

A implementação deve ignorar chaves desconhecidas.

---

# Fase 3 — Criar a aba `links`

Estrutura:

| order | title | url | icon | enabled | highlight |
|---:|---|---|---|---|---|
| 1 | Nosso site | https://example.com | globe | TRUE | FALSE |
| 2 | WhatsApp | https://wa.me/... | whatsapp | TRUE | TRUE |
| 3 | Instagram | https://instagram.com/... | instagram | TRUE | FALSE |

Campos:

### `order`

Número usado para ordenar os botões.

Exemplo:

```text
1
2
3
```

Linhas com ordem inválida devem ser colocadas depois das linhas com ordem válida.

---

### `title`

Texto apresentado no botão.

Obrigatório.

Caso esteja vazio, ignorar a linha.

---

### `url`

URL que será aberta.

Obrigatório.

Validar protocolo.

Aceitar inicialmente:

```text
https:
http:
mailto:
tel:
```

Rejeitar explicitamente:

```text
javascript:
data:
file:
```

e qualquer protocolo não reconhecido.

Uma linha contendo URL inválida não deve quebrar o restante da página.

Apenas ignorá-la e gerar um aviso no console.

---

### `icon`

Identificador opcional de ícone.

Exemplos:

```text
instagram
whatsapp
youtube
github
linkedin
globe
email
```

Caso não exista ícone reconhecido, utilizar um ícone genérico de link.

Não permitir que esse campo injete HTML.

---

### `enabled`

Aceitar como verdadeiro:

```text
true
TRUE
1
sim
yes
```

Aceitar como falso:

```text
false
FALSE
0
não
nao
no
```

Links falsos devem ser removidos antes da renderização.

---

### `highlight`

Define se determinado link possui destaque visual.

Não deve alterar a funcionalidade do link.

---

# Fase 4 — Publicação do Google Sheets

Documentar no README o procedimento manual para configurar a planilha.

Fluxo esperado:

```text
Google Sheets

Arquivo
 ↓
Compartilhar
 ↓
Publicar na Web
```

Publicar somente as abas necessárias sempre que possível.

Obter uma URL CSV para cada aba.

Teremos:

```text
CONFIG_SHEET_URL
LINKS_SHEET_URL
```

Armazenar essas URLs em:

```javascript
js/config.js
```

Exemplo:

```javascript
export const APP_CONFIG = {
    configSheetUrl: 'URL_PUBLICA_CONFIG',
    linksSheetUrl: 'URL_PUBLICA_LINKS',
};
```

Não adicionar credenciais.

Não adicionar:

```text
senha
token
API key
OAuth token
service account
```

A planilha será considerada uma fonte de dados pública somente para leitura.

Nunca armazenar informações confidenciais nela.

---

# Fase 5 — Implementar carregamento

Criar função reutilizável:

```javascript
async function fetchSheet(url)
```

Responsabilidades:

1. efetuar `fetch`;
2. verificar `response.ok`;
3. obter conteúdo CSV;
4. executar parser;
5. devolver registros normalizados.

Utilizar tratamento de erros.

Exemplo conceitual:

```javascript
try {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(...);
    }

    const csv = await response.text();

    return parseCsv(csv);
} catch (error) {
    ...
}
```

Não esconder erros silenciosamente.

Registrar informações úteis com:

```javascript
console.error(...)
console.warn(...)
```

---

# Fase 6 — Implementar parser CSV

NÃO implementar parsing utilizando apenas:

```javascript
line.split(',')
```

Isso falharia com valores contendo:

```text
"texto, com vírgula"
```

O parser deve compreender pelo menos:

- vírgulas;
- aspas;
- campos vazios;
- aspas escapadas;
- quebra de linha;
- CRLF;
- cabeçalhos.

Exemplo:

```csv
order,title,url
1,"Instagram, fotos",https://instagram.com/example
```

deve resultar em:

```javascript
{
    order: "1",
    title: "Instagram, fotos",
    url: "https://instagram.com/example"
}
```

Criar testes automatizados específicos para o parser.

---

# Fase 7 — Normalização dos dados

Não misturar parsing CSV com regras da aplicação.

Criar funções como:

```javascript
normalizeConfig(rows)

normalizeLinks(rows)
```

## `normalizeConfig`

Converter:

```text
key,value
```

para:

```javascript
{
    title: "...",
    description: "...",
    avatar: "...",
    footer: "...",
    theme: "..."
}
```

---

## `normalizeLinks`

Converter cada registro da planilha para estrutura semelhante a:

```javascript
{
    order: 1,
    title: 'WhatsApp',
    url: 'https://...',
    icon: 'whatsapp',
    enabled: true,
    highlight: false
}
```

Depois:

1. remover links inválidos;
2. remover links desabilitados;
3. ordenar por `order`.

---

# Fase 8 — Renderização

Criar funções pequenas e claras.

Exemplo:

```javascript
renderProfile(config)

renderLinks(links)

renderFooter(config)
```

Evitar uma única função gigante.

---

# Perfil

Renderizar:

```text
avatar

Título

Descrição
```

Caso não exista avatar válido:

```text
assets/default-avatar.svg
```

Caso não exista descrição:

não renderizar espaço vazio desnecessário.

---

# Links

Para cada link válido, criar aproximadamente:

```html
<a>
    <span class="icon"></span>
    <span class="title"></span>
</a>
```

Links externos deverão utilizar:

```html
target="_blank"
rel="noopener noreferrer"
```

O texto do link deve ser inserido usando:

```javascript
textContent
```

Nunca:

```javascript
innerHTML = row.title
```

---

# Fase 9 — Ícones

Evitar inicialmente dependências grandes.

Utilizar uma das duas estratégias:

1. SVGs locais;
2. biblioteca pequena de ícones via CDN.

Se utilizar CDN, a aplicação deve continuar funcional mesmo que o ícone não carregue.

O link nunca poderá depender do ícone para funcionar.

Criar mapeamento:

```javascript
const ICONS = {
    whatsapp: ...,
    instagram: ...,
    linkedin: ...,
    github: ...,
    youtube: ...,
    globe: ...,
    email: ...
};
```

Fallback:

```text
link
```

---

# Fase 10 — Estados da interface

Implementar explicitamente quatro estados:

```text
loading
success
empty
error
```

## Loading

Enquanto os dados são carregados:

```text
Carregando...
```

ou skeleton simples.

---

## Success

Renderizar perfil e links normalmente.

---

## Empty

Caso nenhuma linha válida exista:

```text
Nenhum link disponível no momento.
```

---

## Error

Caso o Google Sheets esteja indisponível:

```text
Não foi possível carregar os links.
Tente novamente mais tarde.
```

Adicionar botão opcional:

```text
Tentar novamente
```

O erro técnico detalhado deve aparecer apenas no console.

---

# Fase 11 — Carregamento paralelo

As duas abas são independentes.

Utilizar:

```javascript
Promise.all(...)
```

quando apropriado.

Exemplo conceitual:

```javascript
const [configRows, linkRows] = await Promise.all([
    fetchSheet(APP_CONFIG.configSheetUrl),
    fetchSheet(APP_CONFIG.linksSheetUrl),
]);
```

Depois normalizar os resultados.

---

# Fase 12 — Evitar cache excessivo

Como os dados podem mudar sem deploy do site, tomar medidas para evitar cache antigo mantido pelo navegador.

Avaliar utilização de:

```javascript
fetch(url, {
    cache: 'no-store'
})
```

e/ou parâmetro variável:

```text
?t=timestamp
```

Não assumir, entretanto, que mudanças no Google Sheets aparecerão instantaneamente.

O site deve continuar funcionando normalmente caso exista algum atraso na propagação da versão publicada da planilha.

---

# Fase 13 — Layout

Implementar layout mobile-first.

Objetivo visual:

```text
              avatar

          Nome / Empresa

       pequena descrição


    ┌──────────────────────┐
    │     Instagram        │
    └──────────────────────┘

    ┌──────────────────────┐
    │      WhatsApp        │
    └──────────────────────┘

    ┌──────────────────────┐
    │       Website        │
    └──────────────────────┘


             footer
```

Requisitos:

- largura máxima do conteúdo;
- centralização;
- espaçamento consistente;
- botões suficientemente grandes para toque;
- responsividade;
- contraste adequado;
- estados `hover`;
- estados `focus-visible`;
- fonte legível.

Em desktop, não permitir que os botões ocupem a tela inteira.

Utilizar algo aproximadamente como:

```css
.container {
    width: min(100% - 32px, 600px);
    margin-inline: auto;
}
```

Ajustar conforme necessidade.

---

# Fase 14 — Acessibilidade

Garantir:

- HTML semântico;
- navegação por teclado;
- foco visível;
- `alt` da imagem;
- contraste adequado;
- título da página;
- links identificáveis;
- ausência de informações transmitidas apenas pela cor.

Se avatar for meramente decorativo, decidir corretamente entre descrição apropriada ou `alt=""`.

---

# Fase 15 — Metadata

Configurar no HTML:

```html
<title>
<meta name="description">
<meta name="viewport">
```

Adicionar Open Graph básico:

```text
og:title
og:description
og:image
```

Na primeira versão esses dados podem ser estáticos.

Documentar que metadata dinâmica carregada via JavaScript nem sempre será interpretada da mesma maneira por crawlers e aplicativos de compartilhamento.

Não criar backend apenas para resolver isso nesta etapa.

---

# Fase 16 — Segurança

Como a planilha é conteúdo externo controlado por usuários autorizados, ainda assim tratar tudo como entrada não confiável.

Nunca executar conteúdo proveniente da planilha.

Proibido:

```javascript
eval(...)
```

Proibido construir código a partir dos valores recebidos.

Proibido:

```javascript
element.innerHTML = sheetValue;
```

Validar URLs antes de criar links.

Utilizar `textContent`.

Imagens devem aceitar apenas protocolos seguros apropriados.

Não permitir URLs `javascript:`.

---

# Fase 17 — Tolerância a dados incorretos

O preenchimento incorreto de uma linha não poderá derrubar toda a aplicação.

Exemplo:

```text
linha 1 válida
linha 2 URL inválida
linha 3 válida
```

Resultado:

```text
linha 1 renderizada
linha 2 ignorada
linha 3 renderizada
```

Gerar:

```javascript
console.warn(...)
```

para a linha inválida.

---

# Fase 18 — Testes

Utilizar preferencialmente `node:test`, disponível no Node moderno, sem adicionar frameworks de teste desnecessários.

Criar testes para:

## CSV

- CSV simples;
- campos com vírgulas;
- campos entre aspas;
- aspas escapadas;
- campos vazios;
- CRLF;
- linha vazia.

## Boolean

Testar:

```text
TRUE
true
1
sim
yes

FALSE
false
0
não
nao
no
```

## URLs

URLs válidas:

```text
https://example.com
http://example.com
mailto:contato@example.com
tel:+551499999999
```

URLs inválidas:

```text
javascript:alert(1)
data:text/html,...
file:///etc/passwd
```

## Links

Testar:

- ordenação;
- enabled;
- title vazio;
- URL vazia;
- order inválido.

---

# Fase 19 — Teste local

Documentar no README que não é recomendado abrir apenas:

```text
file:///.../index.html
```

para testar requisições.

Subir servidor HTTP local.

Exemplo:

```bash
python3 -m http.server 8080
```

Abrir:

```text
http://localhost:8080
```

---

# Fase 20 — GitHub Pages

Preparar o projeto para funcionar diretamente no GitHub Pages.

Evitar caminhos absolutos como:

```text
/css/styles.css
```

Preferir:

```text
./css/styles.css
```

porque o projeto poderá ser hospedado em:

```text
usuario.github.io/repositorio/
```

e não necessariamente diretamente em:

```text
usuario.github.io/
```

Adicionar:

```text
.nojekyll
```

para deixar explícito que se trata de um site estático que não depende de processamento Jekyll.

---

# Fase 21 — Deploy

Inicialmente manter o deploy o mais simples possível.

Estratégia preferida:

```text
push em main
       ↓
GitHub Pages
       ↓
site publicado
```

Não criar pipeline complexo caso a publicação direta da branch seja suficiente.

Caso o repositório ou configuração atual exija GitHub Actions, utilizar o workflow oficial do GitHub Pages.

Não adicionar processo de build sem necessidade.

---

# Fase 22 — README para usuário técnico

Documentar:

1. propósito do projeto;
2. arquitetura;
3. estrutura de diretórios;
4. como executar localmente;
5. como configurar URLs do Google Sheets;
6. como publicar no GitHub Pages;
7. como executar testes;
8. como diagnosticar erro de carregamento.

---

# Fase 23 — README para usuário não técnico

Criar seção separada:

# Como alterar os links

Explicar utilizando linguagem simples.

Exemplo:

```text
1. Abra a planilha.

2. Acesse a aba "links".

3. Para adicionar um link, crie uma nova linha.

4. Preencha:
   order
   title
   url
   icon
   enabled

5. Para esconder um link sem apagá-lo:
   enabled = FALSE

6. Para alterar a ordem:
   mude o campo order.

7. Não altere os nomes das colunas.
```

Adicionar exemplos.

Documentar também:

```text
TRUE = mostrar
FALSE = esconder
```

Essa seção deve ser compreensível por uma pessoa que nunca utilizou Git ou GitHub.

---

# Fase 24 — Validação da publicação

Antes de considerar a aplicação concluída, validar o cenário completo:

```text
1. Site está publicado.

2. Abrir Google Sheets.

3. Alterar o título de um link.

4. Não alterar nenhum arquivo no GitHub.

5. Atualizar a página.

6. Confirmar que o novo conteúdo aparece.

7. Criar novo link.

8. Confirmar que aparece.

9. Alterar enabled para FALSE.

10. Confirmar que desaparece.

11. Alterar order.

12. Confirmar nova posição.
```

O objetivo principal do projeto somente será considerado atendido caso essas operações possam ser feitas sem edição de código.

---

# Fase 25 — Critérios de aceite

A primeira versão estará concluída quando:

- [ ] funcionar hospedada no GitHub Pages;
- [ ] não possuir backend;
- [ ] não possuir banco de dados;
- [ ] não exigir API key;
- [ ] carregar configurações do Google Sheets;
- [ ] carregar links do Google Sheets;
- [ ] esconder links desativados;
- [ ] ordenar links;
- [ ] validar URLs;
- [ ] funcionar em celular;
- [ ] funcionar em desktop;
- [ ] apresentar estado de loading;
- [ ] apresentar estado de erro;
- [ ] apresentar estado vazio;
- [ ] possuir fallback para avatar;
- [ ] possuir fallback para ícones;
- [ ] possuir testes para parser e validações;
- [ ] permitir atualização dos links sem novo deploy;
- [ ] possuir instruções para usuários não técnicos.

---

# Estratégia de commits

Executar a implementação incrementalmente.

Sugestão:

```text
feat: create initial static page structure

feat: add responsive link page layout

feat: add CSV parser

test: add CSV parser tests

feat: add Google Sheets data source

feat: add config normalization

feat: add links normalization and validation

test: add link validation tests

feat: render profile from Google Sheets

feat: render links from Google Sheets

feat: add loading empty and error states

feat: add accessibility improvements

docs: add Google Sheets setup guide

docs: add GitHub Pages deployment guide
```

Evitar um único commit contendo toda a implementação.

---

# Regra para o Codex durante a implementação

Antes de alterar arquivos:

1. examine a estrutura atual do repositório;
2. não substitua código existente desnecessariamente;
3. identifique se já existe configuração do GitHub Pages;
4. preserve convenções existentes que façam sentido.

Execute uma fase por vez.

Após cada fase:

1. valide o código;
2. execute testes disponíveis;
3. corrija problemas encontrados;
4. somente depois avance.

Não introduza framework ou dependência para resolver algo que possa ser feito de maneira simples com APIs nativas do navegador.

Em decisões entre abstração e simplicidade, prefira simplicidade enquanto não houver requisito concreto justificando a abstração.

---

# Resultado esperado

A experiência final deve ser:

```text
                    DESENVOLVEDOR

                        GitHub
                          │
                    HTML/CSS/JS
                          │
                          ▼
                    GitHub Pages


                    EDITORES

                    Google Sheets
                          │
               alteram apenas dados
                          │
                          ▼
                   página atualizada


                    VISITANTES

                      acessam
                          │
                          ▼
                 página estilo Linktree
```

O Google Sheets deve funcionar como um **CMS extremamente simples**, e não como um banco de dados tradicional.

O projeto deve permanecer pequeno o suficiente para que um desenvolvedor consiga compreender sua arquitetura inteira em poucos minutos.