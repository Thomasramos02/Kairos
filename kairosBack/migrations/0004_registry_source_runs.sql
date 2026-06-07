CREATE TABLE IF NOT EXISTS registry_source_runs (
  id varchar(80) PRIMARY KEY,
  state varchar(32) NOT NULL,
  source_name varchar(160) NOT NULL,
  source_cursor varchar(120),
  status varchar(40) NOT NULL,
  records_found integer NOT NULL DEFAULT 0,
  records_created integer NOT NULL DEFAULT 0,
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE INDEX IF NOT EXISTS registry_source_runs_source_idx
  ON registry_source_runs (state, source_name, source_cursor);
