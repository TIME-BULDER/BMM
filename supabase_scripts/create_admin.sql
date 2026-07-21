-- =========================================================================
-- Bitcoin Blood — Création du compte SUPER-ADMIN
-- À exécuter dans l'éditeur SQL du Dashboard Supabase.
--
-- Identifiants de connexion :
--     Email    : admin@bitcoinblood.africa
--     Mot de passe : E6k5U7apTtub-Bb7        <-- À CHANGER après la 1re connexion
--
-- Deux méthodes. La MÉTHODE A (dashboard) est la plus fiable ; la MÉTHODE B
-- (100% SQL) est fournie pour aller vite. N'exécuter qu'UNE seule des deux.
-- =========================================================================


-- =========================================================================
-- MÉTHODE A (recommandée) — Créer l'utilisateur via le Dashboard, puis SQL
-- =========================================================================
-- 1. Dashboard Supabase → Authentication → Users → "Add user"
--       Email : admin@bitcoinblood.africa
--       Password : E6k5U7apTtub-Bb7
--       ✅ cocher "Auto Confirm User"
-- 2. Puis exécuter ce bloc pour élever le compte au rang de super-admin :

UPDATE user_profiles
SET role = 'super_admin', organization_id = NULL
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@bitcoinblood.africa');

-- Si aucune ligne n'est mise à jour (trigger absent), l'insérer :
INSERT INTO user_profiles (id, role, organization_id)
SELECT id, 'super_admin', NULL
FROM auth.users
WHERE email = 'admin@bitcoinblood.africa'
ON CONFLICT (id) DO UPDATE
  SET role = 'super_admin', organization_id = NULL;


-- =========================================================================
-- MÉTHODE B (alternative, tout en SQL) — Décommenter pour l'utiliser.
-- Crée directement l'utilisateur Auth + son profil super-admin.
-- =========================================================================
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
--
-- DO $$
-- DECLARE
--   new_user_id uuid := gen_random_uuid();
-- BEGIN
--   IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@bitcoinblood.africa') THEN
--     RAISE NOTICE 'Utilisateur déjà existant, rien à faire.';
--     RETURN;
--   END IF;
--
--   INSERT INTO auth.users (
--     instance_id, id, aud, role, email, encrypted_password,
--     email_confirmed_at, created_at, updated_at,
--     raw_app_meta_data, raw_user_meta_data,
--     confirmation_token, recovery_token, email_change_token_new, email_change
--   ) VALUES (
--     '00000000-0000-0000-0000-000000000000', new_user_id,
--     'authenticated', 'authenticated', 'admin@bitcoinblood.africa',
--     crypt('E6k5U7apTtub-Bb7', gen_salt('bf')),
--     now(), now(), now(),
--     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
--     '', '', '', ''
--   );
--
--   INSERT INTO auth.identities (
--     id, user_id, provider_id, identity_data, provider,
--     last_sign_in_at, created_at, updated_at
--   ) VALUES (
--     gen_random_uuid(), new_user_id, new_user_id::text,
--     jsonb_build_object('sub', new_user_id::text, 'email', 'admin@bitcoinblood.africa'),
--     'email', now(), now(), now()
--   );
--
--   INSERT INTO user_profiles (id, role, organization_id)
--   VALUES (new_user_id, 'super_admin', NULL)
--   ON CONFLICT (id) DO UPDATE
--     SET role = 'super_admin', organization_id = NULL;
-- END $$;
