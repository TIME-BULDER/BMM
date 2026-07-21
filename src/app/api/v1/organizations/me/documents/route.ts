import { authService } from "@/modules/auth";
import {
  documentService,
  ORG_DOCUMENT_TYPES,
  type OrgDocumentType,
} from "@/modules/organizations";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

/**
 * GET /api/v1/organizations/me/documents
 * Justificatifs déjà déposés par la structure connectée (sans URL).
 */
export async function GET() {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }
    if (!user.organizationId) {
      return failure(
        API_ERROR_CODE.FORBIDDEN,
        "Aucune structure associée à ce compte.",
        { status: 403 },
      );
    }

    const documents = await documentService.listDocuments(user.organizationId);
    return success(documents);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/v1/organizations/me/documents
 * Téléverse un justificatif (multipart: `docType` + `file`).
 */
export async function POST(req: Request) {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }
    if (!user.organizationId) {
      return failure(
        API_ERROR_CODE.FORBIDDEN,
        "Aucune structure associée à ce compte.",
        { status: 403 },
      );
    }

    const formData = await req.formData();
    const docType = String(formData.get("docType"));
    const file = formData.get("file");

    if (!ORG_DOCUMENT_TYPES.includes(docType as OrgDocumentType)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Type de document invalide.", {
        status: 400,
      });
    }
    if (!(file instanceof File)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Fichier manquant.", {
        status: 400,
      });
    }

    const document = await documentService.uploadDocument(
      user.organizationId,
      docType as OrgDocumentType,
      file,
    );
    return success(document, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
