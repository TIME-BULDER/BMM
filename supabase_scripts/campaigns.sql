-- =============================================
-- Bitcoin Blood — Gestion des Campagnes
-- À exécuter dans Supabase > SQL Editor
-- Prérequis : tables organizations et user_profiles déjà créées
-- =============================================

CREATE TYPE campaign_type AS ENUM ('targeted', 'general');

CREATE TABLE campaigns (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title             VARCHAR(255) NOT NULL,
  type              campaign_type NOT NULL,
  target_blood_type VARCHAR(3) CHECK (
    target_blood_type IS NULL OR
    target_blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')
  ), -- NULL si type = 'general'
  city              VARCHAR(255) NOT NULL,
  latitude          DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude         DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  radius_km         INTEGER NOT NULL DEFAULT 20 CHECK (radius_km BETWEEN 1 AND 500),
  emails_sent       INTEGER NOT NULL DEFAULT 0,
  responses_count   INTEGER NOT NULL DEFAULT 0,
  status            VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Index pour accélérer les requêtes du dashboard
CREATE INDEX idx_campaigns_hospital   ON campaigns (hospital_id);
CREATE INDEX idx_campaigns_created_at ON campaigns (created_at DESC);

-- -----------------------------------------------
-- Row Level Security (RLS)
-- -----------------------------------------------
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Super admin voit et gère TOUT
CREATE POLICY "Super admin gère toutes les campagnes"
  ON campaigns FOR ALL
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Les org admins voient uniquement les campagnes de leur hôpital
CREATE POLICY "Org admin voit les campagnes de son hôpital"
  ON campaigns FOR SELECT
  USING (
    hospital_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

-- Les org admins peuvent créer des campagnes pour leur hôpital uniquement
CREATE POLICY "Org admin peut créer des campagnes"
  ON campaigns FOR INSERT
  WITH CHECK (
    hospital_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );
