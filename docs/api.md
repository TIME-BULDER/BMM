# API

L'API de Bitcoin Blood est exposée par les Route Handlers de Next.js sous le
préfixe `/api/v1/`.

## Conventions

- Toutes les routes sont préfixées par `/api/v1/`.
- Toutes les entrées sont validées avec Zod côté serveur.
- Aucune confiance n'est accordée aux données provenant du client.
- Les dates sont au format ISO 8601.
- Le frontend communique avec l'API uniquement via le client HTTP centralisé.
- Le frontend n'affiche jamais une erreur technique brute.

## Enveloppe de réponse

### Succès

```json
{
  "data": {},
  "meta": {}
}
```

### Erreur

```json
{
  "error": {
    "code": "",
    "message": "",
    "details": {}
  }
}
```

## Codes d'erreur

| Code               | Statut HTTP | Signification                       |
| ------------------ | ----------- | ----------------------------------- |
| `bad_request`      | 400         | Requête invalide                    |
| `unauthorized`     | 401         | Authentification requise            |
| `forbidden`        | 403         | Accès refusé                        |
| `not_found`        | 404         | Ressource introuvable               |
| `conflict`         | 409         | Conflit avec l'état de la ressource |
| `validation_error` | 422         | Données invalides                   |
| `rate_limited`     | 429         | Trop de requêtes                    |
| `internal_error`   | 500         | Erreur interne                      |

## Écrire un Route Handler

```ts
import { z } from "zod";

import { handleApiError, success } from "@/lib/api/response";

const bodySchema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    // Déléguer la logique métier au service du domaine.
    return success({ email: body.email }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

`handleApiError` convertit automatiquement les `ApiError` et les `ZodError` en
réponses normalisées, et masque les erreurs inattendues derrière un message
générique.

## Consommer l'API côté frontend

```ts
import { httpClient } from "@/lib/api/http-client";

const { data } = await httpClient.get<{ status: string }>("/health");
```

En cas d'échec, le client lève une `HttpError` dont le `message` est sûr à
afficher.

## Documentation des routes

Toute nouvelle route doit être documentée dans
[docs/features.md](./features.md) dès sa création.

## Routes existantes

| Méthode | Route            | Description            |
| ------- | ---------------- | ---------------------- |
| GET     | `/api/v1/health` | Sonde de disponibilité |
