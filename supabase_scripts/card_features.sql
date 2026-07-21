-- =========================================================================
-- Bitcoin Blood — Commande de cartes et Retrait MoMo
-- À exécuter dans l'éditeur SQL de votre Dashboard Supabase
-- =========================================================================

-- 1. Modification de la table donors
ALTER TABLE donors ADD COLUMN IF NOT EXISTS balance_sats INTEGER NOT NULL DEFAULT 0;
ALTER TABLE donors ADD COLUMN IF NOT EXISTS card_type VARCHAR(50) NOT NULL DEFAULT 'virtual';
ALTER TABLE donors ADD COLUMN IF NOT EXISTS physical_card_status VARCHAR(50) NOT NULL DEFAULT 'none';
ALTER TABLE donors ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES donors(id) ON DELETE SET NULL;

-- 2. Création de la table des activités des donneurs (donor_activities)
CREATE TABLE IF NOT EXISTS donor_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('blood_donation', 'referral', 'awareness_session')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 3. Indexation de donor_activities
CREATE INDEX IF NOT EXISTS idx_donor_activities_donor_id ON donor_activities (donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_activities_type ON donor_activities (activity_type);

-- 4. Activation RLS pour donor_activities
ALTER TABLE donor_activities ENABLE ROW LEVEL SECURITY;

-- 5. Politiques RLS pour donor_activities
DROP POLICY IF EXISTS "Donneurs voient leurs propres activites" ON donor_activities;
CREATE POLICY "Donneurs voient leurs propres activites"
  ON donor_activities FOR SELECT
  USING (donor_id = auth.uid());

DROP POLICY IF EXISTS "Admins voient toutes les activites" ON donor_activities;
CREATE POLICY "Admins voient toutes les activites"
  ON donor_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('org_admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins insèrent des activites" ON donor_activities;
CREATE POLICY "Admins insèrent des activites"
  ON donor_activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('org_admin', 'super_admin')
    )
  );

-- 6. Création de la table des commandes de cartes (card_orders)
CREATE TABLE IF NOT EXISTS card_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'paid', 'merited', 'delivered')),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('izichange_pay', 'merit')),
  payment_reference VARCHAR(255),
  amount_paid INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 7. Indexation de card_orders
CREATE INDEX IF NOT EXISTS idx_card_orders_donor_id ON card_orders (donor_id);
CREATE INDEX IF NOT EXISTS idx_card_orders_status ON card_orders (status);

-- 8. Activation RLS pour card_orders
ALTER TABLE card_orders ENABLE ROW LEVEL SECURITY;

-- 9. Politiques RLS pour card_orders
DROP POLICY IF EXISTS "Donneurs voient leurs propres commandes" ON card_orders;
CREATE POLICY "Donneurs voient leurs propres commandes"
  ON card_orders FOR SELECT
  USING (donor_id = auth.uid());

DROP POLICY IF EXISTS "Donneurs creent leurs propres commandes" ON card_orders;
CREATE POLICY "Donneurs creent leurs propres commandes"
  ON card_orders FOR INSERT
  WITH CHECK (donor_id = auth.uid());

DROP POLICY IF EXISTS "Admins voient toutes les commandes" ON card_orders;
CREATE POLICY "Admins voient toutes les commandes"
  ON card_orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('org_admin', 'super_admin')
    )
  );
