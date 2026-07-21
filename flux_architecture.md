# Architecture & Flux — Bitcoin Blood (Backend)

> **Audience** : Développeurs frontend, agents IA, nouveaux contributeurs.
> Ce document est la **source de vérité** du backend. Il décrit l'architecture générale, les flux de données, les modules, tous les endpoints disponibles avec leurs paramètres et comportements.

---

## 1. Vue d'ensemble

### Stack technique

| Couche          | Technologie                                                                    |
| --------------- | ------------------------------------------------------------------------------ |
| Framework       | Next.js 15 (App Router) — Route Handlers uniquement                            |
| Langage         | TypeScript strict                                                              |
| Base de données | Supabase (PostgreSQL + Auth + RLS)                                             |
| Validation      | Zod sur toutes les entrées                                                     |
| Tests           | Vitest (38 tests, 100% au vert)                                                |
| Bitcoin         | OpenTimestamps (horodatage), BIP-322 (signature), Breez Liquid SDK (Lightning) |
| Emails          | Supabase Edge Function (`send-email`)                                          |

### Acteurs de la plateforme

```
┌──────────────┬─────────────────────┬────────────────┬──────────────────┐
│   DONNEUR    │   HÔPITAL / ONG     │  SUPER ADMIN   │  PUBLIC (Scan)   │
│  (Citoyen)   │ (Structure de santé)│ (Bitcoin Blood)│  QR Code carte   │
├──────────────┼─────────────────────┼────────────────┼──────────────────┤
│ S'inscrit    │ Crée urgences       │ Gère les orgas │ Vérifie une      │
│ Donne son    │ Lance campagnes     │ Supervise tout │ carte donneur    │
│ sang         │ Récompense donneurs │ Accès total    │ sans compte      │
│ Reçoit des   │ Voit les donneurs   │                │                  │
│ sats         │ compatibles         │                │                  │
└──────────────┴─────────────────────┴────────────────┴──────────────────┘
```

---

## 2. Architecture des modules

Chaque module est **auto-contenu** dans `src/modules/<nom>/` :

```
src/
├── app/api/v1/               ← Route Handlers Next.js (contrôleurs HTTP)
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   └── register/route.ts
│   ├── campaigns/route.ts
│   ├── donors/route.ts
│   ├── emergencies/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── health/route.ts
│   ├── search/route.ts
│   └── verify/[id]/route.ts
│
├── modules/                  ← Logique métier (services)
│   ├── auth/                 ← Connexion, inscription, session
│   ├── bitcoin/              ← OTS, BIP-322, Breez Lightning, Rewards
│   ├── campaigns/            ← Campagnes + envoi via Supabase Edge Function
│   ├── donors/               ← Inscription et profil donneur
│   ├── emergencies/          ← Alertes d'urgence sanguine
│   └── matching/             ← Blood Emergency AI (algorithme de scoring)
│
├── lib/
│   ├── api/errors.ts         ← Codes d'erreur métier stables
│   ├── api/response.ts       ← Helpers success() / failure() / handleApiError()
│   ├── env.ts                ← Validation des variables d'env (Zod)
│   └── supabase/server.ts    ← Clients Supabase (session + admin)
│
└── middleware.ts             ← Protection des routes (auth Supabase JWT)
```

### Convention de réponse API

**Toutes** les réponses suivent ce format normalisé :

```json
// Succès
{ "data": { ... }, "meta": {} }

// Erreur
{ "error": { "code": "forbidden", "message": "...", "details": {} } }
```

Les codes d'erreur sont **stables** : `bad_request`, `unauthorized`, `forbidden`, `not_found`, `conflict`, `validation_error`, `rate_limited`, `internal_error`.

---

## 3. Sécurité & Middleware

### Protection des routes

Le middleware `src/middleware.ts` protège **toutes** les routes `/api/v1/*` via le JWT Supabase, à l'exception des routes publiques :

