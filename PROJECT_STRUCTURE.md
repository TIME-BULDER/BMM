# Structure du projet

Arborescence de référence et rôle de chaque dossier. La structure est organisée
par domaine métier et par responsabilité technique.

## Racine

```
.
├── docs/                 Documentation technique approfondie
├── public/               Fichiers statiques servis tels quels
├── src/                  Code source de l'application
├── .env.example          Modèle des variables d'environnement
├── .editorconfig         Règles d'édition partagées
├── .nvmrc                Version de Node.js du projet
├── components.json       Configuration shadcn/ui
├── drizzle.config.ts     Configuration Drizzle Kit
├── eslint.config.mjs     Configuration ESLint
├── next.config.ts        Configuration Next.js
├── postcss.config.mjs    Configuration PostCSS (Tailwind)
├── tsconfig.json         Configuration TypeScript
└── vitest.config.ts      Configuration Vitest
```

## src

```
src/
├── app/                  App Router: routes, layouts, Route Handlers
│   ├── api/
│   │   └── v1/           API versionnée
│   │       └── health/   Sonde de disponibilité
│   ├── globals.css       Styles globaux et tokens de design
│   ├── layout.tsx        Layout racine
│   └── page.tsx          Page d'accueil
│
├── components/           Composants partagés entre domaines
│   ├── layout/           Mise en page (conteneurs, sections)
│   └── ui/               Primitives d'interface (shadcn/ui)
│
├── modules/              Domaines métier indépendants
│   └── README.md         Anatomie et règles d'un module
│
├── lib/                  Cœur technique
│   ├── api/              Enveloppe API, erreurs, client HTTP
│   ├── db/               Client Drizzle et schémas
│   ├── supabase/         Clients Supabase (navigateur, serveur)
│   ├── env/              Validation env: client.ts (public), server.ts (serveur)
│   └── utils.ts          Utilitaires transverses
│
├── config/               Configuration applicative (site, navigation)
├── providers/            Providers React globaux
└── test/                 Configuration et utilitaires de test
```

## Convention par module

Chaque domaine de `src/modules` suit la même structure interne:

```
modules/<domaine>/
├── components/           Composants spécifiques au domaine
├── hooks/                Hooks React du domaine
├── services/             Logique métier et accès aux données
├── schemas/              Schémas Zod
├── types/                Types TypeScript
├── constants/            Constantes du domaine
└── index.ts              Surface publique du module
```

## Alias d'import

L'alias `@/*` pointe vers `src/*`.

```ts
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { httpClient } from "@/lib/api/http-client";
```
