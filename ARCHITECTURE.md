# Architecture

Ce document présente les principes d'architecture de Bitcoin Blood. Il décrit
les choix structurants et les raisons qui les motivent. La documentation
technique approfondie se trouve dans [docs/architecture.md](./docs/architecture.md).

## Objectifs

- Maintenabilité sur plusieurs années.
- Reprise facile par une autre équipe.
- Extensibilité par domaine métier.
- Séparation stricte des responsabilités.

## Vue d'ensemble

Bitcoin Blood est une application Next.js (App Router) full-stack. Le rendu et
l'API cohabitent dans le même projet. La logique est organisée par domaine
métier plutôt que par type technique.

```
Navigateur
    |
    v
App Router (pages, layouts)  --->  Composants (UI, layout, modules)
    |                                   |
    v                                   v
Route Handlers /api/v1/*  --->  Services des modules  --->  Drizzle / Supabase
                                                                  |
                                                                  v
                                                            PostgreSQL
```

## Couches

### Présentation

Les pages orchestrent des composants et restent volontairement légères. Aucune
logique métier n'y figure. Les composants sont courts, à responsabilité unique,
et composables.

### Domaine métier

Chaque domaine vit dans `src/modules/<domaine>` et expose une surface publique
via son `index.ts`. La logique métier réside dans les services du module, jamais
dans les composants React. Voir [src/modules/README.md](./src/modules/README.md).

### Accès aux données

L'accès aux données passe par Drizzle ORM (PostgreSQL) et par les clients
Supabase. Les services encapsulent ces accès; le reste de l'application ne
manipule jamais la base directement.

### API

Les Route Handlers exposent l'API sous `/api/v1/`. Toutes les entrées sont
validées avec Zod et toutes les réponses suivent une enveloppe normalisée. Voir
[docs/api.md](./docs/api.md).

## Principes appliqués

- **SOLID**: responsabilités isolées, dépendances explicites.
- **DRY**: aucune duplication; la logique partagée est factorisée.
- **KISS**: la solution la plus simple qui réponde au besoin.
- **Separation of Concerns**: UI, logique métier et accès aux données séparés.
- **Composition plutôt qu'héritage**: composants et fonctions composables.

## Frontières

- Un module n'importe un autre module que par son `index.ts`.
- Le frontend ne communique avec l'API que via le client HTTP centralisé
  (`src/lib/api/http-client.ts`).
- Les variables d'environnement sont validées au démarrage
  (`src/lib/env/`); aucun accès direct à `process.env` ailleurs.

## Décisions notables

| Décision                    | Raison                                              |
| --------------------------- | --------------------------------------------------- |
| Next.js App Router          | Rendu serveur, Route Handlers et Server Actions     |
| Drizzle ORM                 | Typage strict, migrations explicites, SQL proche    |
| Supabase                    | PostgreSQL géré, Auth, Storage et Realtime intégrés |
| Organisation par domaine    | Extensibilité et indépendance des fonctionnalités   |
| Enveloppe API normalisée    | Contrat stable entre frontend et backend            |
| Validation Zod systématique | Aucune confiance accordée aux données du client     |
