/**
 * Gabarits HTML des emails transactionnels (rendus côté code).
 * HTML compatible clients mail: tables + styles inline, largeur 600px.
 */

const BRAND = {
  name: "Bitcoin Blood",
  red: "#e5484d",
  dark: "#11151c",
  text: "#1f2430",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f4f4f5",
};

// URL absolue et PUBLIQUE du logo. Les clients mail ne peuvent pas charger une
// image depuis localhost: on la sert donc depuis le bucket public Supabase
// (joignable partout, en local comme en production).
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const LOGO_URL = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/assets/logo_bmm.png`
  : `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/logo_bmm.png`;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type EmailContent = { subject: string; html: string };

/** Enveloppe commune: en-tête sombre, carte blanche, pied de page. */
function wrap(options: {
  preheader: string;
  heading: string;
  bodyHtml: string;
  cta?: { label: string; url: string };
}): string {
  const { preheader, heading, bodyHtml, cta } = options;

  const ctaHtml = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr><td style="border-radius:8px;background:${BRAND.red};">
          <a href="${escapeHtml(cta.url)}" target="_blank"
             style="display:inline-block;padding:12px 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">
            ${escapeHtml(cta.label)}
          </a>
        </td></tr>
      </table>`
    : "";

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};">
  <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="background:#ffffff;border-radius:14px 14px 0 0;border:1px solid ${BRAND.border};border-bottom:none;padding:22px 28px;">
          <img src="${LOGO_URL}" alt="${BRAND.name}" height="40" style="display:block;height:40px;width:auto;border:0;outline:none;text-decoration:none;">
        </td></tr>
        <tr><td style="background:#ffffff;padding:32px 28px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">
          <h1 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.3;color:${BRAND.text};">${escapeHtml(heading)}</h1>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${BRAND.text};">
            ${bodyHtml}
          </div>
          ${ctaHtml}
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:0 0 14px 14px;border:1px solid ${BRAND.border};border-top:none;padding:20px 28px;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${BRAND.muted};">
            ${BRAND.name}. Plateforme panafricaine de gestion des donneurs de sang.<br>
            Vos dons sont ancrés sur Bitcoin pour une intégrité vérifiable.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function renderWelcomeEmail(params: {
  toName: string;
  bloodType: string;
  city: string;
  verifyUrl: string;
}): EmailContent {
  const name = escapeHtml(params.toName);
  const body = `
    <p style="margin:0 0 14px;">Bonjour ${name},</p>
    <p style="margin:0 0 14px;">
      Bienvenue dans le réseau <strong>${BRAND.name}</strong> ! Votre profil de
      donneur est enregistré et signé cryptographiquement, puis ancré sur la
      blockchain Bitcoin.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;border-collapse:separate;">
      <tr>
        <td style="padding:6px 14px 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.muted};">Groupe sanguin</td>
        <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:${BRAND.red};">${escapeHtml(params.bloodType)}</td>
      </tr>
      <tr>
        <td style="padding:6px 14px 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.muted};">Ville</td>
        <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.text};">${escapeHtml(params.city)}</td>
      </tr>
    </table>
    <p style="margin:14px 0;">
      Vous serez alerté uniquement en cas de besoin compatible près de chez vous.
      Chaque don peut sauver jusqu'à trois vies.
    </p>
    <p style="margin:14px 0 0;color:${BRAND.muted};font-size:13px;">
      Pensez à conserver la clé privée qui vous a été remise à l'inscription :
      elle prouve la propriété de votre profil. Nous ne la stockons jamais.
    </p>`;

  return {
    subject: `Bienvenue dans la communauté ${BRAND.name} 🩸`,
    html: wrap({
      preheader: "Votre profil de donneur est actif et ancré sur Bitcoin.",
      heading: "Vous faites désormais partie du réseau",
      bodyHtml: body,
      cta: { label: "Voir ma preuve d'intégrité", url: params.verifyUrl },
    }),
  };
}

export function renderRewardEmail(params: {
  toName: string;
  sats: number;
  hospitalName: string;
  verifyUrl: string;
}): EmailContent {
  const name = escapeHtml(params.toName);
  const sats = params.sats.toLocaleString("fr-FR");
  const body = `
    <p style="margin:0 0 14px;">Bonjour ${name},</p>
    <p style="margin:0 0 18px;">
      Merci pour votre don validé par <strong>${escapeHtml(params.hospitalName)}</strong>.
      Une récompense vient de vous être envoyée via le réseau Lightning.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      <tr><td align="center" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:22px;">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:34px;font-weight:bold;color:#b45309;">
          &#9889; ${sats} sats
        </div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.muted};margin-top:4px;">
          reçus sur Bitcoin / Lightning
        </div>
      </td></tr>
    </table>
    <p style="margin:16px 0 0;">
      Votre générosité compte. Restez disponible : d'autres patients pourraient
      avoir besoin de vous.
    </p>`;

  return {
    subject: `Vous avez reçu ${sats} sats ⚡`,
    html: wrap({
      preheader: `Récompense de ${sats} sats pour votre don.`,
      heading: "Merci, voici votre récompense",
      bodyHtml: body,
      cta: { label: "Voir ma preuve d'intégrité", url: params.verifyUrl },
    }),
  };
}
