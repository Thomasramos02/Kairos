ALTER TABLE digital_signals
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE businesses
SET industry = CASE
  WHEN legal_name ILIKE '%dental%' OR legal_name ILIKE '%dentist%' THEN 'Healthcare - Dental'
  WHEN legal_name ILIKE '%clinic%' OR legal_name ILIKE '%medical%' THEN 'Healthcare - General'
  WHEN legal_name ILIKE '%clean%' OR legal_name ILIKE '%janitorial%' THEN 'Cleaning Services'
  WHEN legal_name ILIKE '%fitness%' OR legal_name ILIKE '%gym%' OR legal_name ILIKE '%yoga%' THEN 'Fitness & Wellness'
  WHEN legal_name ILIKE '%marketing%' OR legal_name ILIKE '%media%' THEN 'Marketing Agency'
  WHEN legal_name ILIKE '%bakery%' OR legal_name ILIKE '%cafe%' OR legal_name ILIKE '%restaurant%' THEN 'Food & Beverage'
  WHEN legal_name ILIKE '%accounting%' OR legal_name ILIKE '%tax%' THEN 'Accounting Services'
  WHEN legal_name ILIKE '%software%' OR legal_name ILIKE '%digital%' THEN 'Software Development'
  WHEN legal_name ILIKE '%landscap%' OR legal_name ILIKE '%lawn%' THEN 'Landscaping'
  WHEN legal_name ILIKE '%logistics%' OR legal_name ILIKE '%transport%' THEN 'Logistics'
  WHEN legal_name ILIKE '%auto%' OR legal_name ILIKE '%repair%' THEN 'Automotive Services'
  WHEN legal_name ILIKE '%consulting%' OR legal_name ILIKE '%advisor%' THEN 'Business Consulting'
  WHEN legal_name ILIKE '%cloud%' OR legal_name ILIKE '%network%' OR legal_name ILIKE '%cyber%' THEN 'IT Services'
  WHEN legal_name ILIKE '%real estate%' OR legal_name ILIKE '%realty%' THEN 'Real Estate'
  WHEN legal_name ILIKE '%legal%' OR legal_name ILIKE '%attorney%' THEN 'Legal Services'
  ELSE industry
END
WHERE state = 'FL'
  AND industry = 'unclassified';
