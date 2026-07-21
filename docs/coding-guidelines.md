# Conventions de code

Ces règles garantissent un code lisible, cohérent et maintenable dans la durée.

## Principes

- Lisibilité, maintenabilité et simplicité avant tout.
- SOLID, DRY, KISS et séparation des responsabilités.
- Composition plutôt qu'héritage.
- Aucune solution rapide qui dégrade la qualité du projet.

## Nommage

| Élément            | Convention         | Exemple          |
| ------------------ | ------------------ | ---------------- |
| Composant React    | `PascalCase`       | `DonorCard`      |
| Variable, fonction | `camelCase`        | `findCompatible` |
| Dossier            | `kebab-case`       | `donor-search`   |
| Table PostgreSQL   | `snake_case`       | `blood_donors`   |
| Constante          | `UPPER_SNAKE_CASE` | `MAX_RESULTS`    |

## Composants

- Une responsabilité unique par composant.
- Moins de 150 lignes lorsque c'est possible.
- Les pages orchestrent des composants et ne contiennent pas de logique métier.
- Créer autant de composants spécialisés que nécessaire.
- Factoriser les variantes avec `class-variance-authority` lorsque pertinent.

## Logique métier

- Aucune logique métier dans les composants React.
- La logique vit dans les services des modules (`src/modules/<domaine>/services`).
- Les accès aux données sont encapsulés dans les services.

## TypeScript

- Mode strict activé.
- Éviter `any`; préférer des types explicites et étroits.
- Exporter les types publics depuis l'`index.ts` du module.

## Style

- Aucun emoji dans le code.
- Aucun tiret cadratin.
- Commentaires rares, réservés à l'explication d'un choix complexe.
- Contenus visibles par l'utilisateur en français, avec les accents.

## Imports

- Utiliser l'alias `@/*` pour les imports internes.
- Regrouper et ordonner les imports: dépendances externes, puis internes.

## Validation

- Toute entrée est validée avec Zod.
- Les schémas Zod vivent dans `schemas/` au sein du module concerné.

## Tests

- Tests écrits avec Vitest et Testing Library.
- Fichiers nommés `*.test.ts` ou `*.test.tsx`, à côté du code testé.
- Tester en priorité la logique métier et les comportements critiques.

## À éviter

- Fichiers, composants et fonctions gigantesques.
- Duplication de code.
- Effets de bord inutiles.
- Dépendances superflues.
- Tout pattern répétitif évoquant du code généré automatiquement.
