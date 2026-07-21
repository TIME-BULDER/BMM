import { donorService } from "@/modules/donors";
import { otsService, breezService, rewardService } from "@/modules/bitcoin";
import { pointsService } from "@/modules/donations/services/points.service";
import { izichangeService } from "@/modules/bitcoin/services/izichange.service";
import { authService } from "@/modules/auth";
import { organizationService } from "@/modules/organizations/services/organization.service";
import { emailService } from "@/modules/notifications";
import { serverPublicUrl } from "@/lib/url.server";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { handleApiError, success, failure } from "@/lib/api/response";
import { z } from "zod";

const rewardPayloadSchema = z
  .object({
    bolt11Invoice: z
      .string()
      .min(10, "La facture BOLT11 est invalide")
      .optional(),
    momoNumber: z.string().min(8, "Le numéro MoMo est invalide").optional(),
    awardPoints: z.boolean().optional(),
    creditBalance: z.boolean().optional(),
    satsAmount: z
      .number()
      .min(1, "Le montant doit être supérieur à 0")
      .optional(),
  })
  .refine(
    (data) =>
      data.bolt11Invoice ||
      data.momoNumber ||
      data.awardPoints ||
      data.creditBalance,
    {
      message:
        "Vous devez fournir soit une facture BOLT11, soit un numéro MoMo, soit choisir l'attribution de points, soit créditer le solde",
    },
  );

