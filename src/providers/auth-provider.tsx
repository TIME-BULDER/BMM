"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useMe } from "@/lib/api/hooks";
import type { UserProfile } from "@/lib/api/resources";
import { AUTH_BYPASS, BYPASS_USER } from "@/lib/dev/demo";

type Role = UserProfile["role"];

type AuthContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Vrai en mode démo (bypass d'authentification). */
  isDemo: boolean;
  /** Bascule le rôle simulé (démo uniquement). */
  setDemoRole?: (role: Role) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_ROLE_KEY = "bb-demo-role";

/**
 * Hydrate la session de l'organisation connectée à partir de `/api/v1/auth/me`
 * et l'expose à toute l'application. En mode démo, sert un utilisateur simulé
 * dont le rôle (org_admin / super_admin) est commutable.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isSuccess } = useMe();
  const [demoRole, setDemoRoleState] = useState<Role>("org_admin");

  useEffect(() => {
    if (!AUTH_BYPASS) return;
    const stored = localStorage.getItem(DEMO_ROLE_KEY) as Role | null;
    if (stored === "super_admin" || stored === "org_admin") {
      // Lecture post-montage volontaire (évite le mismatch d'hydratation).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDemoRoleState(stored);
    }
  }, []);

  function setDemoRole(role: Role) {
    localStorage.setItem(DEMO_ROLE_KEY, role);
    setDemoRoleState(role);
  }

  const value: AuthContextValue = AUTH_BYPASS
    ? {
        user: { ...BYPASS_USER, role: demoRole },
        isLoading: false,
        isAuthenticated: true,
        isDemo: true,
        setDemoRole,
      }
    : {
        user: isSuccess ? (data ?? null) : null,
        isLoading,
        isAuthenticated: isSuccess && !!data,
        isDemo: false,
      };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans un <AuthProvider>.");
  }
  return ctx;
}