| Route                    | Accès                          |
| ------------------------ | ------------------------------ |
| `GET /api/v1/health`     | 🌐 Public                      |
| `POST /api/v1/donors`    | 🌐 Public (inscription)        |
| `GET /api/v1/verify/*`   | 🌐 Public (scan QR)            |
| Toutes les autres routes | 🔒 Session requise (401 sinon) |

### Double protection anti-IDOR

En plus du middleware, chaque contrôleur **réinjecte** l'identifiant de l'organisation depuis la session serveur. Un hôpital ne peut jamais agir au nom d'un autre :

```typescript
// Sécurité : on ne lit PAS le hospitalId depuis le body du client
body.hospitalId = user.organizationId; // Toujours depuis la session
```

### RLS Supabase (Row Level Security)

Toutes les tables ont des politiques RLS activées en base. C'est une **deuxième barrière indépendante** du code applicatif. Un bug de code ne peut pas contourner la RLS.

---

## 4. Schéma de la base de données

```
┌────────────────────────┐     ┌──────────────────────┐
│        donors          │     │     organizations    │
│────────────────────────│     │──────────────────────│
│ id UUID ──────────────►│auth │ id UUID (PK)         │
│ (FK → auth.users)      │     │ name VARCHAR         │
│ first_name VARCHAR      │     │ type ENUM            │
│ last_name VARCHAR       │     │   (hospital/ong/     │
│ email VARCHAR UNIQUE    │     │    collect)          │
│ phone_number VARCHAR    │     │ latitude DOUBLE      │
│ blood_type VARCHAR      │     │ longitude DOUBLE     │
│ city VARCHAR            │     │ city VARCHAR         │
│ latitude DOUBLE         │     │ contact_email VARCHAR│
│ longitude DOUBLE        │     │ verified BOOLEAN     │
│ age INTEGER             │     │ created_at TIMESTAMPZ│
│ available BOOLEAN       │     └──────────┬───────────┘
│ bitcoin_address VARCHAR │                 │
│ profile_hash CHAR(64)   │     ┌──────────▼───────────┐
│ ots_proof TEXT          │     │    user_profiles     │
│ created_at TIMESTAMPZ   │     │──────────────────────│
└────────────────────────┘     │ id UUID (FK auth)    │
                                │ organization_id UUID │
                                │ role ENUM            │
                                │   (super_admin /     │
                                │    org_admin)        │
                                │ created_at TIMESTAMPZ│
                                └──────────────────────┘

┌────────────────────────┐     ┌──────────────────────┐
│      emergencies       │     │      campaigns       │
│────────────────────────│     │──────────────────────│
│ id UUID (PK)           │     │ id UUID (PK)         │
│ hospital_id UUID (FK)  │     │ hospital_id UUID (FK)│
│ blood_type VARCHAR      │     │ title VARCHAR        │
│ quantity_needed INTEGER │     │ type ENUM            │
│ city VARCHAR            │     │   (targeted/general) │
│ latitude DOUBLE         │     │ target_blood_type    │
│ longitude DOUBLE        │     │ city VARCHAR         │
│ status ENUM             │     │ latitude DOUBLE      │
│   (active/resolved/    │     │ longitude DOUBLE     │
│    cancelled)          │     │ radius_km INTEGER    │
│ created_at TIMESTAMPZ   │     │ emails_sent INTEGER  │
└────────────────────────┘     │ responses_count INT  │
                                │ status VARCHAR       │
                                │ created_at TIMESTAMPZ│
                                └──────────────────────┘

┌────────────────────────┐
│      reward_logs       │
│────────────────────────│
│ id UUID (PK)           │
│ donor_id UUID (FK)     │
│ hospital_id UUID (FK)  │
│ sats_amount INTEGER    │
│ status ENUM            │
│   (pending/completed/  │
│    failed)             │
│ bolt11_invoice TEXT    │
│ payment_hash VARCHAR   │
│ error_message TEXT     │
│ created_at TIMESTAMPZ  │
└────────────────────────┘
```

