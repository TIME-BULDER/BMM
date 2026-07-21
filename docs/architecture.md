# Architecture technique

Ce document complète [ARCHITECTURE.md](../ARCHITECTURE.md) avec les détails
d'implémentation.

## Flux d'une requête API

1. Le composant client appelle le client HTTP centralisé
   (`src/lib/api/http-client.ts`).
2. Le Route Handler `/api/v1/*` reçoit la requête.
3. Les entrées sont validées avec un schéma Zod.
4. Le service du domaine concerné applique la logique métier.
5. Le service accède aux données via Drizzle ou Supabase.
6. La réponse est renvoyée via l'enveloppe normalisée (`success`/`failure`).
7. Toute exception est convertie par `handleApiError`.

## Cœur technique (`src/lib`)

### `env/`

Valide les variables d'environnement avec Zod au chargement du module. La
validation est scindée pour respecter la frontière client/serveur:

- `client.ts` expose `clientEnv` (variables `NEXT_PUBLIC_*`), sûr à importer
  depuis n'importe quel composant. Chaque clé est référencée littéralement pour
  être inlinée dans le bundle client.
- `server.ts` expose `serverEnv` (secrets serveur comme `DATABASE_URL`),
  importé uniquement par le code serveur et l'outillage.

Le reste de l'application importe `clientEnv`/`serverEnv` plutôt que de lire
`process.env`. Ne jamais importer `server.ts` depuis un Composant Client.

### `api/`

- `errors.ts`: `ApiError` typée et catalogue de codes d'erreur stables.
- `response.ts`: helpers `success`, `failure` et `handleApiError`.
- `http-client.ts`: client HTTP unique pour le frontend, qui interprète
  l'enveloppe et lève une `HttpError` exploitable par l'interface.

### `db/`

- `index.ts`: instance Drizzle connectée à PostgreSQL via `postgres-js`. La
  connexion est réutilisée en développement pour éviter d'épuiser le pool.
- `schema/`: schémas Drizzle, agrégés dans `index.ts`.

### `supabase/`

- `client.ts`: client navigateur (clé anonyme).
- `server.ts`: client serveur synchronisé avec les cookies de session.

## Organisation par domaine

Chaque domaine est autonome et expose sa surface publique via `index.ts`. Les
dépendances entre domaines passent uniquement par ces points d'entrée, ce qui
limite le couplage et facilite l'évolution indépendante de chaque module.

## Rendu

- Les Server Components sont privilégiés par défaut.
- Les Client Components sont introduits uniquement lorsqu'une interactivité ou
  un état local est nécessaire.
- Les Server Actions sont utilisées lorsqu'elles simplifient une mutation par
  rapport à un Route Handler.

## État et données

- État serveur distant: TanStack Query, lorsque pertinent.
- État client global: Zustand, uniquement lorsque réellement nécessaire.
- Les données partagées entre composants restent locales tant que possible.
