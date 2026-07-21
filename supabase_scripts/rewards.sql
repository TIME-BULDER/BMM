-- =========================================================================
-- Bitcoin Blood — Script de Création de la Table des Récompenses (reward_logs)
-- À exécuter dans l'éditeur SQL de votre Dashboard Supabase
-- =========================================================================

-- 1. Création de la Table des Récompenses
CREATE TABLE IF NOT EXISTS reward_logs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id           UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  hospital_id        UUID REFERENCES organizations(id) ON DELETE SET NULL,
  sats_amount        INTEGER NOT NULL CHECK (sats_amount > 0),
  status             VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  bolt11_invoice     TEXT,
  payment_hash       VARCHAR(255) UNIQUE,
  error_message      TEXT,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. Indexation pour les performances
CREATE INDEX IF NOT EXISTS idx_reward_logs_donor_id ON reward_logs (donor_id);
CREATE INDEX IF NOT EXISTS idx_reward_logs_hospital_id ON reward_logs (hospital_id);
CREATE INDEX IF NOT EXISTS idx_reward_logs_status ON reward_logs (status);

-- 3. Activation RLS
ALTER TABLE reward_logs ENABLE ROW LEVEL SECURITY;

-- 4. Politiques de Sécurité
DROP POLICY IF EXISTS "Org admin voit les recompenses de son hopital" ON reward_logs;
CREATE POLICY "Org admin voit les recompenses de son hopital"
  ON reward_logs FOR SELECT
  USING (
    hospital_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Super admin gere toutes les recompenses" ON reward_logs;
CREATE POLICY "Super admin gere toutes les recompenses"
  ON reward_logs FOR ALL
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  );
