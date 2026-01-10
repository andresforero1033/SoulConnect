-- Add extended clinical and contact fields to patients

ALTER TABLE patients
    ADD COLUMN IF NOT EXISTS eps VARCHAR(120),
    ADD COLUMN IF NOT EXISTS address VARCHAR(200),
    ADD COLUMN IF NOT EXISTS blood_type VARCHAR(8),
    ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,2),
    ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2);