---

## 5. Endpoints par module

### 🔐 Module AUTH — `src/modules/auth/`

**Service** : `auth.service.ts`

| Méthode | Endpoint                | Auth       | Description                                               |
| ------- | ----------------------- | ---------- | --------------------------------------------------------- |
| `POST`  | `/api/v1/auth/register` | 🌐 Public  | Crée un compte organisation (hôpital/ONG) + admin associé |
| `POST`  | `/api/v1/auth/login`    | 🌐 Public  | Connexion, retourne une session cookie HttpOnly           |
| `POST`  | `/api/v1/auth/logout`   | 🔒 Session | Déconnecte et détruit la session cookie                   |

#### `POST /api/v1/auth/register`

```json
// Body
{
  "email": "admin@hopital.bj",
  "password": "••••••••",
  "name": "CNHU Cotonou",
  "type": "hospital",
  "city": "Cotonou",
  "latitude": 6.365,
  "longitude": 2.419,
  "contactEmail": "contact@cnhu.bj"
}

// Réponse 201
{
  "data": {
    "user": { "id": "uuid", "email": "..." },
    "organization": { "id": "uuid", "name": "CNHU Cotonou", ... }
  }
}
```

> **Rollback complet** : Si l'insertion de l'organisation ou du profil en base échoue, le compte Supabase Auth est supprimé automatiquement via la clé `service_role`. Aucun compte orphelin ne peut exister.

#### `POST /api/v1/auth/login`

```json
// Body
{ "email": "admin@hopital.bj", "password": "••••••••" }

// Réponse 200 — session gérée par cookie HttpOnly (Supabase SSR)
{ "data": { "user": { "id": "...", "email": "..." } } }
```

---

### 🩸 Module DONORS — `src/modules/donors/`

**Service** : `donor.service.ts`

| Méthode | Endpoint                      | Auth         | Description                                                                 |
| ------- | ----------------------------- | ------------ | --------------------------------------------------------------------------- |
| `POST`  | `/api/v1/donors`              | 🌐 Public    | Inscrit un nouveau donneur (Auth + profil)                                  |
| `GET`   | `/api/v1/donors`              | 🔒 Session   | Récupère tous les donneurs validés                                          |
| `PATCH` | `/api/v1/donors/:id/validate` | 🔒 org_admin | Valide un donneur (effectué par l'administrateur d'un hôpital après un don) |

#### `POST /api/v1/donors`

```json
// Body
{
  "firstName": "Kofi",
  "lastName": "Mensah",
  "email": "kofi@example.com",
  "password": "••••••••",
  "phoneNumber": "+22961000000",
  "bloodType": "O-",
  "city": "Cotonou",
  "latitude": 6.365,
  "longitude": 2.419,
  "age": 28,
  "available": true,
  "bitcoinAddress": "bc1q...",
  "profileHash": "sha256...",
  "bip322Signature": "signature..."
}

// Réponse 201
{
  "data": {
    "id": "uuid",
    "firstName": "Kofi",
    "bloodType": "O-",
    "profileHash": "sha256...",
    "validated": false,
    "createdAt": "2026-06-30T..."
  }
}
```

> **Flux interne** :
>
> 1. Vérification signature BIP-322 (preuve de possession du wallet Bitcoin)
> 2. Horodatage du `profileHash` sur Bitcoin (OpenTimestamps)
> 3. Inscription dans `auth.users` Supabase
> 4. Insertion du profil dans la table `donors` (avec rollback Auth si échec)

#### `GET /api/v1/donors`

```json
// Réponse 200
{
  "data": [
    {
      "id": "uuid",
      "firstName": "Kofi",
      "lastName": "Mensah",
      "email": "kofi@example.com",
      "bloodType": "O-",
      "city": "Cotonou",
      "validated": true,
      "createdAt": "2026-06-30T..."
    }
  ]
}
```

