import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import { authService } from "./auth.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => {
  const mockSingle = vi.fn();
  const mockSelect = vi.fn(() => ({
    single: mockSingle,
  }));
  const mockInsert = vi.fn(() => ({
    select: mockSelect,
    single: mockSingle,
  }));
  const mockDelete = vi.fn(() => ({
    eq: vi.fn().mockResolvedValue({ error: null }),
  }));
  const mockEq = vi.fn(() => ({
    single: mockSingle,
  }));

  const mockAuth = {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    getUser: vi.fn(),
  };

  const client = {
    auth: mockAuth,
    from: vi.fn(() => ({
      insert: mockInsert,
      select: mockSelect,
      delete: mockDelete,
      eq: mockEq,
    })),
  };

  return {
    createSupabaseServerClient: vi.fn(() => Promise.resolve(client)),
    createSupabaseAdminClient: vi.fn(() => client),
  };
});

describe("authService", () => {
  let mockClient: { auth: Record<string, Mock>; from: Mock };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockClient = (await createSupabaseServerClient()) as unknown as {
      auth: Record<string, Mock>;
      from: Mock;
    };
  });

  describe("login", () => {
    it("should sign in successfully and return auth data", async () => {
      const mockAuthData = { user: { id: "u1" }, session: {} };
      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      const credentials = { email: "test@blood.org", password: "password123" };
      const result = await authService.login(credentials);

      expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
      });
      expect(result).toEqual(mockAuthData);
    });

    it("should throw an error if auth fails", async () => {
      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid credentials" },
      });

      const credentials = {
        email: "test@blood.org",
        password: "wrongpassword",
      };
      await expect(authService.login(credentials)).rejects.toThrow(
        "Email ou mot de passe incorrect.",
      );
    });
  });

  describe("logout", () => {
    it("should sign out successfully", async () => {
      mockClient.auth.signOut.mockResolvedValue({ error: null });
      await expect(authService.logout()).resolves.toBeUndefined();
      expect(mockClient.auth.signOut).toHaveBeenCalled();
    });

    it("should throw an error if sign out fails", async () => {
      mockClient.auth.signOut.mockResolvedValue({
        error: { message: "SignOut error" },
      });
      await expect(authService.logout()).rejects.toThrow(
        "Erreur de déconnexion",
      );
    });
  });

  describe("getCurrentUser", () => {
    it("should return mapped profile if user has active session", async () => {
      const mockUser = { id: "u1", email: "admin@hospital.org" };
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockProfile = {
        id: "u1",
        organization_id: "org1",
        role: "org_admin",
        organization: {
          id: "org1",
          name: "Hospital Center",
          type: "hospital",
          latitude: 12.5,
          longitude: -7.5,
          city: "Dakar",
          contact_email: "contact@hospital.org",
          verified: true,
          created_at: "2026-06-30T12:00:00.000Z",
        },
      };

      // getCurrentUser vérifie d'abord la table donors (aucun donneur ici),
      // puis user_profiles. Les deux lectures utilisent maybeSingle.
      const makeChain = (result: { data: unknown; error: null }) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue(result) })),
        })),
      });
      mockClient.from.mockImplementation((table: string) =>
        table === "donors"
          ? makeChain({ data: null, error: null })
          : makeChain({ data: mockProfile, error: null }),
      );

      const result = await authService.getCurrentUser();

      expect(mockClient.auth.getUser).toHaveBeenCalled();
      expect(mockClient.from).toHaveBeenCalledWith("user_profiles");
      expect(result).toEqual({
        id: "u1",
        email: "admin@hospital.org",
        role: "org_admin",
        organizationId: "org1",
        organization: {
          id: "org1",
          name: "Hospital Center",
          type: "hospital",
          latitude: 12.5,
          longitude: -7.5,
          city: "Dakar",
          contactEmail: "contact@hospital.org",
          verified: true,
          rejectionReason: null,
          createdAt: new Date("2026-06-30T12:00:00.000Z"),
          balanceSats: 0,
        },
      });
    });

    it("should return null if there is no active session", async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
      const result = await authService.getCurrentUser();
      expect(result).toBeNull();
    });
  });
});
