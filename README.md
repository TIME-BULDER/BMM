# Bitcoin Blood

Plateforme panafricaine de gestion des donneurs de sang. Bitcoin Blood relie
les donneurs volontaires aux besoins urgents des structures de santé, organise
les campagnes de don et garantit l'intégrité des données grâce à Bitcoin.

Projet développé dans le cadre du hackathon **Bitcoin Mastermind 2026**, conçu
pour rester en production et évoluer au-delà de l'événement.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancement](#lancement)
- [Scripts disponibles](#scripts-disponibles)
- [Structure du projet](#structure-du-projet)
- [Conventions](#conventions)
- [Workflow Git](#workflow-git)
- [Documentation](#documentation)
- [Licence](#licence)

## Fonctionnalités

Bitcoin Blood vise à fournir une plateforme complète pour:

- enregistrer des donneurs de sang volontaires;
- retrouver rapidement des donneurs compatibles;
- envoyer des alertes ciblées en cas d'urgence;
- organiser des campagnes de don de sang;
- gérer des cartes physiques et numériques vérifiables;
- conserver des preuves d'intégrité grâce à Bitcoin;
- intégrer Lightning Network pour de futures récompenses.

> Cette base de projet ne contient encore aucune fonctionnalité métier. Elle
> fournit l'architecture, l'outillage et la documentation nécessaires pour les
> développer dans de bonnes conditions. Voir [ROADMAP.md](./ROADMAP.md).

## Stack technique

| Domaine          | Technologie                          |
| ---------------- | ------------------------------------ |
| Framework        | Next.js 16 (App Router), React 19    |
| Langage          | TypeScript                           |
| Base de données  | PostgreSQL via Supabase              |
| ORM              | Drizzle ORM                          |
| Authentification | Supabase Auth                        |
| Stockage         | Supabase Storage                     |
| Temps réel       | Supabase Realtime                    |
| Validation       | Zod                                  |
| Styles           | Tailwind CSS v4                      |
| Composants UI    | shadcn/ui, class-variance-authority  |
| Icônes           | Lucide React                         |
| État client      | Zustand                              |
| Requêtes serveur | TanStack Query                       |
| Tests            | Vitest, Testing Library              |
| Qualité          | ESLint, Prettier, Husky, lint-staged |

## Prérequis

- Node.js >= 20.9 (voir [.nvmrc](./.nvmrc))
- npm >= 10
- Un projet Supabase (base PostgreSQL, Auth, Storage)

## Installation

```bash
git clone <url-du-depot>
cd bitcoin-blood
npm install
cp .env.example .env
```

Renseignez ensuite les variables d'environnement dans `.env`. La liste complète
et leur rôle sont décrits dans [.env.example](./.env.example).

## Lancement

```bash
# Démarrer le serveur de développement
npm run dev

# Synchroniser le schéma avec la base de données
npm run db:push
```

L'application est disponible sur http://localhost:3000.

## Scripts disponibles

| Script                  | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `npm run dev`           | Démarre le serveur de développement                   |
| `npm run build`         | Compile l'application pour la production              |
| `npm run start`         | Démarre l'application compilée                        |
| `npm run lint`          | Analyse le code avec ESLint                           |
| `npm run lint:fix`      | Corrige automatiquement les problèmes ESLint          |
| `npm run format`        | Formate le code avec Prettier                         |
| `npm run format:check`  | Vérifie le formatage sans modifier les fichiers       |
| `npm run typecheck`     | Vérifie les types TypeScript                          |
| `npm run test`          | Exécute la suite de tests                             |
| `npm run test:watch`    | Exécute les tests en mode interactif                  |
| `npm run test:coverage` | Génère un rapport de couverture                       |
| `npm run validate`      | Enchaîne typecheck, lint et vérification du formatage |
| `npm run db:generate`   | Génère les migrations Drizzle                         |
| `npm run db:migrate`    | Applique les migrations                               |
| `npm run db:push`       | Synchronise le schéma avec la base                    |
| `npm run db:studio`     | Ouvre Drizzle Studio                                  |

## Structure du projet

```
src/
  app/            Routes, layouts et Route Handlers (App Router)
  components/     Composants partagés (ui, layout)
  modules/        Domaines métier indépendants
  lib/            Cœur technique (env, api, db, supabase, utils)
  config/         Configuration applicative
  providers/      Providers React globaux
  test/           Configuration des tests
```

Le détail complet est documenté dans
[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

## Conventions

- Composants en `PascalCase`, variables en `camelCase`, dossiers en
  `kebab-case`, tables PostgreSQL en `snake_case`, constantes en
  `UPPER_SNAKE_CASE`.
- Aucune logique métier dans les composants React: elle vit dans les services
  des modules.
- Toute entrée est validée avec Zod; aucune confiance n'est accordée aux
  données du client.
- Toutes les routes API sont préfixées par `/api/v1/` et suivent une enveloppe
  de réponse normalisée.

Les règles complètes sont détaillées dans
[docs/coding-guidelines.md](./docs/coding-guidelines.md).

## Workflow Git

Le projet suit un flux `feature -> develop -> main`. Les branches `main` et
`develop` sont protégées.

```
feature/nom-court-en-kebab-case
fix/nom-court-en-kebab-case
docs/nom-court-en-kebab-case
refactor/nom-court-en-kebab-case
chore/nom-court-en-kebab-case
```

Le processus de contribution est décrit dans
[CONTRIBUTING.md](./CONTRIBUTING.md).

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — décisions et principes d'architecture
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) — arborescence détaillée
- [ROADMAP.md](./ROADMAP.md) — feuille de route
- [SECURITY.md](./SECURITY.md) — politique de sécurité
- [CHANGELOG.md](./CHANGELOG.md) — historique des versions
- [docs/](./docs) — documentation technique approfondie

## Licence

Distribué sous licence MIT. Voir [LICENSE](./LICENSE).
