# Emails

Deux mécanismes complémentaires.

## 1. Emails transactionnels (EmailJS)

Envoyés par le backend via l'API REST d'EmailJS. **Tout le HTML est rendu dans
le code** (`src/modules/notifications/templates.ts`) : tu n'as donc qu'**un
seul gabarit universel** à créer dans EmailJS, avec une variable. Best-effort :
si la configuration est absente, rien n'échoue — un log de simulation est émis.

### Variables d'environnement

```
EMAILJS_SERVICE_ID=...
EMAILJS_PUBLIC_KEY=...
EMAILJS_PRIVATE_KEY=...
EMAILJS_TEMPLATE_ID=...   # le gabarit universel ci-dessous
```

### Créer le gabarit universel (une fois, 2 min)

1. EmailJS → **Email Templates** → **Create New Template**.
2. Onglet **Settings** :
   - **To Email** : `{{to_email}}`
   - **Subject** : `{{subject}}`
   - From name/email : au choix (ex. « Bitcoin Blood »).
3. Onglet **Content** → bascule en mode **code / HTML** et mets **exactement** :

   ```
   {{{html_body}}}
   ```

   Les **triples accolades** sont essentielles : elles insèrent le HTML sans
   l'échapper.

4. **Save**, puis copie le **Template ID** dans `EMAILJS_TEMPLATE_ID`.

C'est tout. Le sujet et le corps (bienvenue, récompense…) sont produits par le
code, mis en forme aux couleurs Bitcoin Blood.

### Emails déclenchés

| Email                | Déclencheur                                 | Rendu                |
| -------------------- | ------------------------------------------- | -------------------- |
| Bienvenue donneur    | `POST /api/v1/donors` (après inscription)   | `renderWelcomeEmail` |
| Récompense Lightning | `POST /api/v1/verify/:id` (paiement réussi) | `renderRewardEmail`  |

> ⚠️ **Ne jamais** inclure la clé privée du donneur dans un email. Elle est
> générée dans le navigateur, jamais transmise au serveur ; le donneur la copie
> ou la télécharge depuis l'écran de confirmation.

## 2. Confirmation d'email (Supabase, natif)

La confirmation d'adresse est gérée par Supabase Auth, pas par le code.

- **Activer** : Dashboard Supabase → Authentication → Providers → Email →
  **Confirm email**.
- Personnaliser le contenu : Authentication → Email Templates → _Confirm
  signup_.
- Définir l'URL de redirection : Authentication → URL Configuration →
  **Site URL** (ex. `https://…/` ou `http://localhost:3000`).

Avec la confirmation activée, un donneur (ou une structure) doit confirmer son
email avant de pouvoir **se connecter**. L'inscription (création du profil)
fonctionne dans tous les cas.

> En développement, laisser « Confirm email » désactivé évite les limites
> d'envoi d'emails de Supabase et les blocages de connexion.
