# Fonctionnalités

Ce document recense les fonctionnalités et les routes API du projet. Toute
nouvelle route doit y être documentée dès sa création.

## État

Aucune fonctionnalité métier n'est encore implémentée. La base fournit
l'architecture, l'outillage et les conventions pour les développer. La
progression est suivie dans la [feuille de route](../ROADMAP.md).

## Routes API

### Disponibilité

| Méthode | Route            | Description            | Authentification |
| ------- | ---------------- | ---------------------- | ---------------- |
| GET     | `/api/v1/health` | Sonde de disponibilité | Non              |

**Réponse**

```json
{
  "data": { "status": "ok" },
  "meta": { "timestamp": "2026-01-01T00:00:00.000Z" }
}
```

## Modèle de documentation

Pour chaque nouvelle fonctionnalité, documenter:

- la description et l'objectif métier;
- les routes exposées (méthode, chemin, authentification);
- les schémas d'entrée et de sortie;
- les codes d'erreur spécifiques;
- les règles d'autorisation.

Format recommandé pour une route:

| Méthode | Route                 | Description            | Authentification |
| ------- | --------------------- | ---------------------- | ---------------- |
| POST    | `/api/v1/<ressource>` | Crée une `<ressource>` | Oui              |