#### `PATCH /api/v1/donors/:id/validate`

```json
// Réponse 200
{
  "data": {
    "message": "Donneur validé avec succès.",
    "donor": {
      "id": "uuid",
      "firstName": "Kofi",
      "lastName": "Mensah",
      "validated": true,
      ...
    }
  }
}
```

---

### 🧠 Module SEARCH / MATCHING — `src/modules/matching/`

**Service** : `matching.service.ts`

| Méthode | Endpoint         | Auth       | Description                                          |
| ------- | ---------------- | ---------- | ---------------------------------------------------- |
| `GET`   | `/api/v1/search` | 🔒 Session | Recherche des donneurs compatibles (classique ou IA) |

#### `GET /api/v1/search`

| Paramètre   | Type                               | Requis | Description                       |
| ----------- | ---------------------------------- | ------ | --------------------------------- |
| `bloodType` | `A+\|A-\|B+\|B-\|AB+\|AB-\|O+\|O-` | ✅     | Groupe sanguin du receveur        |
| `lat`       | `number`                           | ✅     | Latitude du point de recherche    |
| `lon`       | `number`                           | ✅     | Longitude du point de recherche   |
| `ai`        | `boolean`                          | ❌     | Active le mode Blood Emergency AI |

```json
// Exemple : GET /api/v1/search?bloodType=O-&lat=6.365&lon=2.419&ai=true

// Réponse (mode ai=true)
{
  "data": {
    "success": true,
    "ai": true,
    "matches": [
      {
        "id": "uuid",
        "bloodType": "O-",
        "distanceKm": 1.8,
        "score": 95,
        "explanation": "Compatibilité parfaite (O-). Distance : 1.8 km. Donneur régulier (3 dons validés).",
        "historyCount": 3
      }
    ]
  }
}
```

#### Algorithme Blood Emergency AI (score /100)

| Critère                | Points      | Logique                                                   |
| ---------------------- | ----------- | --------------------------------------------------------- |
| **Proximité**          | 0–100 pts   | `max(0, 100 - distanceKm × 5)`                            |
| **Groupe exact**       | +30 pts     | Groupe identique au receveur (préserve les O- universels) |
| **Historique de dons** | +10 pts/don | Basé sur `reward_logs` (max +40 pts)                      |

> Sans `ai=true` : tri simple par distance Haversine, top 10.

---

### 🚨 Module EMERGENCIES — `src/modules/emergencies/`

**Service** : `emergency.service.ts`

| Méthode  | Endpoint                  | Auth         | Description                                   |
| -------- | ------------------------- | ------------ | --------------------------------------------- |
| `POST`   | `/api/v1/emergencies`     | 🔒 org_admin | Déclare une nouvelle alerte de manque de sang |
| `GET`    | `/api/v1/emergencies`     | 🔒 Session   | Liste les urgences (toutes ou par hôpital)    |
| `GET`    | `/api/v1/emergencies/:id` | 🔒 Session   | Récupère une urgence spécifique               |
| `PATCH`  | `/api/v1/emergencies/:id` | 🔒 org_admin | Met à jour le statut d'une urgence            |
| `DELETE` | `/api/v1/emergencies/:id` | 🔒 org_admin | Supprime une urgence                          |

#### `POST /api/v1/emergencies`

```json
// Body
{
  "bloodType": "O-",
  "quantityNeeded": 2,
  "city": "Cotonou",
  "latitude": 6.365,
  "longitude": 2.419
}
// ⚠️ hospitalId est injecté automatiquement depuis la session — le client ne peut pas le forger.

// Réponse 201
{ "data": { "id": "uuid", "bloodType": "O-", "status": "active", ... } }
```

#### `GET /api/v1/emergencies`

