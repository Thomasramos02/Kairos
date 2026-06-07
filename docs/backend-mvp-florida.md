# Backend Florida Experimental

## Objetivo

Este guia resume como integrar e validar a coleta Florida do Kairos como tracer
bullet experimental.

O foco nao e cobertura nacional.

Florida nao e mais a cobertura ativa do MVP porque Sunbiz nao fornece industry
confiavel para o score por servico vendido. A cobertura ativa deve priorizar
Connecticut; Florida fica disponivel apenas como experimento de volume e parser.

O foco deste guia e provar o ciclo legado:

```txt
Florida experimental source
-> businesses
-> outbox
-> digital signals
-> Timing Score
-> timing history
-> alerts
```

## Fonte experimental

Estado experimental:

- Florida.

Fonte:

- Florida Division of Corporations Daily Corporate Filing.

Arquivo:

```txt
https://sftp.floridados.gov/Public/doc/cor/{yyyymmdd}c.txt
```

Credenciais publicas:

```txt
FLORIDA_SUNBIZ_USERNAME=Public
FLORIDA_SUNBIZ_PASSWORD=PubAccess1845!
```

As credenciais tem defaults no backend.

Use envs explicitas se quiser sobrescrever.

## Coleta

Endpoint operacional:

```txt
POST /jobs/discover-businesses
```

Payload:

```json
{
  "state": "FL",
  "industry": "restaurants"
}
```

Esse endpoint apenas enfileira o job.

O worker resolve a fonte pelo estado.

Para Florida, ele tenta arquivos recentes de dias uteis.

O cursor da fonte e a data do arquivo:

```txt
20260603
```

## Persistencia

Cada empresa descoberta grava:

- nome legal;
- document number da fonte;
- estado;
- cidade;
- segmento usado na coleta;
- data de registro;
- nome da fonte.

`source_document_number` evita duplicidade.

Se a empresa ja existe, o backend nao recria outbox.

Se a empresa e nova, o backend grava empresa e outbox na mesma transacao.

Evento criado:

```txt
BusinessDiscovered
```

## Rastreamento da fonte

Cada execucao registra `registry_source_runs`.

Campos principais:

- state;
- source_name;
- source_cursor;
- status;
- records_found;
- records_created;
- error_message;
- started_at;
- finished_at.

Status esperados:

- running;
- completed;
- failed.

Esse dado e operacional.

Nao precisa virar endpoint publico no MVP.

## Outbox

O outbox publisher busca eventos pendentes.

Para `BusinessDiscovered`, ele enfileira:

```txt
digital-signal
```

Depois marca o evento como publicado.

Isso evita perder processamento quando o banco muda.

## Sinais digitais

O worker de sinais busca sinais leves e gratuitos.

Sinais iniciais:

- website missing;
- domain recently registered;
- website incomplete;
- local presence incomplete;
- social presence misaligned;
- online store recently launched;
- website technology detected.

Se nenhum site candidato responde, registra:

```txt
website-missing
```

Depois enfileira Timing Score.

## Timing Score

O worker calcula score por servico vendido.

Servico padrao no fluxo automatico atual:

```txt
website-design-development
```

O score considera:

- idade da empresa;
- sinais digitais;
- confianca dos dados;
- servico vendido.

Tambem registra historico de fase.

Fases:

- too-early;
- warming-up;
- best-window;
- cooling-down;
- old-lead.

## Alertas

Alertas sao criados apos mudanca real de fase.

Regras atuais:

- primeira fase registrada gera `new-business`;
- entrada em `best-window` gera `entered-best-window` para watchlist;
- outras mudancas geram `timing-stage-changed`.

Alertas usam mercados alvo compativeis.

Compatibilidade usa:

- estado;
- cidade/regiao quando configurada;
- segmento;
- servico vendido.

## Entrega

Canais iniciais:

- email;
- Telegram.

Sem configuracao, a entrega fica skipped.

Isso preserva ambiente local.

Env de email:

```txt
SMTP_USER
SMTP_APP_PASSWORD
ALERT_EMAIL_FROM
ALERT_EMAIL_TO
```

Env de Telegram:

```txt
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

## Validacao local

Subir infra:

```txt
npm run infra:up
```

Aplicar migrations:

```txt
npm run db:migrate
```

Validar build:

```txt
npm run typecheck
npm run build
npm test
```

Validacao manual minima:

1. Criar conta.
2. Fazer login.
3. Criar market target para Florida.
4. Enfileirar discovery.
5. Aguardar workers.
6. Listar businesses.
7. Conferir timing history.
8. Conferir alert events.

## Consultas uteis

Runs:

```sql
select * from registry_source_runs order by started_at desc limit 5;
```

Empresas:

```sql
select * from businesses order by discovered_at desc limit 5;
```

Outbox:

```sql
select * from outbox_events order by created_at desc limit 5;
```

Alertas:

```sql
select * from alert_events order by created_at desc limit 5;
```

## Escopo do MVP

Nao expandir estados agora.

Florida deve provar:

- descoberta antecipada;
- fonte confiavel;
- dedupe;
- sinais digitais;
- Timing Score;
- historico;
- alertas.

Estados adicionais entram depois.

O criterio para novo estado e fonte incremental oficial.

Evitar:

- scraping agressivo;
- CSV gigante diario;
- bases pagas;
- enriquecimento premium;
- promessa de conversao.

## Proximo marco

O MVP backend esta pronto para integrar com frontend quando:

- login funciona;
- market target cria;
- discovery Florida roda;
- lista mostra empresas;
- timing aparece;
- alertas ficam registrados;
- export CSV funciona.
