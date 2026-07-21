/**
 * Codes d'erreur métier exposés par l'API.
 * Stables dans le temps: le frontend peut s'y fier pour réagir.
 */
export const API_ERROR_CODE = {
  BAD_REQUEST: "bad_request",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "not_found",
  CONFLICT: "conflict",
  VALIDATION_ERROR: "validation_error",
  RATE_LIMITED: "rate_limited",
  INTERNAL_ERROR: "internal_error",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE];

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  [API_ERROR_CODE.BAD_REQUEST]: 400,
  [API_ERROR_CODE.UNAUTHORIZED]: 401,
  [API_ERROR_CODE.FORBIDDEN]: 403,
  [API_ERROR_CODE.NOT_FOUND]: 404,
  [API_ERROR_CODE.CONFLICT]: 409,
  [API_ERROR_CODE.VALIDATION_ERROR]: 422,
  [API_ERROR_CODE.RATE_LIMITED]: 429,
  [API_ERROR_CODE.INTERNAL_ERROR]: 500,
};

/**
 * Erreur applicative typée, convertie en réponse HTTP normalisée
 * par le gestionnaire de routes. Ne jamais exposer un message brut
 * provenant d'une exception interne au client.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(
    code: ApiErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }

  static badRequest(
    message = "Requête invalide.",
    details?: Record<string, unknown>,
  ) {
    return new ApiError(API_ERROR_CODE.BAD_REQUEST, message, details);
  }

  static unauthorized(message = "Authentification requise.") {
    return new ApiError(API_ERROR_CODE.UNAUTHORIZED, message);
  }

  static forbidden(message = "Accès refusé.") {
    return new ApiError(API_ERROR_CODE.FORBIDDEN, message);
  }

  static notFound(message = "Ressource introuvable.") {
    return new ApiError(API_ERROR_CODE.NOT_FOUND, message);
  }

  static conflict(message = "Conflit avec l'état actuel de la ressource.") {
    return new ApiError(API_ERROR_CODE.CONFLICT, message);
  }
}
