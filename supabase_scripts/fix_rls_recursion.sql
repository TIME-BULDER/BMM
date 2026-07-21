-- =========================================================================
-- Bitcoin Blood — CORRECTIF CRITIQUE : récursion infinie des politiques RLS
-- À exécuter dans l'éditeur SQL du Dashboard Supabase.
--
-- SYMPTÔME : après connexion (admin, structure) ou inscription, l'app
-- « charge » puis renvoie sur la page de login.
--
-- CAUSE : les politiques RLS de `user_profiles` s'interrogeaient elles-mêmes
--   ( ... (SELECT role FROM user_profiles WHERE id = auth.uid()) ... )
-- ce qui déclenche l'erreur Postgres 42P17 « infinite recursion detected in
-- policy for relation user_profiles ». La lecture du profil (GET /auth/me)
-- échoue donc en 500, l'app croit l'utilisateur déconnecté et le renvoie
-- au login.
--
-- SOLUTION : des fonctions SECURITY DEFINER (qui contournent le RLS) pour
-- lire le rôle / l'organisation de l'utilisateur, puis des politiques
-- réécrites sans auto-référence. Idempotent.
-- =========================================================================

-- 1. Fonctions utilitaires (SECURITY DEFINER → pas de récursion RLS) --------
CREATE OR REPLACE FUNCTION public.current_user_role()
  RETURNS text
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = public
AS $$
  SELECT role::text FROM public.user_profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.current_user_org()
  RETURNS uuid
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = public
AS $$
  SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
$$;

-- 2. On repart d'une base saine : suppression de TOUTES les politiques
-- existantes sur les tables concernées (noms inconnus car la base a divergé).
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'user_profiles', 'organizations', 'donors',
        'campaigns', 'emergencies'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',
                   pol.policyname, pol.tablename);
  END LOOP;
END$$;

-- 3. Politiques réécrites --------------------------------------------------

-- user_profiles : chacun lit son profil ; le super-admin gère tout.
CREATE POLICY up_select_self ON public.user_profiles
  FOR SELECT
  USING (id = auth.uid() OR public.current_user_role() = 'super_admin');

CREATE POLICY up_admin_all ON public.user_profiles
  FOR ALL
  USING (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

-- organizations : lecture publique des structures vérifiées ; une structure
-- lit toujours la sienne (même non vérifiée) ; le super-admin gère tout.
CREATE POLICY org_select ON public.organizations
  FOR SELECT
  USING (
    verified = true
    OR public.current_user_role() = 'super_admin'
    OR id = public.current_user_org()
  );

CREATE POLICY org_admin_all ON public.organizations
  FOR ALL
  USING (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

-- donors : inscription et annuaire publics ; le donneur met à jour son
-- propre profil ; les admins peuvent modifier.
CREATE POLICY donors_insert_public ON public.donors
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY donors_select_public ON public.donors
  FOR SELECT
  USING (true);

CREATE POLICY donors_update ON public.donors
  FOR UPDATE
  USING (
    id = auth.uid()
    OR public.current_user_role() IN ('super_admin', 'org_admin')
  );

-- campaigns : super-admin total ; structure limitée à son hôpital.
CREATE POLICY campaigns_admin_all ON public.campaigns
  FOR ALL
  USING (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

CREATE POLICY campaigns_org_select ON public.campaigns
  FOR SELECT
  USING (hospital_id = public.current_user_org());

CREATE POLICY campaigns_org_insert ON public.campaigns
  FOR INSERT
  WITH CHECK (hospital_id = public.current_user_org());

-- emergencies : super-admin total ; structure limitée à son hôpital.
CREATE POLICY emergencies_admin_all ON public.emergencies
  FOR ALL
  USING (public.current_user_role() = 'super_admin')
  WITH CHECK (public.current_user_role() = 'super_admin');

CREATE POLICY emergencies_org_select ON public.emergencies
  FOR SELECT
  USING (hospital_id = public.current_user_org());

CREATE POLICY emergencies_org_insert ON public.emergencies
  FOR INSERT
  WITH CHECK (hospital_id = public.current_user_org());

CREATE POLICY emergencies_org_update ON public.emergencies
  FOR UPDATE
  USING (hospital_id = public.current_user_org());

-- 4. RLS reste activée sur toutes ces tables.
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergencies   ENABLE ROW LEVEL SECURITY;
