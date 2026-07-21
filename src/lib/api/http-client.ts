import { API_ERROR_CODE, type ApiErrorCode } from "./errors";
import type { ApiFailure, ApiMeta, ApiSuccess } from "./response";

/**
 * Erreur levée côté client lorsqu'une requête API échoue.
 * Le message est sûr à afficher: il provient de l'enveloppe API.
 */
export class HttpError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export type HttpResult<T> = {
  data: T;
  meta: ApiMeta;
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  searchParams?: Record<string, string | number | boolean | undefined>;
};

const DEFAULT_BASE_URL = "/api/v1";

function buildUrl(path: string, searchParams?: RequestOptions["searchParams"]) {
  const url = path.startsWith("http") ? path : `${DEFAULT_BASE_URL}${path}`;
  if (!searchParams) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined) params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `${url}?${query}` : url;
}

async function request<T>(
  path: string,
  { body, searchParams, headers, ...init }: RequestOptions = {},
): Promise<HttpResult<T>> {
  const response = await fetch(buildUrl(path, searchParams), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as
    ApiSuccess<T> | ApiFailure | null;

  if (!response.ok || payload === null || "error" in payload) {
    const error = payload && "error" in payload ? payload.error : null;
    throw new HttpError(
      response.status,
      error?.code ?? API_ERROR_CODE.INTERNAL_ERROR,
      error?.message ?? "Une erreur est survenue.",
      error?.details,
    );
  }

  return { data: payload.data, meta: payload.meta };
}

/**
 * Client HTTP centralisé. Toute communication du frontend avec l'API
 * passe par ce module pour garantir un traitement d'erreur uniforme.
 */
export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
