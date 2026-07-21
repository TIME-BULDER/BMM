-- Rend l'attachement à une organisation facultatif pour agir.
--
-- Certaines actions (déclarer une alerte, lancer une campagne, gérer le stock
-- et les transferts) exigeaient que le compte soit relié à une organisation.
-- On lève cette contrainte : la référence à l'organisation devient facultative
-- (les clés étrangères acceptent déjà NULL, il suffit de retirer NOT NULL).
--
-- À appliquer dans l'éditeur SQL du dashboard Supabase.

ALTER TABLE emergencies ALTER COLUMN hospital_id DROP NOT NULL;
ALTER TABLE campaigns ALTER COLUMN hospital_id DROP NOT NULL;

-- Réseau inter-centres (si présent).
ALTER TABLE IF EXISTS blood_stock ALTER COLUMN hospital_id DROP NOT NULL;
ALTER TABLE IF EXISTS transfer_requests ALTER COLUMN requester_id DROP NOT NULL;
