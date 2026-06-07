ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS source_document_number varchar(80);

CREATE UNIQUE INDEX IF NOT EXISTS businesses_source_document_number_unique_idx
  ON businesses (source_document_number)
  WHERE source_document_number IS NOT NULL;
