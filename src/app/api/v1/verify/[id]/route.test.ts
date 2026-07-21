import { vi, describe, it, expect } from "vitest";
import { GET, POST } from "./route";
import { donorService } from "@/modules/donors";
import { otsService, breezService, rewardService } from "@/modules/bitcoin";
import { authService, type UserProfile } from "@/modules/auth";

vi.mock("@/modules/donors", () => {
  return {
    donorService: {
      getDonorById: vi.fn(),
      getActivitiesCount: vi.fn().mockResolvedValue(0),
      addActivity: vi.fn().mockResolvedValue(true),
      updateDonorBalance: vi.fn().mockResolvedValue(1000),
    },
  };
});

vi.mock("@/modules/bitcoin", () => {
  return {
    otsService: {
      verifyTimestamp: vi.fn(),
    },
    breezService: {
      payInvoice: vi.fn(),
    },
    rewardService: {
      createRewardLog: vi.fn(),
      updateRewardStatus: vi.fn(),
      hasRecentCompletedReward: vi.fn(),
    },
  };
});

vi.mock("@/modules/auth", () => {
  return {
    authService: {
      getCurrentUser: vi.fn(),
    },
  };
});

const VALID_UUID = "d3b07384-d113-4632-a5e2-123456789abc";

describe("GET /api/v1/verify/[id]", () => {
  it("should return verification status of donor", async () => {
    const mockDonor = {
      id: VALID_UUID,
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
    };
    vi.mocked(donorService.getDonorById).mockResolvedValue(
      mockDonor as unknown as Awaited<
        ReturnType<typeof donorService.getDonorById>
      >,
    );
    vi.mocked(otsService.verifyTimestamp).mockResolvedValue({
      bitcoin: { height: 800000, timestamp: 1700000000 },
    });

    const req = new Request(`http://localhost/api/v1/verify/${VALID_UUID}`);
    const response = await GET(req, {
      params: Promise.resolve({ id: VALID_UUID }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data.donor.id).toBe(VALID_UUID);
    expect(json.data.verification.isTimestampVerified).toBe(true);
  });
});

describe("POST /api/v1/verify/[id]", () => {
  it("should process reward payout successfully if authorized", async () => {
    const mockUser: UserProfile = {
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: "h1",
    };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const mockDonor = {
      id: VALID_UUID,
      bloodType: "O-",
      city: "Dakar",
      latitude: 14.5,
      longitude: -17.5,
      age: 30,
      available: true,
      bitcoinAddress: "bc1q...",
      profileHash: "hash...",
      otsProof: "proof...",
      createdAt: new Date(),
    };
    vi.mocked(donorService.getDonorById).mockResolvedValue(
      mockDonor as unknown as Awaited<
        ReturnType<typeof donorService.getDonorById>
      >,
    );
    vi.mocked(rewardService.hasRecentCompletedReward).mockResolvedValue(false);

    const mockRewardLog = {
      id: "r1",
      donorId: VALID_UUID,
      hospitalId: "h1",
      satsAmount: 1000,
      status: "pending" as const,
      bolt11Invoice: "lnbc10u1...",
      paymentHash: null,
      errorMessage: null,
      createdAt: new Date(),
    };
    vi.mocked(rewardService.createRewardLog).mockResolvedValue(
      mockRewardLog as unknown as Awaited<
        ReturnType<typeof rewardService.createRewardLog>
      >,
    );
    vi.mocked(breezService.payInvoice).mockResolvedValue({
      paymentHash: "txhash123",
    });
    vi.mocked(rewardService.updateRewardStatus).mockResolvedValue({
      ...mockRewardLog,
      status: "completed" as const,
      paymentHash: "txhash123",
    } as unknown as Awaited<
      ReturnType<typeof rewardService.updateRewardStatus>
    >);

    const body = { bolt11Invoice: "lnbc10u1..." };
    const req = new Request(`http://localhost/api/v1/verify/${VALID_UUID}`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await POST(req, {
      params: Promise.resolve({ id: VALID_UUID }),
    });
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.data.message).toContain("Récompense envoyée");
    expect(breezService.payInvoice).toHaveBeenCalledWith("lnbc10u1...");
    expect(rewardService.updateRewardStatus).toHaveBeenCalledWith(
      "r1",
      "completed",
      "txhash123",
    );
  });

  it("should return 401 if unauthorized", async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

    const req = new Request(`http://localhost/api/v1/verify/${VALID_UUID}`, {
      method: "POST",
      body: JSON.stringify({ bolt11Invoice: "lnbc..." }),
    });

    const response = await POST(req, {
      params: Promise.resolve({ id: VALID_UUID }),
    });
    expect(response.status).toBe(401);
  });

  it("should return 409 conflict if donor was rewarded within 60 days", async () => {
    const mockUser: UserProfile = {
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: "h1",
    };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const mockDonor = {
      id: VALID_UUID,
      bloodType: "O-",
      city: "Dakar",
      latitude: 14.5,
      longitude: -17.5,
      age: 30,
      available: true,
      bitcoinAddress: "bc1q...",
      profileHash: "hash...",
      otsProof: "proof...",
      createdAt: new Date(),
    };
    vi.mocked(donorService.getDonorById).mockResolvedValue(
      mockDonor as unknown as Awaited<
        ReturnType<typeof donorService.getDonorById>
      >,
    );
    vi.mocked(rewardService.hasRecentCompletedReward).mockResolvedValue(true);

    const req = new Request(`http://localhost/api/v1/verify/${VALID_UUID}`, {
      method: "POST",
      body: JSON.stringify({ bolt11Invoice: "lnbc..." }),
    });

    const response = await POST(req, {
      params: Promise.resolve({ id: VALID_UUID }),
    });
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error.code).toBe("conflict");
  });
});
