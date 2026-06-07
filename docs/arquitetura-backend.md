# Arquitetura Backend

## 1. Objetivo

Este documento define a arquitetura backend inicial do Kairos.

O foco do backend e entregar velocidade, confiabilidade e baixo custo operacional para descobrir negocios novos, identificar sinais digitais e calcular timing de abordagem.

## 2. Principios

- velocidade de desenvolvimento sem perder estrutura;
- confiabilidade antes de sofisticação;
- custo baixo no MVP;
- jobs rastreaveis e reprocessaveis;
- sinais explicaveis;
- arquitetura simples de evoluir.

## 3. Stack Recomendada

### API

Framework:

- Nest.js.

Motivo:

- estrutura modular;
- injecao de dependencias nativa;
- boa separacao entre controllers, services e modules;
- facilita testes e evolucao para workers.

### Banco De Dados

Banco principal:

- PostgreSQL.

Uso:

- usuarios;
- mercados monitorados;
- empresas descobertas;
- sinais digitais;
- scores;
- historico de fases;
- watchlist;
- alertas;
- exports;
- outbox events.

### ORM

ORM:

- Drizzle.

Motivo:

- leve;
- tipado;
- SQL mais explicito;
- bom equilibrio entre produtividade e controle.

### Filas E Jobs

Fila:

- BullMQ.

Backend da fila:

- Valkey ou Redis.

Preferencia:

- Valkey no MVP, por ser open source BSD e compativel com o uso esperado de cache e filas.

BullMQ deve ser usado para:

- jobs assincronos;
- retries;
- delays;
- backoff;
- controle de concorrencia;
- processamento em workers.

### Cache

Cache:

- Valkey ou Redis.

Uso inicial:

- cache de consultas frequentes;
- deduplicacao temporaria;
- rate limit;
- locks curtos;
- estado transitorio de jobs.

## 4. Componentes

### API Service

Responsabilidades:

- autenticacao;
- configuracao de mercado alvo;
- leitura de empresas e sinais;
- watchlist;
- alertas;
- exportacao;
- exposicao dos scores e motivos.

### Worker Service

Responsabilidades:

- descobrir empresas novas;
- verificar sinais digitais;
- recalcular Timing Score;
- emitir alertas;
- gerar exports;
- reprocessar falhas.

No inicio, API e workers podem viver no mesmo repositorio e compartilhar modulos de dominio.

## 4.1 Estrutura Do Projeto

O backend vive em `kairosBack/`.

Estrutura inicial:

```txt
kairosBack/
  src/
    config/
    database/
      schema/
    modules/
      businesses/
        models/
        services/
      digital-signals/
        models/
        services/
    outbox/
    queue/
    workers/
```

Regras:

- `modules/` contem dominios do produto;
- `database/` contem integracao com Drizzle e schema PostgreSQL;
- `queue/` contem integracao com BullMQ;
- `outbox/` contem eventos persistidos e publicacao para jobs;
- `workers/` contem processors BullMQ conectados as filas;
- cada modulo deve manter models, services e testes perto da responsabilidade.

## 4.2 Persistencia Com Drizzle

Os repositories do backend devem usar Drizzle para persistir e consultar dados no PostgreSQL.

Entidades iniciais:

- `accounts`;
- `market_targets`;
- `businesses`;
- `digital_signals`;
- `timing_scores`;
- `timing_stage_history`;
- `watchlist_items`;
- `alert_events`;
- `outbox_events`.

Regras:

- controllers nao acessam Drizzle diretamente;
- services orquestram casos de uso;
- repositories encapsulam queries;
- schemas vivem em `src/database/schema`;
- erros de entrada devem ser tratados antes de chegar no repository.

Migrations:

- migrations SQL vivem em `kairosBack/migrations`;
- `npm run db:migrate` aplica a migration inicial usando `DATABASE_URL`;
- o runner de migration carrega `kairosBack/.env` antes de conectar no banco.

## 5. Eventos Iniciais

Eventos de dominio:

- `BusinessDiscovered`;
- `DigitalSignalsRequested`;
- `DigitalSignalDetected`;
- `DigitalSignalsCompleted`;
- `TimingScoreRequested`;
- `TimingScoreCalculated`;
- `BusinessEnteredBestWindow`;
- `AlertRequested`;
- `ExportRequested`.

## 6. Outbox Pattern

O Kairos deve usar Postgres Outbox para registrar eventos importantes na mesma transacao que altera o banco.

Exemplo:

- uma empresa nova e salva no Postgres;
- na mesma transacao, um evento `BusinessDiscovered` e gravado na tabela `outbox_events`;
- um worker le eventos pendentes da outbox;
- o worker publica o job correspondente no BullMQ;
- depois marca o evento como publicado.

## 7. BullMQ E Outbox

BullMQ e Outbox nao fazem a mesma coisa.

BullMQ resolve:

- executar jobs fora da request;
- controlar concorrencia;
- fazer retry;
- agendar processamento;
- evitar que a API fique lenta.

Outbox resolve:

- garantir que um evento nao seja perdido quando o banco muda;
- manter consistencia entre escrita no Postgres e publicacao na fila;
- permitir auditoria e reprocessamento.

Sem outbox, existe um risco:

- o sistema salva a empresa no banco;
- falha antes de publicar o job na fila;
- o processamento de sinais nunca acontece.

