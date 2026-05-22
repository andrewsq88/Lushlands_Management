/*
  # Make partner submissions more flexible

  1. Changes
    - Make `address` column nullable on `partner_submissions` table
    - Make `service_types` column nullable on `partner_submissions` table
    - This allows users to submit a partner with just a company name and URL

  2. Important Notes
    - No data loss: existing rows keep their values
    - Only relaxes constraints for new simpler submissions
*/

ALTER TABLE partner_submissions ALTER COLUMN address DROP NOT NULL;
ALTER TABLE partner_submissions ALTER COLUMN service_types DROP NOT NULL;