| Paramètre            | Auth          | Comportement                                    |
| -------------------- | ------------- | ----------------------------------------------- |
| Aucun                | Session       | Retourne toutes les urgences actives            |
| `?hospitalId=<uuid>` | `org_admin`   | Retourne uniquement les urgences de son hôpital |
| `?hospitalId=<uuid>` | `super_admin` | Peut consulter n'importe quel hôpital           |

#### `PATCH /api/v1/emergencies/:id`

```json
// Body — met à jour le statut
{ "status": "resolved" } // ou "cancelled"
// ⚠️ Rejet 403 si l'urgence n'appartient pas à l'hôpital de l'utilisateur connecté
```

---

### 📣 Module CAMPAIGNS — `src/modules/campaigns/`

**Service** : `campaign.service.ts`

| Méthode | Endpoint            | Auth         | Description                                                |
| ------- | ------------------- | ------------ | ---------------------------------------------------------- |
| `POST`  | `/api/v1/campaigns` | 🔒 org_admin | Crée une campagne et envoie les emails aux donneurs ciblés |
| `GET`   | `/api/v1/campaigns` | 🔒 org_admin | Liste les campagnes de l'hôpital connecté                  |

#### `POST /api/v1/campaigns`

```json
// Body
{
  "title": "Campagne urgente O-",
  "type": "targeted",
  "targetBloodType": "O-",
  "city": "Cotonou",
  "latitude": 6.365,
  "longitude": 2.419,
  "radiusKm": 15
}

// Réponse 201
{
  "data": {
    "id": "uuid",
    "title": "Campagne urgente O-",
    "emailsSent": 23,
    "responsesCount": 0,
    "status": "active",
    ...
  }
}
```

> **Flux interne** :
>
> 1. Récupère le nom de l'hôpital depuis la base
> 2. Filtre les donneurs compatibles dans le rayon (Haversine)
> 3. Envoie les emails par lots de 50 via Supabase Edge Function `send-email` (`Promise.allSettled`)
> 4. Mode simulation si l'appel échoue (logs console)
> 5. Sauvegarde la campagne avec le compte d'emails envoyés

#### `GET /api/v1/campaigns`

| Paramètre            | Auth          | Comportement                        |
| -------------------- | ------------- | ----------------------------------- |
| Aucun                | `org_admin`   | Ses propres campagnes               |
| `?hospitalId=<uuid>` | `super_admin` | Campagnes de n'importe quel hôpital |

---

### ⚡ Module BITCOIN — `src/modules/bitcoin/`

**Services** : `ots.service.ts`, `wallet.service.ts`, `breez.service.ts`, `reward.service.ts`

| Méthode | Endpoint             | Auth         | Description                                  |
| ------- | -------------------- | ------------ | -------------------------------------------- |
| `GET`   | `/api/v1/verify/:id` | 🌐 Public    | Vérifie la carte d'un donneur (OTS Bitcoin)  |
| `POST`  | `/api/v1/verify/:id` | 🔒 org_admin | Envoie une récompense en Satoshis au donneur |

#### `GET /api/v1/verify/:id` — Scan carte QR

```json
// Réponse 200
{
  "data": {
    "donor": {
      "id": "uuid",
      "bloodType": "O-",
      "bitcoinAddress": "bc1q...",
      "profileHash": "sha256...",
      "hasOtsProof": true,
      "createdAt": "2026-06-30T..."
    },
    "verification": {
      "isTimestampVerified": true,
      "details": { "height": 850432, "timestamp": 1750000000 }
    }
  }
}
```

> **Garantie** : Si `isTimestampVerified: true`, le profil a été ancré dans la blockchain Bitcoin. Il ne peut pas avoir été falsifié après cette date.

#### `POST /api/v1/verify/:id` — Récompense Lightning

