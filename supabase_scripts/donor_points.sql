-- =========================================================================
-- Bitcoin Blood — Script de Création de la Table des Points (donor_points_ledger)
-- À exécuter dans l'éditeur SQL de votre Dashboard Supabase
-- =========================================================================

-- 1. Création de la Table du Grand Livre des Points
CREATE TABLE IF NOT EXISTS donor_points_ledger (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id           UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  hospital_id        UUID REFERENCES organizations(id) ON DELETE SET NULL,
  amount             INTEGER NOT NULL, -- Positif pour AWARD, négatif pour REDEEM
  action             VARCHAR(50) NOT NULL CHECK (action IN ('AWARD', 'REDEEM')),
  transaction_hash   VARCHAR(64) NOT NULL, -- Hash SHA-256 de la transaction
  ots_proof          TEXT, -- Preuve OTS encodée en Base64
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. Indexation pour les performances
CREATE INDEX IF NOT EXISTS idx_donor_points_ledger_donor_id ON donor_points_ledger (donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_points_ledger_hospital_id ON donor_points_ledger (hospital_id);
CREATE INDEX IF NOT EXISTS idx_donor_points_ledger_action ON donor_points_ledger (action);

-- 3. Activation RLS
ALTER TABLE donor_points_ledger ENABLE ROW LEVEL SECURITY;

-- 4. Politiques de Sécurité
DROP POLICY IF EXISTS "Donneurs voient leurs propres transactions de points" ON donor_points_ledger;
CREATE POLICY "Donneurs voient leurs propres transactions de points"
  ON donor_points_ledger FOR SELECT
  USING (
    donor_id = auth.uid()
  );

DROP POLICY IF EXISTS "Org admin voit les transactions de points" ON donor_points_ledger;
CREATE POLICY "Org admin voit les transactions de points"
  ON donor_points_ledger FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('org_admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Org admin et Super admin peuvent inserer des points" ON donor_points_ledger;
CREATE POLICY "Org admin et Super admin peuvent inserer des points"
  ON donor_points_ledger FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('org_admin', 'super_admin')
    )
  );
