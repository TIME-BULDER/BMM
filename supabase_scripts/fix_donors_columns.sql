-- Migration corrective : la table `donors` en base a été créée avant l'ajout
-- des colonnes d'identité. `CREATE TABLE IF NOT EXISTS` ne modifie pas une
-- table existante, d'où l'erreur PGRST204 "Could not find the 'email' column".
--
-- À exécuter une fois dans le SQL Editor de Supabase.

ALTER TABLE donors ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE donors ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE donors ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE donors ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
ALTER TABLE donors ADD COLUMN IF NOT EXISTS validated BOOLEAN NOT NULL DEFAULT FALSE;

-- Unicité de l'email (cohérent avec init.sql).
CREATE UNIQUE INDEX IF NOT EXISTS donors_email_key ON donors (email);

-- Note : les colonnes d'identité sont ajoutées en NULL-able pour ne pas
-- échouer si la table contient déjà des lignes. L'application fournit
-- toujours ces valeurs à l'insertion.
