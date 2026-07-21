# Guide de contribution

Merci de contribuer à Bitcoin Blood. Ce document décrit le processus à suivre
pour garder une base de code propre, cohérente et maintenable dans la durée.

## Principes

- Une seule tâche par branche et par Pull Request.
- Commits atomiques: une seule modification logique par commit.
- Aucune mention d'outil d'IA dans le code, les commentaires, les commits ou
  les Pull Requests.
- Aucun emoji dans le code et les messages de commit.
- Les contenus visibles par l'utilisateur sont rédigés en français, avec les
  accents.

## Workflow Git

Le projet suit le flux `feature -> develop -> main`. Les branches `main` et
`develop` sont protégées: aucun commit direct n'y est autorisé.

1. Créer une branche à partir de `develop`.
2. Développer la tâche en commits atomiques.
3. Ouvrir une Pull Request vers `develop`.
4. Faire relire le code, corriger les retours, puis fusionner.

### Nommage des branches

```
feature/nom-court-en-kebab-case
fix/nom-court-en-kebab-case
docs/nom-court-en-kebab-case
refactor/nom-court-en-kebab-case
chore/nom-court-en-kebab-case
```

Une branche ne traite qu'un seul sujet.

## Messages de commit

- En anglais, courts et clairs.
- À l'impératif présent: `add donor registration form`.
- Sans emoji et sans référence à un outil d'IA.

Exemples:

```
add donor schema validation
fix donor search pagination
docs update api reference
```

## Pull Requests

- Titre et description en anglais.
- Décrire le quoi et le pourquoi, pas seulement le comment.
- Lier la tâche ou l'issue correspondante.
- La PR doit passer l'ensemble des vérifications automatiques.

## Avant de pousser

Exécuter la validation complète en local:

```bash
npm run validate
npm run test
```

Les hooks Git (Husky) exécutent automatiquement `lint-staged` avant chaque
commit et la vérification des types avant chaque `push`.

## Définition du « terminé »

Une tâche est terminée lorsque:

- le code respecte les conventions du projet;
- les types passent (`npm run typecheck`);
- ESLint ne remonte aucune erreur (`npm run lint`);
- le code est formaté (`npm run format:check`);
- les tests passent (`npm run test`);
- la documentation est à jour, notamment
  [docs/features.md](./docs/features.md) pour toute nouvelle route API.

## Revue de code

Chaque contribution fait l'objet:

- d'une revue de code;
- d'un audit de sécurité;
- d'un audit de qualité.

Voir les règles détaillées dans
[docs/coding-guidelines.md](./docs/coding-guidelines.md).
