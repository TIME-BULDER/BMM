-- Compte d'approvisionnement par structure.
--
-- Chaque organisation dispose d'un solde de récompenses (en satoshis) qu'elle
-- recharge, et sur lequel ses récompenses aux donneurs sont débitées. Cela
-- remplace le prélèvement sur un portefeuille commun de la plateforme et donne
-- un suivi par structure.
--
-- À appliquer dans l'éditeur SQL du dashboard Supabase.

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS balance_sats INTEGER NOT NULL DEFAULT 0;
