-- Make user_id nullable in devices table
ALTER TABLE forge.devices ALTER COLUMN user_id DROP NOT NULL;

-- Make user_id nullable in projects table  
ALTER TABLE forge.projects ALTER COLUMN user_id DROP NOT NULL;
