-- =========================================================================
-- Bitcoin Blood — Validation des structures & justificatifs
-- À exécuter dans l'éditeur SQL du Dashboard Supabase.
-- Idempotent : peut être relancé sans risque.
--
-- Ajoute :
--   1. Le type d'énumération des documents (org_document_type)
--   2. La table organization_documents (justificatifs uploadés)
--   3. Les colonnes de suivi de validation sur organizations
--   4. Le bucket privé Storage "org-documents"
-- =========================================================================

-- 1. Énumération des types de justificatifs -------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'org_document_type') THEN
    CREATE TYPE org_document_type AS ENUM (
      'license',            -- Autorisation / agrément d'exercice
      'registry',           -- Registre de commerce / statuts
      'representative_id'   -- Pièce d'identité du représentant légal
    );
  END IF;
END$$;

-- 2. Colonnes de suivi de la validation sur organizations -----------------
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS submitted_at      TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejection_reason  TEXT;

-- 3. Table des justificatifs ----------------------------------------------
CREATE TABLE IF NOT EXISTS organization_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  doc_type        org_document_type NOT NULL,
  storage_path    TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  uploaded_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (organization_id, doc_type)
);

CREATE INDEX IF NOT EXISTS idx_org_documents_org
  ON organization_documents (organization_id);

-- 4. Sécurité : RLS activée. Tous les accès applicatifs aux documents
-- passent par la clé service_role côté serveur (routes API), qui contourne
-- RLS. On n'ouvre donc aucune politique publique : la table reste fermée.
ALTER TABLE organization_documents ENABLE ROW LEVEL SECURITY;

-- 5. Bucket Storage privé pour les justificatifs --------------------------
-- Créé en privé (public = false). L'accès se fait via des URLs signées
-- générées côté serveur pour le super-admin.
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-documents', 'org-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Aucune politique Storage publique : les uploads et lectures se font via la
-- clé service_role (routes API), qui contourne le RLS Storage.
