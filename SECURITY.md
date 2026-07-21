# Politique de sécurité

Bitcoin Blood traite des données de santé sensibles. La sécurité est une
exigence de premier ordre, prise en compte dès la conception.

## Signaler une vulnérabilité

Merci de signaler toute vulnérabilité de manière responsable et privée, sans la
divulguer publiquement avant correction. Décrivez le problème, son impact et les
étapes de reproduction. Une réponse est apportée dans les meilleurs délais.

## Principes appliqués

- **Validation systématique**: toute entrée est validée avec Zod côté serveur.
  Aucune confiance n'est accordée aux données provenant du client.
- **Moindre privilège**: la clé de service Supabase n'est jamais exposée au
  client; seules les variables `NEXT_PUBLIC_*` le sont.
- **Variables d'environnement validées**: le démarrage échoue si une variable
  requise est absente ou invalide (`src/lib/env/`).
- **Erreurs non divulguées**: les réponses d'erreur de l'API ne révèlent jamais
  de détail technique interne au client.
- **Surface API contrôlée**: toutes les routes passent par `/api/v1/` et une
  enveloppe de réponse normalisée.

## Gestion des secrets

- Les secrets vivent uniquement dans `.env`, jamais dans le dépôt.
- `.env.example` documente les variables sans valeur réelle.
- Aucune clé, aucun jeton ni aucune donnée personnelle n'est committé.

## Données personnelles

- Les données des donneurs sont des données de santé: leur accès est restreint
  et journalisé au niveau applicatif.
- Le stockage et les autorisations s'appuient sur les mécanismes de sécurité de
  Supabase, dont les politiques Row Level Security.

## Dépendances

- Les dépendances sont maintenues à jour.
- `npm audit` est exécuté régulièrement pour détecter les vulnérabilités
  connues.
