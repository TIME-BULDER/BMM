-- Rend le groupe sanguin optionnel pour les donneurs.
-- Un donneur qui ne connait pas encore son groupe peut le laisser vide ;
-- il sera renseigne plus tard, apres un test en centre.
--
-- La contrainte CHECK existante (blood_type IN (...)) reste valide : elle
-- s'evalue a NULL (donc passe) lorsque la valeur est NULL.
--
-- A appliquer dans l'editeur SQL du dashboard Supabase.

ALTER TABLE donors ALTER COLUMN blood_type DROP NOT NULL;
