import { vi, describe, it, expect } from "vitest";
import { PATCH } from "./route";
import { donorService } from "@/modules/donors/services/donor.service";
import { authService } from "@/modules/auth";
import { otsService } from "@/modules/bitcoin";

vi.mock("@/modules/donors/services/donor.service", () => ({
  donorService: {
    getDonorById: vi.fn(),
    validateDonor: vi.fn(),
    addActivity: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("@/modules/bitcoin", () => ({
  otsService: {
    stampHash: vi.fn(),
  },
}));

vi.mock("@/modules/auth", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

const VALID_UUID = "d3b07384-d113-4632-a5e2-123456789abc";

describe("PATCH /api/v1/donors/[id]/validate", () => {
  it("should validate donor successfully if authorized", async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: "h1",
    });

    const mockDonor = {
      id: VALID_UUID,
      firstName: "Kofi",
      validated: false,
      profileHash: "hash...",
    };
    const mockValidatedDonor = {
      ...mockDonor,
      validated: true,
      otsProof: "ots-proof-xyz",
    };

    vi.mocked(otsService.stampHash).mockResolvedValue("ots-proof-xyz");
    vi.mocked(donorService.getDonorById).mockResolvedValue(
      mockDonor as unknown as Awaited<
        ReturnType<typeof donorService.getDonorById>
      >,
    );
    vi.mocked(donorService.validateDonor).mockResolvedValue(
      mockValidatedDonor as unknown as Awaited<
        ReturnType<typeof donorService.validateDonor>
      >,
    );

    const req = new Request(
      `http://localhost/api/v1/donors/${VALID_UUID}/validate`,
      {
        method: "PATCH",
      },
    );

    const response = await PATCH(req, {
      params: Promise.resolve({ id: VALID_UUID }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data.donor.validated).toBe(true);
    expect(otsService.stampHash).toHaveBeenCalledWith("hash...");
    expect(donorService.validateDonor).toHaveBeenCalledWith(
      VALID_UUID,
      "ots-proof-xyz",
    );
  });

  it("should validate a donor even without an organization link", async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: null,
      organization: null,
    } as unknown as Awaited<ReturnType<typeof authService.getCurrentUser>>);

    const mockDonor = {
      id: VALID_UUID,
      firstName: "Kofi",
      validated: false,
      profileHash: "hash...",
    };
    vi.mocked(otsService.stampHash).mockResolvedValue("ots-proof-xyz");
    vi.mocked(donorService.getDonorById).mockResolvedValue(
      mockDonor as unknown as Awaited<
        ReturnType<typeof donorService.getDonorById>
      >,
    );
    vi.mocked(donorService.validateDonor).mockResolvedValue({
      ...mockDonor,
      validated: true,
      otsProof: "ots-proof-xyz",
    } as unknown as Awaited<ReturnType<typeof donorService.validateDonor>>);

    const req = new Request(
      `http://localhost/api/v1/donors/${VALID_UUID}/validate`,
      {
        method: "PATCH",
      },
    );

    const response = await PATCH(req, {
      params: Promise.resolve({ id: VALID_UUID }),
    });

    expect(response.status).toBe(200);
  });

  it("should return 404 if donor is not found", async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: "h1",
    });
    vi.mocked(donorService.getDonorById).mockResolvedValue(null);

    const req = new Request(
      `http://localhost/api/v1/donors/${VALID_UUID}/validate`,
      {
        method: "PATCH",
      },
    );

    const response = await PATCH(req, {
      params: Promise.resolve({ id: VALID_UUID }),
    });

    expect(response.status).toBe(404);
  });
});
