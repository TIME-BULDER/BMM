-- Rend la position (latitude / longitude) facultative pour les donneurs.
--
-- Tous les donneurs ne souhaitent pas partager leur position à l'inscription.
-- Les contraintes CHECK existantes (BETWEEN ...) restent valides : elles
-- s'évaluent à NULL (donc passent) lorsque la valeur est NULL.
--
-- À appliquer dans l'éditeur SQL du dashboard Supabase.

ALTER TABLE donors ALTER COLUMN latitude DROP NOT NULL;
ALTER TABLE donors ALTER COLUMN longitude DROP NOT NULL;
