# Modules métier

Chaque sous-dossier représente un domaine métier autonome. Un module ne dépend
jamais des détails internes d'un autre: les échanges passent par les contrats
publics exposés dans son `index.ts`.

## Anatomie d'un module

```
modules/<domaine>/
  components/    Composants React spécifiques au domaine
  hooks/         Hooks React encapsulant l'état et les requêtes
  services/      Logique métier et accès aux données (jamais dans les composants)
  schemas/       Schémas Zod (validation des entrées et sorties)
  types/         Types TypeScript du domaine
  constants/     Constantes du domaine
  index.ts       Surface publique du module
```

## Règles

- Aucune logique métier dans les composants React: elle vit dans `services/`.
- Toute entrée est validée par un schéma Zod avant traitement.
- Un module n'importe un autre module que via son `index.ts`.
- Les composants restent courts (moins de 150 lignes) et à responsabilité unique.

## Domaines prévus

| Domaine     | Responsabilité                             |
| ----------- | ------------------------------------------ |
| `auth`      | Authentification et gestion de session     |
| `donors`    | Enregistrement et profils des donneurs     |
| `matching`  | Recherche de donneurs compatibles          |
| `alerts`    | Alertes ciblées en cas d'urgence           |
| `campaigns` | Organisation des campagnes de don          |
| `cards`     | Cartes physiques et numériques vérifiables |
| `proofs`    | Preuves d'intégrité ancrées sur Bitcoin    |
| `rewards`   | Récompenses via Lightning Network          |

Aucun domaine n'est implémenté pour l'instant: cette base ne contient
volontairement aucune fonctionnalité métier.
