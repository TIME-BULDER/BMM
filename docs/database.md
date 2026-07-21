# Base de données

Bitcoin Blood utilise PostgreSQL, hébergé par Supabase, avec Drizzle ORM pour la
modélisation, les requêtes et les migrations.

## Connexion

La connexion s'effectue via `postgres-js` dans `src/lib/db/index.ts`. L'URL de
connexion provient de la variable `DATABASE_URL`, validée au démarrage.

En environnement serverless, utiliser la chaîne de connexion « pooler » fournie
par Supabase.

## Schémas

Les schémas Drizzle vivent dans `src/lib/db/schema/`. Chaque domaine définit ses
tables dans un fichier dédié, ré-exporté depuis `schema/index.ts`.

```ts
// src/lib/db/schema/index.ts
export * from "./donors";
export * from "./campaigns";
```

### Conventions de modélisation

- Tables et colonnes en `snake_case`.
- Clés primaires en UUID lorsque pertinent.
- Colonnes temporelles `created_at` et `updated_at` sur les entités durables.
- Contraintes et index définis explicitement dans le schéma.

## Migrations

Le flux de migration s'appuie sur Drizzle Kit.

```bash
# Générer une migration à partir des changements de schéma
npm run db:generate

# Appliquer les migrations à la base
npm run db:migrate

# Synchroniser directement le schéma (développement)
npm run db:push

# Explorer la base avec Drizzle Studio
npm run db:studio
```

Les migrations générées sont stockées dans le dossier `drizzle/` et versionnées.

## Sécurité des données

- Les données des donneurs sont des données de santé sensibles.
- L'accès est restreint au niveau applicatif, dans les services.
- Les politiques Row Level Security de Supabase complètent ce contrôle pour les
  accès directs.
- La clé de service Supabase n'est utilisée que côté serveur.

## État actuel

Aucune table n'est encore définie. La modélisation accompagnera chaque
fonctionnalité métier, conformément à la [feuille de route](../ROADMAP.md).
