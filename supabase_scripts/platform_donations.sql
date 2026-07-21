-- =========================================================================
-- Bitcoin Blood - Dons a la plateforme (Lightning)
-- A executer dans l'editeur SQL du Dashboard Supabase. Idempotent.
--
-- Journalise les intentions de don (montant, objectif, facture BOLT11).
-- L'insertion se fait via la cle service-role cote serveur, donc RLS reste
-- ferme (aucune politique publique).
-- =========================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'donation_purpose') THEN
    CREATE TYPE donation_purpose AS ENUM (
      'campaign',      -- Campagnes de don de sang
      'development',   -- Developpement du produit
      'operations',    -- Fonctionnement (hebergement, etc.)
      'emergency'      -- Fonds d'urgence
    );
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS platform_donations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_sats  INTEGER NOT NULL CHECK (amount_sats > 0),
  purpose      donation_purpose NOT NULL,
  message      TEXT,
  bolt11       TEXT,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_platform_donations_created_at
  ON platform_donations (created_at DESC);

ALTER TABLE platform_donations ENABLE ROW LEVEL SECURITY;
