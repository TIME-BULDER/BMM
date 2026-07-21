-- Période des campagnes de collecte (date de début et de fin).
--
-- Ces dates alimentent la page publique des campagnes (décompte avant le
-- démarrage) et l'organisation de la collecte.
--
-- À appliquer dans l'éditeur SQL du dashboard Supabase.

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
