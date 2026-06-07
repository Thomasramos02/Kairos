UPDATE businesses
SET industry = 'unclassified'
WHERE state = 'FL'
  AND source_name = 'Florida Division of Corporations Daily Corporate Filing';
