/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";
import { authService } from "@/modules/auth";
import { donorService } from "@/modules/donors/services/donor.service";
import { izichangeService } from "@/modules/bitcoin/services/izichange.service";
import { rewardService } from "@/modules/bitcoin/services/reward.service";

vi.mock("@/modules/auth", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

vi.mock("@/modules/donors/services/donor.service", () => ({
  donorService: {
    getDonorById: vi.fn(),
    updateDonorBalance: vi.fn(),
  },
}));

vi.mock("@/modules/bitcoin/services/izichange.service", () => ({
  izichangeService: {
    cashoutToMoMo: vi.fn(),
  },
}));

vi.mock("@/modules/bitcoin/services/reward.service", () => ({
  rewardService: {
    createRewardLog: vi.fn(),
    updateRewardStatus: vi.fn(),
  },
}));

describe("POST /api/v1/donors/me/withdraw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if unauthorized", async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

    const req = new Request("http://localhost/api/v1/donors/me/withdraw", {
      method: "POST",
      body: JSON.stringify({ amountSats: 500, momoNumber: "+229123456" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it("should return 400 if donor has insufficient balance", async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      id: "d1",
      role: "donor",
      donor: { id: "d1" },
    } as any);

    vi.mocked(donorService.getDonorById).mockResolvedValue({
      id: "d1",
      balanceSats: 300,
    } as any);

    const req = new Request("http://localhost/api/v1/donors/me/withdraw", {
      method: "POST",
      body: JSON.stringify({ amountSats: 500, momoNumber: "+229123456" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error.message).toContain("Solde insuffisant");
  });

  it("should successfully process withdrawal and return 200", async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      id: "d1",
      role: "donor",
      donor: { id: "d1" },
    } as any);

    vi.mocked(donorService.getDonorById).mockResolvedValue({
      id: "d1",
      balanceSats: 1000,
    } as any);

    vi.mocked(donorService.updateDonorBalance).mockResolvedValue(500); // 1000 - 500
    vi.mocked(rewardService.createRewardLog).mockResolvedValue({
      id: "reward1",
    } as any);
    vi.mocked(izichangeService.cashoutToMoMo).mockResolvedValue("txhash123");
    vi.mocked(rewardService.updateRewardStatus).mockResolvedValue({
      id: "reward1",
      status: "completed",
    } as any);

    const req = new Request("http://localhost/api/v1/donors/me/withdraw", {
      method: "POST",
      body: JSON.stringify({ amountSats: 500, momoNumber: "+229123456" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data.balanceSats).toBe(500);

    expect(donorService.updateDonorBalance).toHaveBeenCalledWith("d1", -500);
    expect(izichangeService.cashoutToMoMo).toHaveBeenCalledWith(
      "+229123456",
      500,
    );
    expect(rewardService.updateRewardStatus).toHaveBeenCalledWith(
      "reward1",
      "completed",
      "txhash123",
    );
  });

  it("should rollback balance decrement if cashout fails", async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      id: "d1",
      role: "donor",
      donor: { id: "d1" },
    } as any);

    vi.mocked(donorService.getDonorById).mockResolvedValue({
      id: "d1",
      balanceSats: 1000,
    } as any);

    vi.mocked(donorService.updateDonorBalance).mockResolvedValue(500); // Débit initial
    vi.mocked(rewardService.createRewardLog).mockResolvedValue({
      id: "reward1",
    } as any);
    vi.mocked(izichangeService.cashoutToMoMo).mockRejectedValue(
      new Error("Network Error"),
    );

    const req = new Request("http://localhost/api/v1/donors/me/withdraw", {
      method: "POST",
      body: JSON.stringify({ amountSats: 500, momoNumber: "+229123456" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);

    // Vérifie que le solde est recrédité
    expect(donorService.updateDonorBalance).toHaveBeenLastCalledWith("d1", 500);
    expect(rewardService.updateRewardStatus).toHaveBeenCalledWith(
      "reward1",
      "failed",
      undefined,
      "Network Error",
    );
  });
});