```json
// Body
{
  "bolt11Invoice": "lnbc1000u1...",
  "satsAmount": 1000
}

// Réponse 200
{
  "data": {
    "message": "Récompense envoyée avec succès.",
    "reward": {
      "id": "uuid",
      "status": "completed",
      "paymentHash": "txhash...",
      "satsAmount": 1000
    }
  }
}

// Réponse 409 si déjà récompensé il y a moins de 60 jours
{
  "error": {
    "code": "conflict",
    "message": "Le donneur a déjà reçu une récompense au cours des 60 derniers jours."
  }
}
```

> **Flux interne** :
>
> 1. Vérification session + organisationId
> 2. Vérification existence du donneur
> 3. **Vérification réglementaire 60 jours** (retourne 409 si doublon)
> 4. Validation de la facture BOLT11 (Zod, min 10 chars)
> 5. Création d'un log `reward_logs` en statut `pending`
> 6. Exécution du paiement via Breez Liquid SDK (ou simulation si non configuré)
> 7. Mise à jour du log en `completed` ou `failed`

#### Breez Liquid SDK — Modes de fonctionnement

| Condition                                         | Mode          | Comportement                          |
| ------------------------------------------------- | ------------- | ------------------------------------- |
| SDK installé + `BREEZ_API_KEY` + `BREEZ_MNEMONIC` | 🟢 Production | Paiement Lightning réel               |
| Variables manquantes                              | 🟡 Simulation | Hash aléatoire généré, log enregistré |
| SDK non installé                                  | 🟡 Simulation | Idem                                  |

---

### 🏥 Module HEALTH

| Méthode | Endpoint         | Auth      | Description                       |
| ------- | ---------------- | --------- | --------------------------------- |
| `GET`   | `/api/v1/health` | 🌐 Public | Vérifie que le serveur fonctionne |

```json
// Réponse 200
{ "status": "ok", "timestamp": "2026-06-30T..." }
```

---

## 6. Flux complets de bout en bout

### Flux 1 — Inscription d'un donneur

```
DONNEUR (formulaire)
     │
     │  1. Saisit : prénom, nom, email, mot de passe, téléphone,
     │             groupe sanguin, ville, GPS, âge, adresse Bitcoin
     ▼
POST /api/v1/donors                              [Public]
     │
     │  2. Validation Zod du body
     │  3. Vérification signature BIP-322 (prouve la possession du wallet)
     │  4. Horodatage du profileHash → OpenTimestamps (Bitcoin)
     │  5. Inscription dans auth.users (Supabase Auth)
     │  6. Insertion dans la table donors
     │     └─ Si erreur → deleteUser() rollback Auth
     ▼
[Supabase DB] → Table donors (profil persisté)
     │
     │  7. Retourne l'UUID du donneur
     ▼
Le frontend génère la Carte Bitcoin Blood (QR Code → UUID)
```

### Flux 2 — Urgence sanguine + Blood Emergency AI

```
MÉDECIN (Dashboard)
     │
     │  1. Signale une urgence (groupe, quantité, localisation)
     ▼
POST /api/v1/emergencies                         [org_admin]
     │
     │  2. Injecte hospitalId depuis la session (sécurité)
     │  3. Sauvegarde l'urgence en base (statut: active)
     ▼
GET /api/v1/search?bloodType=O-&lat=...&lon=...&ai=true   [org_admin]
     │
     │  4. Charge les donneurs disponibles (max 200)
     │  5. Blood Emergency AI :
     │     → Score de proximité (Haversine)
     │     → Score de groupe sanguin exact (+30 pts)
     │     → Score d'historique de dons (reward_logs +10/don)
     │     → Explication textuelle générée
     │  6. Retourne le top 10 scoré
     ▼
MÉDECIN voit la liste priorisée avec scores et explications
```

### Flux 3 — Campagne de don avec email ciblé

```
HÔPITAL (Dashboard)
     │
     │  1. Crée une campagne (type, groupe, rayon, ville)
     ▼
POST /api/v1/campaigns                           [org_admin]
     │
     │  2. Injecte hospitalId depuis la session
     │  3. Récupère le nom de l'hôpital depuis la base
     │  4. Filtre les donneurs compatibles dans le rayon
     │  5. Envoie les emails par lots de 50 via Supabase Edge Function
     │     └─ Fallback simulation si l'envoi échoue
     │  6. Sauvegarde campagne avec compteur emails_sent
     ▼
[Supabase DB] → Table campaigns (persistée)
     │
DONNEURS reçoivent un email personnalisé (nom, groupe sanguin, hôpital)
```

### Flux 4 — Scan QR + Vérification + Récompense

```
HÔPITAL (Accueil physique)
     │
     │  1. Scan du QR Code de la carte donneur → UUID extrait
     ▼
GET /api/v1/verify/{uuid}                        [Public]
     │
     │  2. Récupère le profil depuis Supabase
     │  3. Vérifie la preuve OTS (ancrage Bitcoin)
     │  4. Retourne : groupe sanguin, statut, preuve bitcoin
     ▼
HÔPITAL valide physiquement le don
     │
     ▼
POST /api/v1/verify/{uuid}                       [org_admin]
     │
     │  5. Vérifie : pas de récompense dans les 60 derniers jours
     │     └─ Si oui → 409 Conflict
     │  6. Crée log reward_logs en statut pending
     │  7. Appelle Breez Liquid SDK (paiement Lightning BOLT11)
     │  8. Met à jour le log en completed ou failed
     ▼
DONNEUR reçoit ses Satoshis instantanément sur son wallet Bitcoin
```

---

## 7. Variables d'environnement requises

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (obligatoire)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # Requis pour rollback Auth

# Base de données
DATABASE_URL=postgresql://...

# Breez Lightning (optionnel — simulation si absent)
BREEZ_API_KEY=votre_cle_api_breez
BREEZ_MNEMONIC="votre phrase de 12 ou 24 mots"
BREEZ_WORKING_DIR=./.breez_state

# Aucun paramètre d'e-mail supplémentaire n'est requis.
# Supabase utilise sa configuration SMTP interne ou ses Edge Functions.
```

---

## 8. Statut de toutes les fonctionnalités

| Fonctionnalité                                | Statut      | Tests   |
| --------------------------------------------- | ----------- | ------- |
| Auth Supabase (login / logout / register)     | ✅ Fait     | 7 tests |
| Table `donors` + inscription Auth liée        | ✅ Fait     | 3 tests |
| Rollback Auth si erreur d'inscription         | ✅ Fait     | —       |
| Signature BIP-322 (validation wallet)         | ✅ Fait     | —       |
| Horodatage OTS Bitcoin                        | ✅ Fait     | —       |
| Matching ABO/Haversine (`/api/v1/search`)     | ✅ Fait     | 2 tests |
| Blood Emergency AI (scoring multi-critères)   | ✅ Fait     | 2 tests |
| Vérification carte donneur (OTS)              | ✅ Fait     | 1 test  |
| Table `emergencies` + API CRUD complète       | ✅ Fait     | 9 tests |
| Table `campaigns` + API                       | ✅ Fait     | 1 test  |
| Envoi emails réels via Supabase Edge Function | ✅ Fait     | —       |
| Middleware JWT + protection des routes        | ✅ Fait     | —       |
| RLS sur toutes les tables                     | ✅ Fait     | —       |
| Récompenses Lightning (Breez Liquid SDK)      | ✅ Fait     | 2 tests |
| Protection 60 jours (anti-doublon récompense) | ✅ Fait     | 1 test  |
| Audit complet des paiements (reward_logs)     | ✅ Fait     | —       |
| Dashboard Super Admin (frontend)              | ⏳ Frontend | —       |
| Dashboard Admin Hôpital (frontend)            | ⏳ Frontend | —       |
| App Mobile Donneur (frontend)                 | ⏳ Frontend | —       |
