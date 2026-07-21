-- Réseau inter-centres : stock par composant et demandes de transfert.
-- À exécuter dans le SQL Editor de Supabase (après init.sql).

-- 1. Stock par composant
CREATE TABLE IF NOT EXISTS stock (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  component     VARCHAR(16) NOT NULL CHECK (component IN ('CGR','Plasma','Plaquettes')),
  blood_type    VARCHAR(3) NOT NULL CHECK (
    blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')
  ),
  units         INT NOT NULL DEFAULT 0 CHECK (units >= 0),
  expiring_soon INT NOT NULL DEFAULT 0 CHECK (expiring_soon >= 0),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE (hospital_id, component, blood_type)
);

-- 2. Demandes de transfert (dénormalisées pour éviter les jointures)
CREATE TABLE IF NOT EXISTS transfer_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component      VARCHAR(16) NOT NULL CHECK (component IN ('CGR','Plasma','Plaquettes')),
  blood_type     VARCHAR(3) NOT NULL CHECK (
    blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')
  ),
  quantity       INT NOT NULL CHECK (quantity >= 1),
  urgency        VARCHAR(16) NOT NULL CHECK (urgency IN ('vitale','haute','moderee')),
  requester_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  requester_name VARCHAR(255) NOT NULL,
  requester_city VARCHAR(255) NOT NULL,
  responder_id   UUID REFERENCES organizations(id) ON DELETE SET NULL,
  responder_name VARCHAR(255),
  status         VARCHAR(16) NOT NULL DEFAULT 'ouverte'
    CHECK (status IN ('ouverte','acceptée','en_transit','reçue','annulée')),
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_hospital ON stock (hospital_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfer_requests (status);

-- 3. RLS
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;

-- Stock : une organisation gère uniquement son propre stock ; le super-admin
-- voit tout. Les route handlers injectent déjà l'organisation de confiance.
DROP POLICY IF EXISTS "Org gère son stock" ON stock;
CREATE POLICY "Org gère son stock"
  ON stock FOR ALL
  USING (
    hospital_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  )
  WITH CHECK (
    hospital_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Transferts : visibles par toute organisation authentifiée (réseau).
DROP POLICY IF EXISTS "Réseau lit les transferts" ON transfer_requests;
CREATE POLICY "Réseau lit les transferts"
  ON transfer_requests FOR SELECT
  USING ((SELECT organization_id FROM user_profiles WHERE id = auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Org publie une demande" ON transfer_requests;
CREATE POLICY "Org publie une demande"
  ON transfer_requests FOR INSERT
  WITH CHECK (
    requester_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Org répond à une demande" ON transfer_requests;
CREATE POLICY "Org répond à une demande"
  ON transfer_requests FOR UPDATE
  USING ((SELECT organization_id FROM user_profiles WHERE id = auth.uid()) IS NOT NULL);

-- 4. Espace donneur : un donneur agit sur sa propre ligne (donors.id = auth.uid()).
DROP POLICY IF EXISTS "Le donneur modifie son profil" ON donors;
CREATE POLICY "Le donneur modifie son profil"
  ON donors FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- reward_logs : un donneur lit ses propres récompenses.
DROP POLICY IF EXISTS "Le donneur lit ses récompenses" ON reward_logs;
CREATE POLICY "Le donneur lit ses récompenses"
  ON reward_logs FOR SELECT
  USING (
    donor_id = auth.uid()
    OR hospital_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  );
