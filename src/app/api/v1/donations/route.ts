import { breezService } from "@/modules/bitcoin";
import {
  createDonationSchema,
  donationService,
  type DonationPurpose,
} from "@/modules/donations";
import { authService } from "@/modules/auth";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

const purposeLabel: Record<DonationPurpose, string> = {
  campaign: "Campagne de don",
  development: "Developpement de la plateforme",
  operations: "Fonctionnement",
  emergency: "Fonds d'urgence",
};

/**
 * POST /api/v1/donations
 * Genere une facture Lightning (BOLT11) pour un don a la plateforme, avec
 * l'objectif choisi. Endpoint public: n'importe qui peut soutenir le projet.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createDonationSchema.parse(body);

    const description = `Bitcoin Blood - ${purposeLabel[data.purpose]}${
      data.message ? ` : ${data.message}` : ""
    }`;

    const invoice = await breezService.receivePayment(
      data.amountSats,
      description,
    );

    if (!invoice.bolt11) {
      return failure(
        API_ERROR_CODE.INTERNAL_ERROR,
        "Impossible de generer la facture Lightning pour le moment.",
        { status: 502 },
      );
    }

    // Journalisation best-effort (ne bloque jamais le don).
    void donationService
      .logDonation({
        ...data,
        bolt11: invoice.bolt11,
        simulated: invoice.simulated,
      })
      .catch(() => {});

    return success(
      {
        bolt11: invoice.bolt11,
        amountSats: data.amountSats,
        purpose: data.purpose,
        feesSat: invoice.feesSat,
        simulated: invoice.simulated,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/v1/donations
 * Historique des dons a la plateforme + total collecte. Reserve au super-admin.
 */
export async function GET() {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }
    if (user.role !== "super_admin") {
      return failure(
        API_ERROR_CODE.FORBIDDEN,
        "Acces reserve au super-admin.",
        {
          status: 403,
        },
      );
    }

    const donations = await donationService.listDonations();
    const totalSats = donations.reduce((sum, d) => sum + d.amountSats, 0);
    return success({ donations, totalSats, count: donations.length });
  } catch (error) {
    return handleApiError(error);
  }
}
