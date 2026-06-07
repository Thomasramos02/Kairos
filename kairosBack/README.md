# Kairos Backend

Nest.js backend for the Kairos API and background workers.

## Stack

- Nest.js
- PostgreSQL
- Drizzle
- BullMQ
- Valkey
- Postgres Outbox

## Commands

```bash
npm install
npm run infra:up
npm run db:migrate
npm run typecheck
npm test
npm run start:dev
```

`npm start` requires PostgreSQL and Valkey to be reachable.
For local development, copy `.env.example` to `.env`, run `npm run infra:up`,
run `npm run db:migrate`, then start the API.

## Structure

- `src/config`: environment parsing and app configuration.
- `src/database`: Drizzle connection and PostgreSQL schema.
- `src/queue`: BullMQ integration behind project-owned interfaces.
- `src/outbox`: persisted domain events and publisher worker.
- `src/modules`: product modules such as businesses and digital signals.
