import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { API_ERROR_CODE, ApiError, type ApiErrorCode } from "./errors";

export type ApiMeta = Record<string, unknown>;

export type ApiSuccess<T> = {
  data: T;
  meta: ApiMeta;
};

export type ApiFailure = {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
};

export function success<T>(
  data: T,
  init?: { meta?: ApiMeta; status?: number },
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    { data, meta: init?.meta ?? {} },
    { status: init?.status ?? 200 },
  );
}

export function failure(
  code: ApiErrorCode,
  message: string,
  init?: { details?: Record<string, unknown>; status: number },
): NextResponse<ApiFailure> {
  return NextResponse.json(
    { error: { code, message, details: init?.details } },
    { status: init?.status ?? 400 },
  );
}

/**
 * Convertit toute exception levée dans un Route Handler en réponse
 * normalisée. Les erreurs inattendues sont masquées derrière un
 * message générique pour ne jamais fuiter de détails techniques.
 */
export function handleApiError(error: unknown): NextResponse<ApiFailure> {
  if (error instanceof ApiError) {
    return failure(error.code, error.message, {
      details: error.details,
      status: error.status,
    });
  }

  if (error instanceof ZodError) {
    return failure(API_ERROR_CODE.VALIDATION_ERROR, "Données invalides.", {
      details: { issues: error.flatten() },
      status: 422,
    });
  }

  console.error("Erreur API non gérée:", error);

  return failure(
    API_ERROR_CODE.INTERNAL_ERROR,
    "Une erreur interne est survenue.",
    { status: 500 },
  );
}