/**
 * GET /api/v1/verify/[id]
 * Récupère le statut de vérification publique d'un donneur (blockchain OpenTimestamps)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = (await params).id;

    // Validation : l'ID doit être un UUID valide
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Format d'ID invalide", {
        status: 400,
      });
    }

    const donor = await donorService.getDonorById(id);
    if (!donor) {
      return failure(API_ERROR_CODE.NOT_FOUND, "Donneur introuvable", {
        status: 404,
      });
    }

    // Vérification de la preuve d'horodatage si elle existe
    let isTimestampVerified = false;
    let verificationDetails = null;

    if (donor.otsProof) {
      const verifyResult = (await otsService.verifyTimestamp(
        donor.profileHash,
        donor.otsProof,
      )) as { bitcoin?: { height: number; timestamp: number } } | null;

      if (verifyResult && verifyResult.bitcoin) {
        isTimestampVerified = true;
        verificationDetails = {
          height: verifyResult.bitcoin.height,
          timestamp: verifyResult.bitcoin.timestamp,
        };
      }
    }

    const activityCount = await donorService.getActivitiesCount(donor.id);

    return success({
      donor: {
        id: donor.id,
        bloodType: donor.bloodType,
        bitcoinAddress: donor.bitcoinAddress,
        profileHash: donor.profileHash,
        hasOtsProof: !!donor.otsProof,
        createdAt: donor.createdAt,
        balanceSats: donor.balanceSats,
        cardType: donor.cardType,
        physicalCardStatus: donor.physicalCardStatus,
        activityCount,
      },
      verification: {
        isTimestampVerified,
        details: verificationDetails,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/v1/verify/[id]
 * Attribue une récompense en Satoshis (via Breez Liquid / Lightning Network)
 * à un donneur suite à la validation physique de son don.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Authentification & Autorisation (Seuls les hôpitaux/administrateurs connectés peuvent récompenser)
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    const id = (await params).id;

    // Validation du format UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Format d'ID invalide", {
        status: 400,
      });
    }

    // 2. Vérification que le donneur existe
    const donor = await donorService.getDonorById(id);
    if (!donor) {
      return failure(API_ERROR_CODE.NOT_FOUND, "Donneur introuvable", {
        status: 404,
      });
    }

    // Vérification de sécurité réglementaire: interdiction de récompenser plus d'une fois tous les 60 jours
    const hasRecentReward = await rewardService.hasRecentCompletedReward(
      id,
      60,
    );
    if (hasRecentReward) {
      return failure(
        API_ERROR_CODE.CONFLICT,
        "Le donneur a déjà reçu une récompense au cours des 60 derniers jours.",
        { status: 409 },
      );
    }

    // 3. Validation de la facture BOLT11
    const body = await req.json();
    const validatedData = rewardPayloadSchema.parse(body);
    const satsAmount = validatedData.satsAmount || 1000;

    // 4. Initialisation d'une trace de paiement en statut 'pending'
    // Pour MoMo, on stocke "momo:<numero>" dans bolt11Invoice
    // Pour les points, on stocke "points"
    const invoiceOrMomo = validatedData.awardPoints
      ? "points"
      : validatedData.creditBalance
        ? "credit_balance"
        : validatedData.momoNumber
          ? `momo:${validatedData.momoNumber}`
          : validatedData.bolt11Invoice || "";

    const rewardLog = await rewardService.createRewardLog({
      donorId: id,
      hospitalId: user.organizationId ?? null,
      satsAmount,
      bolt11Invoice: invoiceOrMomo,
    });

    try {
      // 5. Exécution du paiement Lightning via Breez, ou MoMo via Izichange, ou attribution de points, ou crédit de solde
      let paymentHash: string;

      if (validatedData.awardPoints) {
        const pointsResult = await pointsService.awardPoints(
          id,
          satsAmount,
          user.organizationId || undefined,
        );
        if (!pointsResult.success || !pointsResult.proofBase64) {
          throw new Error("Échec de l'attribution des points de fidélité.");
        }
        paymentHash = `points_ots_${pointsResult.proofBase64.substring(0, 16)}`;
      } else if (validatedData.creditBalance) {
        const newBal = await donorService.updateDonorBalance(id, satsAmount);
        if (newBal === null) {
          throw new Error("Impossible de créditer le solde du donneur.");
        }
        paymentHash = `credit_balance_${Math.random().toString(36).substring(2, 12)}`;
      } else if (validatedData.momoNumber) {
        paymentHash = await izichangeService.cashoutToMoMo(
          validatedData.momoNumber,
          satsAmount,
        );
      } else {
        const payoutResult = await breezService.payInvoice(
          validatedData.bolt11Invoice as string,
        );
        if (!payoutResult || !payoutResult.paymentHash) {
          throw new Error(
            "Paiement échoué. Aucun hash de transaction retourné.",
          );
        }
        paymentHash = payoutResult.paymentHash;
      }

      // 6. Mise à jour de la trace en succès
      const updatedLog = await rewardService.updateRewardStatus(
        rewardLog.id,
        "completed",
        paymentHash,
      );

      // 6b. Débit du compte d'approvisionnement de la structure (best-effort).
      // Les points de fidélité ne coûtent rien : pas de débit dans ce cas.
      if (user.organizationId && !validatedData.awardPoints) {
        await organizationService
          .adjustBalance(user.organizationId, -satsAmount)
          .catch((e) => console.error("Débit du solde structure échoué:", e));
      }

      // Enregistrer l'activité de don de sang
      await donorService.addActivity(
        id,
        "blood_donation",
        `Don de sang physique récompensé (${satsAmount} sats).`,
      );

      // 7. Email de récompense (best-effort: n'échoue jamais le paiement).
      void emailService
        .sendDonorReward({
          toEmail: donor.email,
          toName: `${donor.firstName} ${donor.lastName}`,
          sats: satsAmount,
          hospitalName: user.organization?.name ?? "un centre partenaire",
          verifyUrl: await serverPublicUrl(`/verify/${donor.id}`),
        })
        .catch((e) => console.error("Reward email failed:", e));

      return success({
        message: "Récompense envoyée avec succès.",
        reward: updatedLog,
      });
    } catch (paymentError) {
      const errorMsg =
        paymentError instanceof Error
          ? paymentError.message
          : "Échec de la transaction Lightning";

      // Enregistrement de l'échec en base pour l'audit
      const failedLog = await rewardService.updateRewardStatus(
        rewardLog.id,
        "failed",
        undefined,
        errorMsg,
      );

      return failure(
        API_ERROR_CODE.INTERNAL_ERROR,
        `Échec du paiement Lightning: ${errorMsg}`,
        {
          status: 500,
          details: { reward: failedLog },
        },
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}
