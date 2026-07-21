import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api/errors";

/** Types de justificatifs requis pour la validation d'une structure. */
export const ORG_DOCUMENT_TYPES = [
  "license",
  "registry",
  "representative_id",
] as const;

export type OrgDocumentType = (typeof ORG_DOCUMENT_TYPES)[number];

const STORAGE_BUCKET = "org-documents";
const SIGNED_URL_TTL = 60 * 10; // 10 minutes

export type OrgDocument = {
  docType: OrgDocumentType;
  fileName: string;
  uploadedAt: Date;
  /** URL signée temporaire (uniquement pour le super-admin). */
  url?: string;
};

type DocRow = {
  doc_type: OrgDocumentType;
  file_name: string;
  storage_path: string;
  uploaded_at: string;
};

function requireAdmin() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error(
      "Stockage indisponible: SUPABASE_SERVICE_ROLE_KEY n'est pas configurée.",
    );
  }
  return admin;
}

export const documentService = {
  /**
   * Téléverse (ou remplace) un justificatif d'une structure dans le bucket
   * privé et enregistre sa référence. L'accès Storage passe par la clé
   * service-role, ce qui contourne le RLS.
   */
  uploadDocument: async (
    organizationId: string,
    docType: OrgDocumentType,
    file: File,
  ): Promise<OrgDocument> => {
    const admin = requireAdmin();

    if (!file || file.size === 0) {
      throw ApiError.badRequest("Fichier manquant ou vide.");
    }
    // Les justificatifs scannés (agréments, statuts) sont souvent volumineux:
    // limite haute à 25 Mo pour ne pas rejeter les PDF de plusieurs pages.
    if (file.size > 25 * 1024 * 1024) {
      throw ApiError.badRequest("Le fichier ne doit pas dépasser 25 Mo.");
    }

    const storagePath = `${organizationId}/${docType}`;

    const { error: uploadError } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) {
      console.error("Org document upload failed:", uploadError);
      throw new Error("Échec du téléversement du justificatif.");
    }

    const { error: rowError } = await admin
      .from("organization_documents")
      .upsert(
        [
          {
            organization_id: organizationId,
            doc_type: docType,
            storage_path: storagePath,
            file_name: file.name,
          },
        ],
        { onConflict: "organization_id,doc_type" },
      );

    if (rowError) {
      console.error("Org document row upsert failed:", rowError);
      throw new Error("Échec de l'enregistrement du justificatif.");
    }

    // Marque la date de soumission au premier justificatif déposé.
    await admin
      .from("organizations")
      .update({ submitted_at: new Date().toISOString() })
      .eq("id", organizationId)
      .is("submitted_at", null);

    return {
      docType,
      fileName: file.name,
      uploadedAt: new Date(),
    };
  },

  /** Liste les justificatifs d'une structure (sans URL, pour la structure). */
  listDocuments: async (organizationId: string): Promise<OrgDocument[]> => {
    const admin = requireAdmin();
    const { data, error } = await admin
      .from("organization_documents")
      .select("doc_type, file_name, storage_path, uploaded_at")
      .eq("organization_id", organizationId);

    if (error || !data) return [];
    return (data as DocRow[]).map((row) => ({
      docType: row.doc_type,
      fileName: row.file_name,
      uploadedAt: new Date(row.uploaded_at),
    }));
  },

  /**
   * Liste les justificatifs avec une URL signée temporaire.
   * Réservé au super-admin (contrôle d'accès effectué dans la route).
   */
  listSignedDocuments: async (
    organizationId: string,
  ): Promise<OrgDocument[]> => {
    const admin = requireAdmin();
    const { data, error } = await admin
      .from("organization_documents")
      .select("doc_type, file_name, storage_path, uploaded_at")
      .eq("organization_id", organizationId);

    if (error || !data) return [];

    const rows = data as DocRow[];
    const signed = await Promise.all(
      rows.map(async (row) => {
        const { data: signedData } = await admin.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(row.storage_path, SIGNED_URL_TTL);
        return {
          docType: row.doc_type,
          fileName: row.file_name,
          uploadedAt: new Date(row.uploaded_at),
          url: signedData?.signedUrl,
        } satisfies OrgDocument;
      }),
    );

    return signed;
  },
};
