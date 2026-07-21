import { vi, describe, it, expect, beforeEach } from "vitest";
import { campaignService } from "./campaign.service";
import { donorService } from "@/modules/donors";

vi.mock("@/modules/donors", () => {
  return {
    donorService: {
      getAllAvailableDonors: vi.fn(),
    },
  };
});

vi.mock("@/lib/supabase/server", () => {
  const mockSingle = vi.fn();
  const mockInsert = vi.fn(() => ({
    select: vi.fn(() => ({
      single: mockSingle,
    })),
  }));

  const client = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: mockSingle,
        })),
      })),
      insert: mockInsert,
    })),
  };

  return {
    createSupabaseServerClient: vi.fn(() => Promise.resolve(client)),
  };
});

describe("campaignService", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe("findTargetedDonors", () => {
    it("should return donors within radius and matching group if targeted", async () => {
      const mockDonors = [
        {
          id: "d1",
          firstName: "Alice",
          lastName: "Smith",
          email: "alice@example.com",
          phoneNumber: "+1",
          bloodType: "O-",
          city: "Dakar",
          latitude: 14.7167,
          longitude: -17.4677,
          age: 25,
          available: true,
          bitcoinAddress: "bc1...",
          profileHash: "h1...",
          otsProof: null,
          createdAt: new Date(),
        },
        {
          id: "d2",
          firstName: "Bob",
          lastName: "Jones",
          email: "bob@example.com",
          phoneNumber: "+2",
          bloodType: "A+",
          city: "Dakar",
          latitude: 14.7167,
          longitude: -17.4677,
          age: 35,
          available: true,
          bitcoinAddress: "bc2...",
          profileHash: "h2...",
          otsProof: null,
          createdAt: new Date(),
        },
      ];
      vi.mocked(donorService.getAllAvailableDonors).mockResolvedValue(
        mockDonors as unknown as Awaited<
          ReturnType<typeof donorService.getAllAvailableDonors>
        >,
      );

      // Recherche ciblée sur O- à Dakar
      const results = await campaignService.findTargetedDonors(
        "targeted",
        "O-",
        14.7167,
        -17.4677,
        10,
      );

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("d1");
    });
  });
});
