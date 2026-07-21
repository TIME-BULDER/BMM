import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import { donorService } from "./donor.service";
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

  const mockAuth = {
    signUp: vi.fn(),
  };

  const client = {
    auth: mockAuth,
    from: vi.fn(() => ({
      insert: mockInsert,
      select: mockSelect,
    })),
  };

  return {
    createSupabaseServerClient: vi.fn(() => Promise.resolve(client)),
  };
});

describe("donorService", () => {
  let mockClient: { auth: Record<string, Mock>; from: Mock };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockClient = (await createSupabaseServerClient()) as unknown as {
      auth: Record<string, Mock>;
      from: Mock;
    };
  });

  describe("createDonor", () => {
    it("should successfully sign up auth user and insert donor profile", async () => {
      const mockAuthUser = { data: { user: { id: "u1" } }, error: null };
      mockClient.auth.signUp.mockResolvedValue(
        mockAuthUser as unknown as Awaited<
          ReturnType<typeof mockClient.auth.signUp>
        >,
      );

      const mockDbRecord = {
        id: "u1",
        first_name: "John",
        last_name: "Doe",
        email: "john@doe.com",
        phone_number: "+22177...",
        blood_type: "O-",
        city: "Dakar",
        latitude: 14.5,
        longitude: -17.5,
        age: 30,
        available: true,
        bitcoin_address: "bc1q...",
        profile_hash: "hash...",
        ots_proof: "proof...",
        created_at: "2026-06-30T12:00:00.000Z",
      };

      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: mockDbRecord, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockInsert = vi.fn(() => ({
        select: mockSelect,
        single: mockSingle,
      }));
      mockClient.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
      } as unknown as ReturnType<typeof mockClient.from>);

      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "john@doe.com",
        phoneNumber: "+22177...",
        bloodType: "O-" as const,
        city: "Dakar",
        latitude: 14.5,
        longitude: -17.5,
        age: 30,
        available: true,
        bitcoinAddress: "bc1q...",
        profileHash: "hash...",
        password: "password123",
        signature: "signature...",
        otsProof: "proof...",
      };

      const result = await donorService.createDonor(data);

      expect(mockClient.auth.signUp).toHaveBeenCalledWith({
        email: data.email,
        password: data.password,
      });
      expect(result).toEqual({
        id: "u1",
        firstName: "John",
        lastName: "Doe",
        email: "john@doe.com",
        phoneNumber: "+22177...",
        bloodType: "O-",
        city: "Dakar",
        latitude: 14.5,
        longitude: -17.5,
        age: 30,
        available: true,
        bitcoinAddress: "bc1q...",
        profileHash: "hash...",
        otsProof: "proof...",
        createdAt: new Date("2026-06-30T12:00:00.000Z"),
        balanceSats: 0,
        cardType: "virtual",
        physicalCardStatus: "none",
        referredBy: null,
        validated: false,
      });
    });
  });
});
