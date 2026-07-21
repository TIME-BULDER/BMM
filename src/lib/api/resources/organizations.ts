import { httpClient, HttpError } from "@/lib/api/http-client";
import { API_ERROR_CODE } from "@/lib/api/errors";
import type { ApiFailure, ApiSuccess } from "@/lib/api/response";

import type { Organization } from "./types";

export type OrgDocumentType = "license" | "registry" | "representative_id";

export type OrgDocument = {
  docType: OrgDocumentType;
  fileName: string;
  uploadedAt: string;
  /** URL signée temporaire (vue super-admin uniquement). */
  url?: string;
};

/** Justificatifs requis, dans l'ordre d'affichage. */
export const ORG_DOCUMENT_TYPES: OrgDocumentType[] = [
  "license",
  "registry",
  "representative_id",
];

/** Libellés lisibles des justificatifs requis. */
export const ORG_DOCUMENT_LABELS: Record<OrgDocumentType, string> = {
  license: "Agrément / autorisation d'exercice",
  registry: "Registre de commerce / statuts",
  representative_id: "Pièce d'identité du représentant légal",
};

export const organizationsApi = {
  /** Liste toutes les organisations (super-admin). */
  list: () => httpClient.get<Organization[]>("/organizations"),

  /** Vérifie une organisation (super-admin). */
  verify: (id: string) =>
    httpClient.patch<Organization>(`/organizations/${id}/verify`),

  /** Rejette une organisation avec un motif (super-admin). */
  reject: (id: string, reason: string) =>
    httpClient.patch<Organization>(`/organizations/${id}/reject`, { reason }),

  /** Recharge le compte d'approvisionnement de la structure connectée. */
  recharge: (amountSats: number) =>
    httpClient.post<{ balanceSats: number }>("/organizations/me/recharge", {
      amountSats,
    }),

  /** Justificatifs déposés par la structure connectée. */
  myDocuments: () =>
    httpClient.get<OrgDocument[]>("/organizations/me/documents"),

  /** Justificatifs d'une structure avec URLs signées (super-admin). */
  documentsForOrg: (id: string) =>
    httpClient.get<OrgDocument[]>(`/organizations/${id}/documents`),

  /**
   * Téléverse un justificatif. Envoi multipart: on contourne le httpClient
   * (qui force le JSON) pour poster un `FormData`.
   */
  uploadDocument: async (docType: OrgDocumentType, file: File) => {
    const formData = new FormData();
    formData.append("docType", docType);
    formData.append("file", file);

    const response = await fetch("/api/v1/organizations/me/documents", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as
      ApiSuccess<OrgDocument> | ApiFailure | null;

    if (!response.ok || payload === null || "error" in payload) {
      const error = payload && "error" in payload ? payload.error : null;
      throw new HttpError(
        response.status,
        error?.code ?? API_ERROR_CODE.INTERNAL_ERROR,
        error?.message ?? "Échec du téléversement du justificatif.",
        error?.details,
      );
    }

    return payload.data;
  },
};
