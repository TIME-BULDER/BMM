-- Demandes de carte de donneur (photo + validation par un administrateur).
--
-- Parcours : le donneur ajoute sa photo et demande une carte (numérique ou
-- physique) ; un administrateur valide ou refuse ; la carte est alors imprimée
-- (physique) ou disponible dans l'espace du donneur (numérique).
--
-- Pour la démo et le MVP, la photo est conservée en base (data URL compressée,
-- ~30 Ko). En production, préférer un bucket privé Supabase Storage et ne
-- stocker ici que le chemin du fichier.
--
-- Endpoints associés :
--   - GET/POST /api/v1/donors/me/card-request   (donneur : sa demande)
--   - GET      /api/v1/card-requests             (admin : liste)
--   - PATCH    /api/v1/card-requests/{id}        (admin : approve | reject)
--
-- À appliquer dans l'éditeur SQL du dashboard Supabase.

CREATE TABLE IF NOT EXISTS card_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id      uuid NOT NULL REFERENCES donors (id) ON DELETE CASCADE,
  photo         text,
  format        varchar(10) NOT NULL CHECK (format IN ('physical', 'digital')),
  status        varchar(12) NOT NULL DEFAULT 'requested'
                CHECK (status IN ('requested', 'approved', 'rejected')),
  reviewed_by   uuid REFERENCES auth.users (id),
  reviewed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (donor_id)
);

CREATE INDEX IF NOT EXISTS idx_card_requests_status ON card_requests (status);

-- RLS : le donneur gère sa propre demande ; les membres d'une structure /
-- administrateurs voient tout et changent le statut (les routes API appliquent
-- déjà ces contrôles). Sans ces politiques, l'accès via le client de session
-- est bloqué et la demande de carte échoue.
ALTER TABLE card_requests ENABLE ROW LEVEL SECURITY;

-- Le donneur gère uniquement sa propre demande.
DROP POLICY IF EXISTS card_requests_own ON card_requests;
CREATE POLICY card_requests_own ON card_requests
  FOR ALL
  USING (donor_id = auth.uid())
  WITH CHECK (donor_id = auth.uid());

-- Les membres d'une structure / administrateurs (présents dans user_profiles)
-- voient et traitent toutes les demandes.
DROP POLICY IF EXISTS card_requests_staff ON card_requests;
CREATE POLICY card_requests_staff ON card_requests
  FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid()));
