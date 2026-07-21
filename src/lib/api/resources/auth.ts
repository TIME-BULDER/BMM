import { httpClient } from "@/lib/api/http-client";

import type { OrganizationType, UserProfile } from "./types";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterOrganizationPayload = {
  email: string;
  password: string;
  name: string;
  type: OrganizationType;
  latitude: number;
  longitude: number;
  city: string;
  contactEmail: string;
};

export const authApi = {
  /** Connecte une organisation. La session est posée en cookie côté serveur. */
  login: (payload: LoginPayload) =>
    httpClient.post<unknown>("/auth/login", payload),

  /** Inscrit une organisation et crée son compte administrateur. */
  register: (payload: RegisterOrganizationPayload) =>
    httpClient.post<unknown>("/auth/register", payload),

  /** Ferme la session courante. */
  logout: () => httpClient.post<{ success: boolean }>("/auth/logout"),

  /** Profil de l'organisation connectée (ou 401 si non authentifiée). */
  me: () => httpClient.get<UserProfile>("/auth/me"),
};
