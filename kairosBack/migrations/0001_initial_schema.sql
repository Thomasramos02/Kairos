CREATE TABLE IF NOT EXISTS accounts (
  id varchar(80) PRIMARY KEY,
  name varchar(160) NOT NULL,
  email varchar(240) NOT NULL,
  company_name varchar(200),
  password_hash varchar(240) NOT NULL,
  alert_preference jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS accounts_email_unique_idx
  ON accounts (email);

CREATE TABLE IF NOT EXISTS businesses (
  id varchar(80) PRIMARY KEY,
  source_document_number varchar(80),
  legal_name varchar(240) NOT NULL,
  state varchar(32) NOT NULL,
  city varchar(120),
  industry varchar(160) NOT NULL,
  source_name varchar(120) NOT NULL,
  registered_at timestamptz NOT NULL,
  discovered_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS source_document_number varchar(80);

CREATE UNIQUE INDEX IF NOT EXISTS businesses_source_document_number_unique_idx
  ON businesses (source_document_number)
  WHERE source_document_number IS NOT NULL;

CREATE TABLE IF NOT EXISTS market_targets (
  id varchar(80) PRIMARY KEY,
  account_id varchar(80) NOT NULL REFERENCES accounts (id),
  country varchar(2) NOT NULL,
  state varchar(2) NOT NULL,
  city_or_region varchar(160),
  industry varchar(160) NOT NULL,
  desired_customer_type varchar(240) NOT NULL,
  offered_service varchar(80) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digital_signals (
  id varchar(80) PRIMARY KEY,
  business_id varchar(80) NOT NULL REFERENCES businesses (id),
  signal_name varchar(120) NOT NULL,
  source_name varchar(120) NOT NULL,
  confidence_score integer NOT NULL,
  service_impact text NOT NULL,
  detected_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timing_scores (
  id varchar(80) PRIMARY KEY,
  business_id varchar(80) NOT NULL REFERENCES businesses (id),
  offered_service varchar(80) NOT NULL,
  timing_stage varchar(80) NOT NULL,
  timing_score integer NOT NULL,
  reason text NOT NULL,
  calculated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS watchlist_items (
  id varchar(80) PRIMARY KEY,
  account_id varchar(80) NOT NULL REFERENCES accounts (id),
  business_id varchar(80) NOT NULL REFERENCES businesses (id),
  saved_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alert_events (
  id varchar(80) PRIMARY KEY,
  account_id varchar(80) NOT NULL REFERENCES accounts (id),
  business_id varchar(80) NOT NULL REFERENCES businesses (id),
  reason varchar(80) NOT NULL,
  channels jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outbox_events (
  id varchar(80) PRIMARY KEY,
  event_name varchar(160) NOT NULL,
  aggregate_id varchar(80) NOT NULL,
  payload jsonb NOT NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS outbox_events_unpublished_idx
  ON outbox_events (created_at)
  WHERE published_at IS NULL;
