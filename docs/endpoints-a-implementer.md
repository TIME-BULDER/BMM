# Endpoints backend — état d'implémentation

Le frontend est entièrement câblé (chaque hook a une branche réelle activée
quand `NEXT_PUBLIC_AUTH_BYPASS=false`). Ce document suit ce qui est fait et ce
qui reste.

Conventions : préfixe `/api/v1`, enveloppe `{ data, meta }` / `{ error }`,
validation Zod, authentification par session Supabase.

## ✅ Déjà en place (existant)

`auth` (login, register, logout, me), `donors` (POST + GET liste,
`:id/validate`), `emergencies` (CRUD + `:id`), `campaigns` (GET/POST),
`search`, `verify/:id` (GET + POST récompense), `health`.

## ✅ Ajoutés dans ce lot

| Méthode | Route                              | Rôle          | Statut                         |
| ------- | ---------------------------------- | ------------- | ------------------------------ |
| GET     | `/api/v1/organizations`            | super_admin   | ✅ route + service             |
| PATCH   | `/api/v1/organizations/:id/verify` | super_admin   | ✅                             |
| GET     | `/api/v1/stock`                    | org_admin     | ✅ route + service             |
| GET     | `/api/v1/transfers`                | org_admin     | ✅                             |
| POST    | `/api/v1/transfers`                | org_admin     | ✅                             |
| POST    | `/api/v1/transfers/:id/respond`    | org_admin     | ✅                             |
| GET     | `/api/v1/donors/me`                | donneur       | ✅ (donors.id = auth.users.id) |
| PATCH   | `/api/v1/donors/:id`               | donneur (soi) | ✅                             |
| GET     | `/api/v1/donors/:id/rewards`       | donneur/org   | ✅                             |

## ⚙️ À faire côté Supabase (obligatoire pour le runtime)

1. **Exécuter `supabase_scripts/network.sql`** dans le SQL Editor : crée les
   tables `stock` et `transfer_requests`, et ajoute les politiques RLS
   (stock par org, réseau visible, donneur modifie/ lit son profil et ses
   récompenses).
2. (Déjà fait si `init.sql` exécuté) `organizations`, `donors`, `reward_logs`
   existent.

## 🔌 Reste à câbler côté frontend

- **Espace donneur** (`/donneur`) : encore alimenté par les données de démo.
  Le brancher via `donorsApi.me()` / `donorsApi.update()` /
  `donorsApi.rewards()` — nécessite un **flux de connexion donneur** (page de
  login donneur + garde), à ajouter.

## Champs `donors` optionnels (confort produit)

Pour l'espace donneur enrichi : `phenotype`, `rarity`, `cmv_negative`,
`preferred_donation`, éligibilité (`eligible_at` / `deferred_reason`).
Non requis par les endpoints actuels.

## Basculer démo → réel

`NEXT_PUBLIC_AUTH_BYPASS=false` puis relancer. Les écrans structures
(dashboard, alertes, campagnes, annuaire, recherche, récompenses, réseau,
console super-admin) appellent alors les vrais endpoints.
