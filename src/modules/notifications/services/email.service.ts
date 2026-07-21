import { renderRewardEmail, renderWelcomeEmail } from "../templates";

/**
 * Service d'envoi d'emails transactionnels via EmailJS (API REST).
 *
 * Le HTML est intégralement rendu ici (voir `templates.ts`). Côté EmailJS,
 * un seul gabarit universel suffit, avec pour corps la variable brute
 * `{{{html_body}}}`, un sujet `{{subject}}` et un destinataire `{{to_email}}`.
 *
 * Best-effort: si la configuration est absente, on journalise sans échouer
 * (une action métier ne doit jamais être bloquée par l'email).
 */

const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

type SendResult = { sent: boolean };

async function send(
  toEmail: string,
  subject: string,
  html: string,
): Promise<SendResult> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.warn(
      `[EMAIL] Configuration EmailJS incomplète - email simulé vers ${toEmail} (« ${subject} »)`,
    );
    return { sent: false };
  }

  try {
    const response = await fetch(EMAILJS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: { to_email: toEmail, subject, html_body: html },
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[EMAIL] Échec d'envoi (${response.status}): ${detail}`);
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    console.error("[EMAIL] Erreur réseau lors de l'envoi:", error);
    return { sent: false };
  }
}

export const emailService = {
  /**
   * Email de bienvenue d'un nouveau donneur. Ne contient jamais la clé
   * privée (générée et conservée côté navigateur uniquement).
   */
  sendDonorWelcome: (params: {
    toEmail: string;
    toName: string;
    bloodType: string;
    city: string;
    verifyUrl: string;
  }): Promise<SendResult> => {
    const { subject, html } = renderWelcomeEmail(params);
    return send(params.toEmail, subject, html);
  },

  /** Email de récompense Lightning après un don validé. */
  sendDonorReward: (params: {
    toEmail: string;
    toName: string;
    sats: number;
    hospitalName: string;
    verifyUrl: string;
  }): Promise<SendResult> => {
    const { subject, html } = renderRewardEmail(params);
    return send(params.toEmail, subject, html);
  },
};
