# Prototipacao Frontend

## 1. Objetivo

Este documento define a experiencia de frontend do MVP do Kairos.

O foco e orientar layout, hierarquia, interacoes e comportamento de tela. Os tokens visuais e regras reutilizaveis ficam em `docs/design_sistem.md`.

## 2. Premissas Do Produto

- idioma principal da interface: ingles;
- moeda e precos em dolar;
- foco inicial em um estado americano;
- comunicacao voltada a prospeccao B2B;
- interface precisa parecer uma ferramenta profissional de inteligencia comercial.

## 3. Direcao De UX

A interface deve ser:

- clara;
- rapida;
- confiavel;
- orientada a decisao;
- sem excesso de ruido visual.

O usuario precisa entender em poucos segundos:

- quais empresas sao novas;
- em que fase estao;
- por que aparecem ali;
- qual acao faz sentido agora.

## 4. Arquitetura Da Interface

### 4.1 Navegacao principal

Sugestao de areas principais:

- Dashboard;
- Watchlist;
- Alerts;
- Exports;
- Settings.

### 4.2 Estrutura geral

Padrao recomendado:

- sidebar fixa no desktop;
- faixa superior com filtros e contexto;
- area central com lista ou tabela de empresas;
- painel lateral ou pagina de detalhe para explicar a recomendacao.

## 5. Fluxos Principais

### 5.1 Landing page

Objetivo:

- explicar o valor rapidamente;
- conduzir para waitlist, login ou acesso.

Elementos essenciais:

- headline direta;
- subheadline sobre timing comercial;
- exemplo visual de empresa em fase;
- CTA principal;
- prova conceitual do fluxo.

### 5.2 Login e cadastro

Objetivo:

- reduzir friccao de entrada.

Regras:

- formularios curtos;
- validacoes claras;
- senha com mostrar/ocultar;
- foco visivel;
- erro perto do campo.

### 5.3 Onboarding

Objetivo:

- configurar mercado alvo sem atrito.

Campos:

- country;
- state;
- city or region;
- target industry;
- alert channel;
- alert frequency.

### 5.4 Dashboard

Objetivo:

- mostrar quais empresas merecem atencao agora.

Elementos:

- resumo por fase;
- filtros;
- ordenacao por score;
- lista ou tabela principal;
- acoes rapidas para salvar e copiar abordagem.

### 5.5 Detalhe da empresa

Objetivo:

- explicar a recomendacao com contexto.

Conteudo esperado:

- company name;
- registration date;
- age in days;
- state;
- city;
- industry;
- source;
- timing stage;
- timing score;
- reason;
- recommended action;
- contactability;
- data confidence;
- outreach suggestion.

### 5.6 Watchlist

Objetivo:

- acompanhar empresas salvas ate mudarem de fase.

### 5.7 Alerts

Objetivo:

- permitir que o usuario controle quando e como receber avisos.

## 6. Padroes De Interacao

### 6.1 Lista e tabela

- privilegie leitura rapida;
- mantenha acao principal visivel;
- use badges e labels para fase;
- permita detalhes sem perder contexto.

### 6.2 Feedback

- use skeletons em carregamento;
- use toasts apenas para feedback curto;
- evite modais desnecessarios;
- destaque mudancas de fase com clareza.

### 6.3 Estados vazios

Estados vazios devem orientar a proxima acao, nao apenas informar ausencia.

## 7. Responsividade

### Desktop

- tabela densa e legivel;
- filtros sempre acessiveis;
- detalhe lateral sem quebrar contexto.

### Tablet

- filtros recolhiveis;
- tabela simplificada ou cards.

### Mobile

- cards empilhados;
- acoes grandes;
- filtros em drawer;
- evitar tabela horizontal pesada.

## 8. Acessibilidade E Usabilidade

- contraste adequado;
- foco visivel;
- navegacao por teclado;
- labels associados aos inputs;
- nao depender apenas de cor;
- alvos de toque grandes;
- linguagem direta;
- explicar score com frases simples;
- evitar jargoes de spam.

## 9. Texto E Tom Na Interface

O tom deve ser profissional e contextual.

Preferir verbos como:

- track;
- monitor;
- evaluate;
- save;
- copy outreach;
- recommended action.

Evitar:

- hype;
- exagero comercial;
- linguagem de spam;
- promessas de venda garantida.

## 10. O Que Este Documento Nao Deve Repetir

Este arquivo nao deve repetir:

- estrategia do produto;
- regras detalhadas de score;
- especificacao visual de tokens;
- arquitetura tecnica.

Esses detalhes vivem em `docs/resumo.md`, `docs/requisitos.md` e `docs/design_sistem.md`.
