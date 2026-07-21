-- =============================================
-- Bitcoin Blood — Gestion des Urgences
-- À exécuter dans Supabase > SQL Editor
-- Prérequis : tables organizations et user_profiles déjà créées
-- =============================================

CREATE TABLE emergencies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  blood_type        VARCHAR(3) NOT NULL CHECK (
    blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')
  ),
  quantity_needed   INTEGER NOT NULL DEFAULT 1 CHECK (quantity_needed >= 1),
  city              VARCHAR(255) NOT NULL,
  latitude          DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude         DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  status            VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Index pour accélérer les requêtes du dashboard et de recherche
CREATE INDEX idx_emergencies_hospital   ON emergencies (hospital_id);
CREATE INDEX idx_emergencies_status     ON emergencies (status);
CREATE INDEX idx_emergencies_created_at ON emergencies (created_at DESC);

-- -----------------------------------------------
-- Row Level Security (RLS)
-- -----------------------------------------------
ALTER TABLE emergencies ENABLE ROW LEVEL SECURITY;

-- Super admin voit et gère toutes les alertes d'urgence
CREATE POLICY "Super admin gère toutes les urgences"
  ON emergencies FOR ALL
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Les org admins voient uniquement les urgences de leur hôpital
CREATE POLICY "Org admin voit les urgences de son hôpital"
  ON emergencies FOR SELECT
  USING (
    hospital_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

-- Les org admins peuvent créer des urgences pour leur hôpital uniquement
CREATE POLICY "Org admin peut créer des urgences"
  ON emergencies FOR INSERT
  WITH CHECK (
    hospital_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

-- Les org admins peuvent modifier (résoudre/annuler) les urgences de leur hôpital uniquement
CREATE POLICY "Org admin peut modifier ses propres urgences"
  ON emergencies FOR UPDATE
  USING (
    hospital_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );
