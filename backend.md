# Bitcoin Blood — Documentation Backend

> Explication du fonctionnement du backend, des outils utilisés et des flux de données, sans détails techniques superflus.

---

## 🧱 Stack technique utilisée

| Couche                | Outil                         | Rôle                                           |
| --------------------- | ----------------------------- | ---------------------------------------------- |
| Framework             | **Next.js 15** (App Router)   | Gère les routes API du backend                 |
| Base de données       | **Supabase** (PostgreSQL)     | Stocke les profils des donneurs                |
| Validation            | **Zod**                       | Filtre et vérifie toutes les données entrantes |
| Cryptographie Bitcoin | **bip322-js**                 | Vérifie les signatures numériques des donneurs |
| Horodatage            | **javascript-opentimestamps** | Ancre les profils sur la blockchain Bitcoin    |
| Qualité du code       | **ESLint + Prettier + Husky** | Garantit un code propre à chaque commit        |

---

## 🗂️ Organisation du code (Architecture modulaire)

Le backend est découpé en **modules métiers** indépendants. Chaque module a une responsabilité unique et ne fait qu'une seule chose bien.

```
src/
├── modules/
│   ├── bitcoin/        → Tout ce qui touche à la cryptographie Bitcoin
│   ├── donors/         → Tout ce qui touche aux donneurs (données, règles)
│   └── matching/       → L'intelligence de recherche de compatibilité
│
├── app/api/v1/
│   ├── donors/         → Point d'entrée : inscription d'un donneur
│   ├── search/         → Point d'entrée : recherche d'urgence
│   └── verify/[id]/    → Point d'entrée : vérification d'une carte
│
└── lib/supabase/       → Connexion sécurisée à la base de données
```

---

## 🔄 Les 3 flux principaux

---

### Flux 1 — Inscription d'un Donneur

Ce flux permet à un citoyen de s'enregistrer comme donneur de sang sur la plateforme.

```
Le citoyen remplit le formulaire
           │
           ▼
   L'application lui génère
   une identité Bitcoin unique
   (une adresse + une signature numérique)
           │
           ▼
   Les données sont envoyées au serveur
   ┌─────────────────────────────────────┐
   │  Serveur vérifie 3 choses :         │
   │  1. Le formulaire est complet (Zod) │
   │  2. La signature Bitcoin est valide │
   │     (bip322-js)                     │
   │  3. Tout est OK → on horodate le    │
   │     profil sur Bitcoin via OTS      │
   └─────────────────────────────────────┘
           │
           ▼
   Le profil est sauvegardé dans Supabase
           │
           ▼
   Le donneur reçoit sa Carte Bitcoin Blood
   (un QR Code contenant son identifiant unique)
```

**Pourquoi la signature Bitcoin ?**
Elle prouve que le donneur est bien le propriétaire de l'identité numérique associée à son profil. Personne ne peut s'inscrire à sa place.

**Pourquoi l'horodatage (OpenTimestamps) ?**
Il ancre le profil dans un bloc de la blockchain Bitcoin à un instant précis. Cela garantit que le profil n'a pas été modifié après son enregistrement. C'est la preuve d'intégrité infalsifiable.

---

### Flux 2 — Recherche d'Urgence (Blood Emergency AI)

Ce flux est déclenché par un hôpital qui a besoin de sang en urgence.

```
L'hôpital signale une urgence :
  → Groupe sanguin nécessaire (ex: O-)
  → Sa localisation GPS
           │
           ▼
   Le serveur interroge Supabase
   pour récupérer tous les donneurs disponibles
           │
           ▼
   ┌──────────────────────────────────────────┐
   │  Le moteur de matching applique 2 filtres │
   │                                           │
   │  Filtre 1 : Compatibilité sanguine        │
   │  → Qui peut donner du O- ?                │
   │  → Seuls les donneurs O- sont compatibles │
   │  (table ABO/Rhésus médicalement correcte) │
   │                                           │
   │  Filtre 2 : Distance géographique         │
   │  → Calcul de la distance réelle entre     │
   │    l'hôpital et chaque donneur compatible │
   │    (algorithme de Haversine)              │
   └──────────────────────────────────────────┘
           │
           ▼
   Retourne les 10 donneurs
   les plus proches et compatibles,
   classés du plus proche au plus lointain
```

**Qu'est-ce que l'algorithme de Haversine ?**
C'est une formule mathématique qui calcule la distance réelle en kilomètres entre deux points GPS sur un globe terrestre. C'est plus précis qu'une simple règle de trois sur les coordonnées.

---

### Flux 3 — Vérification d'une Carte Donneur

Ce flux est déclenché quand un soignant scanne le QR Code de la carte d'un donneur pour s'assurer de son authenticité.

```
Le soignant scanne le QR Code
           │
           ▼
   Le QR Code contient l'identifiant
   unique (UUID) du donneur
           │
           ▼
   Le serveur récupère le profil
   depuis Supabase
           │
           ▼
   ┌──────────────────────────────────────────┐
   │  Vérification de la preuve OTS           │
   │  → Le serveur relit la preuve Bitcoin    │
   │    stockée lors de l'inscription         │
   │  → Il compare le hash du profil actuel   │
   │    avec celui ancré dans Bitcoin         │
   │  → Si identiques → profil intact         │
   │  → Si différents → profil falsifié       │
   └──────────────────────────────────────────┘
           │
           ▼
   Réponse affichée au soignant :
   ✅ Carte AUTHENTIQUE
     Groupe : O-
     Ancré dans le bloc Bitcoin #850432
     Date : 2026-06-30
```

---

## 🛡️ Sécurité : les couches de protection

La sécurité du backend repose sur plusieurs couches qui se complètent :

```
Couche 1 — Validation des données (Zod)
→ Toute donnée entrant dans le système est vérifiée.
  Un groupe sanguin invalide, une latitude hors limites,
  un UUID mal formé... tout est rejeté avant d'aller plus loin.

Couche 2 — Cryptographie (bip322-js)
→ La signature numérique garantit qu'un profil
  a bien été créé par la personne qui le revendique.

Couche 3 — Preuve d'intégrité (OpenTimestamps / Bitcoin)
→ Le profil est figé dans le temps sur une blockchain publique.
  Toute tentative de modification postérieure est détectable.

Couche 4 — Sécurité base de données (Supabase RLS)
→ Les politiques Row Level Security empêchent
  un utilisateur d'accéder aux données d'un autre.

Couche 5 — Qualité du code (ESLint + Husky)
→ Le hook de pre-commit empêche d'enregistrer
  du code contenant des failles ou des approximations
  de typage (interdiction des types génériques `any`).
```

---

## 📦 Ce qui est livré (Commit feat/backend)

Le commit `9ab3c5c` sur la branche `feat/backend` contient **13 fichiers** créés :

| Fichier créé                               | Ce qu'il fait                                |
| ------------------------------------------ | -------------------------------------------- |
| `modules/bitcoin/wallet.service.ts`        | Vérifie les signatures BIP-322               |
| `modules/bitcoin/ots.service.ts`           | Crée et vérifie les preuves OTS Bitcoin      |
| `modules/donors/schemas/index.ts`          | Définit les règles de validation des données |
| `modules/donors/types/index.ts`            | Définit la forme des données d'un donneur    |
| `modules/donors/services/donor.service.ts` | Communique avec Supabase pour lire/écrire    |
| `modules/matching/matching.service.ts`     | Intelligence de recherche compatible + géo   |
| `app/api/v1/donors/route.ts`               | Endpoint d'inscription d'un donneur          |
| `app/api/v1/search/route.ts`               | Endpoint de recherche d'urgence              |
| `app/api/v1/verify/[id]/route.ts`          | Endpoint de vérification de carte            |
| `types/javascript-opentimestamps.d.ts`     | Déclaration de types pour la lib OTS         |

---

## ⏳ Prochaines étapes prévues

- Authentification via Supabase Auth (déjà supportée côté infrastructure)
- Dashboard **Super Admin** : vision globale, validation des organisations
- Dashboard **Admin Organisation** : hôpitaux, ONG, centres de collecte
- API Urgences : déclarer et gérer les alertes de manque de sang
- API Campagnes : organiser des collectes ciblées par groupe et ville
