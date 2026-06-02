# Design System

## 1. Objetivo

Este documento define os fundamentos visuais e os componentes reutilizaveis do Kairos.

Ele existe para manter consistencia entre telas, estados e interacoes. A prototipacao de tela fica em `docs/prototipacao-frontend.md`.

## 2. Principios

- clareza acima de enfeite;
- confianca acima de exibicao;
- densidade informacional sem perder leitura;
- estados explicaveis;
- acessibilidade por padrao;
- uso moderado de efeitos visuais.

## 3. Foundations

### 3.1 Cores

Tokens base sugeridos:

- `bg`: `#F7F9FC`
- `surface`: `#FFFFFF`
- `text-primary`: `#111827`
- `text-secondary`: `#64748B`
- `border`: `#E2E8F0`
- `brand`: `#2563EB`
- `brand-hover`: `#1D4ED8`
- `accent`: `#06B6D4`

### 3.2 Cores Semanticas

Fases de timing:

- `too-early`: `#94A3B8`
- `warming-up`: `#F59E0B`
- `best-window`: `#10B981`
- `cooling-down`: `#F97316`
- `old-lead`: `#EF4444`

### 3.3 Tipografia

Fonte principal:

- `Satoshi`

Fallback:

```css
font-family: Satoshi, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Escala sugerida:

- hero: 48-64px;
- page title: 28-36px;
- section title: 20-24px;
- body: 15-16px;
- secondary: 13-14px;
- label: 12-13px;

### 3.4 Espacamento E Forma

- usar uma escala fixa de espacos;
- manter radius consistente entre cards, inputs e buttons;
- evitar sombras pesadas;
- bordas sutis;
- profundidade leve, nao dramatica.

## 4. Componentes Base

### 4.1 Button

Variantes:

- primary;
- secondary;
- ghost;
- destructive.

Regras:

- texto curto;
- estado hover claro;
- loading state;
- desabilitado visivel.

### 4.2 Badge

Uso:

- timing stage;
- status;
- fonte;
- categoria.

Regra:

- nunca depender apenas da cor para comunicar o significado.

### 4.3 Card

Uso:

- resumo;
- metrica;
- detalhe rapido;
- blocos de onboarding.

### 4.4 Table Row

Uso:

- listas de empresas;
- watchlist;
- resultados de busca.

Cada linha deve deixar claro:

- nome;
- fase;
- idade;
- score;
- acao principal.

### 4.5 Input

Regras:

- label sempre visivel;
- erro perto do campo;
- focus state forte;
- helper text curto;
- tamanho de toque adequado.

### 4.6 Sidebar

Regras:

- navegacao simples;
- item ativo evidente;
- densidade moderada;
- comportamento responsivo em mobile.

### 4.7 Toast E Empty State

Toasts:

- feedback curto;
- sem acao critica.

Empty states:

- explicar o que aconteceu;
- sugerir o proximo passo.

### 4.8 Skeleton

Preferir skeletons para carregar listas, cards e tabelas.

## 5. Regras De Estado

### 5.1 Focus

Todo elemento interativo precisa ter foco visivel.

### 5.2 Loading

Carregamento deve preservar a estrutura da tela sempre que possivel.

### 5.3 Error

Erro deve ser especifico, legivel e ligado ao componente afetado.

### 5.4 Success

Sucesso deve ser discreto e contextual.

## 6. Acessibilidade

- contraste minimo WCAG AA;
- navegacao completa por teclado;
- labels sem ambiguidades;
- alt text quando a imagem for relevante para a tarefa;
- sem depender so de cor;
- alvos de toque de pelo menos 44px no mobile;
- landmarks semanticos corretos;
- tabelas com cabecalho apropriado.

## 7. Motion

Motion deve ser util, nao decorativo.

Use apenas:

- transicoes curtas;
- entrada de componentes;
- destaque de mudanca de estado;
- feedback de acao.

Evite:

- animacoes longas;
- efeitos chamativos demais;
- excesso de parallax ou glass exagerado.

## 8. Tom De Conteudo

Microcopy deve ser:

- direto;
- contextual;
- orientado a acao;
- sem linguagem de spam.

Preferir termos como:

- track;
- monitor;
- outreach readiness;
- timing stage;
- recommended action;
- data confidence.

## 9. Como Usar Este Documento

Use estes tokens e regras como base de todas as telas.

Se uma tela precisar de algo novo, o padrao deve nascer aqui primeiro e depois ser reutilizado.