Com outbox, o evento fica persistido no banco e pode ser publicado depois.

## 8. A Fila Sobrecarrega Ou Alivia O Banco?

A fila ajuda a nao sobrecarregar a API e controla a velocidade de processamento.

Ela nao substitui o banco.

Para proteger o Postgres, os workers devem usar:

- concorrencia limitada;
- batches pequenos;
- retries com backoff;
- cache para leituras repetidas;
- indices corretos;
- jobs idempotentes;
- limites por fonte e por estado.

## 9. Fluxo Principal

```txt
API / Scheduler
      |
      v
PostgreSQL
      |
      v
Outbox Events
      |
      v
Outbox Publisher Worker
      |
      v
BullMQ
      |
      v
Domain Workers
      |
      v
PostgreSQL + Valkey Cache
```

Fluxo conectado no backend:

```txt
POST /jobs/discover-businesses
      |
      v
BullMQ business-discovery queue
      |
      v
BusinessDiscoveryProcessor
      |
      v
businesses + outbox_events
      |
      v
BullMQ digital-signal queue
      |
      v
DigitalSignalProcessor
      |
      v
digital_signals
      |
      v
BullMQ timing-score queue
      |
      v
TimingScoreProcessor
      |
      v
timing_scores
```

O outbox publisher le `outbox_events` pendentes no intervalo definido por `OUTBOX_POLL_INTERVAL_MS`, publica o job correspondente e marca `published_at`.

O `TimingScoreProcessor` tambem registra historico de fases em `timing_stage_history` quando uma empresa recebe sua primeira fase ou muda de fase para um servico vendido.

## 10. Workers Iniciais

### Business Discovery Worker

Descobre negocios novos por estado e fonte.

Implementacao atual:

- Connecticut e a fonte ativa para score confiavel por servico vendido;
- o bootstrap inicial dispara descoberta e recalculo para `CT`;
- Rhode Island e a proxima candidata, mas ainda sem source ativo;
- Florida, Seattle, Oregon e Iowa ficam como experimentos separados;
- Florida Sunbiz permanece como tracer bullet legado e experimental porque industry e inferida pelo Kairos;
- novos estados devem implementar `BusinessRegistrySource` e ser adicionados ao resolver por estado somente apos validacao de confiabilidade.

### Digital Signal Worker

Verifica sinais digitais gratuitos, como site ausente, dominio recente, presenca local incompleta e tecnologia detectada.

Implementacao atual:

- gera candidatos de site a partir do nome legal do negocio;
- consulta RDAP publico para detectar dominios registrados recentemente;
- tenta acessar os candidatos com `fetch`;
- registra `website-missing` quando nenhum candidato responde;
- analisa HTML para detectar site incompleto;
- detecta marcadores de Shopify, WordPress, Wix e Squarespace;
- registra loja online quando encontra sinal de Shopify.

### Timing Score Worker

Calcula score com base no servico vendido pelo usuario, idade do negocio, sinais digitais e confianca dos dados.

### Alert Worker

Envia alertas quando uma empresa entra em fase relevante.

Implementacao atual:

- registra o alerta em `alert_events`;
- monta mensagem curta e contextual;
- envia Telegram via Bot API quando `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` estao configurados;
- envia e-mail via SMTP do Gmail quando `SMTP_USER`, `SMTP_APP_PASSWORD`, `ALERT_EMAIL_FROM` e `ALERT_EMAIL_TO` estao configurados;
- canais nao configurados retornam `skipped`, mantendo o ambiente local funcional.

### Export Worker

Gera CSV sem bloquear a API.

## 10.1 Workers Conectados

Processors iniciais:

- `BusinessDiscoveryProcessor`;
- `DigitalSignalProcessor`;
- `TimingScoreProcessor`;
- `AlertProcessor`;
- `ExportProcessor`.

Endpoints operacionais iniciais:

- `POST /jobs/discover-businesses`;
- `POST /jobs/exports`.
- `GET /businesses/:businessId/timing-history`.

Esses endpoints existem para acionar jobs durante o MVP. Em producao, eles podem ser substituidos ou complementados por schedulers, cron jobs ou rotinas internas.

## 10.2 Autenticacao

O backend usa JWT assinado com HMAC SHA-256.

Variavel obrigatoria:

- `JWT_SECRET`.

Regras:

- cadastro e login sao publicos;
- login retorna `account` e `accessToken`;
- endpoints operacionais e dados de usuario usam `JwtAuthGuard`;
- senhas sao armazenadas como hash `scrypt` na coluna `password_hash`.

## 11. Custo

BullMQ open source e gratuito sob licenca MIT.

BullMQ Pro e pago e deve ficar fora do MVP.

Valkey pode ser usado sem custo de licenca.

Custos esperados no MVP:

- PostgreSQL hospedado;
- Valkey/Redis hospedado;
- servidor da API;
- servidor ou processo de workers;
- logs e monitoramento basico.

## 12. Decisao Inicial

O backend inicial do Kairos deve usar:

- Nest.js;
- PostgreSQL;
- Drizzle;
- BullMQ;
- Valkey;
- Postgres Outbox;
- workers no mesmo repositorio da API.

Essa combinacao entrega velocidade de desenvolvimento, confiabilidade operacional e caminho claro para escalar sem criar complexidade prematura.
