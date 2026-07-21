import { vi, describe, it, expect } from "vitest";
import { POST, GET } from "./route";
import { donorService } from "@/modules/donors/services/donor.service";
import { walletService, otsService } from "@/modules/bitcoin";
import { authService } from "@/modules/auth";

vi.mock("@/modules/donors/services/donor.service", () => {
  return {
    donorService: {
      createDonor: vi.fn(),
      getValidatedDonors: vi.fn(),
      getAllDonors: vi.fn(),
    },
  };
});

vi.mock("@/modules/donors", () => {
  const mockSchema = {
    parse: vi.fn((data) => {
      if (!data.email || !data.password) throw new Error("Validation failed");
      return data;
    }),
  };
  return {
    createDonorSchema: mockSchema,
  };
});

vi.mock("@/modules/bitcoin", () => {
  return {
    walletService: {
      verifySignature: vi.fn(),
    },
    otsService: {
      stampHash: vi.fn(),
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

describe("POST /api/v1/donors", () => {
  it("should successfully register a donor and return 201", async () => {
    vi.mocked(walletService.verifySignature).mockReturnValue(true);
    vi.mocked(otsService.stampHash).mockResolvedValue("ots-proof-xyz");

    const mockDonor = {
      id: "u1",
      firstName: "John",
      lastName: "Doe",
      email: "john@doe.com",
      phoneNumber: "+221...",
      bloodType: "O-" as const,
      city: "Dakar",
      latitude: 14.5,
      longitude: -17.5,
      age: 30,
      available: true,
      bitcoinAddress: "bc1q...",
      profileHash: "hash...",
      otsProof: null,
      createdAt: new Date("2026-06-30T12:00:00.000Z"),
    };
    vi.mocked(donorService.createDonor).mockResolvedValue(
      mockDonor as unknown as Awaited<
        ReturnType<typeof donorService.createDonor>
      >,
    );

    const body = {
      firstName: "John",
      lastName: "Doe",
      email: "john@doe.com",
      phoneNumber: "+221...",
      bloodType: "O-",
      city: "Dakar",
      latitude: 14.5,
      longitude: -17.5,
      age: 30,
      bitcoinAddress: "bc1q...",
      profileHash: "hash...",
      signature: "sig...",
      password: "password123",
    };

    const req = new Request("http://localhost/api/v1/donors", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json.data).toEqual({
      ...mockDonor,
      createdAt: mockDonor.createdAt.toISOString(),
    });
    expect(walletService.verifySignature).toHaveBeenCalledWith(
      "hash...",
      "bc1q...",
      "sig...",
    );
    expect(donorService.createDonor).toHaveBeenCalledWith(
      {
        ...body,
        otsProof: null,
      },
      { asAdmin: false },
    );
  });

  it("should return 400 if BIP-322 signature is invalid", async () => {
    vi.mocked(walletService.verifySignature).mockReturnValue(false);

    const body = {
      firstName: "John",
      lastName: "Doe",
      email: "john@doe.com",
      phoneNumber: "+221...",
      bloodType: "O-",
      city: "Dakar",
      latitude: 14.5,
      longitude: -17.5,
      age: 30,
      bitcoinAddress: "bc1q...",
      profileHash: "hash...",
      signature: "sig-invalid...",
      password: "password123",
    };

    const req = new Request("http://localhost/api/v1/donors", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error.code).toBe("bad_request");
  });
});

describe("GET /api/v1/donors", () => {
  it("should return 401 if unauthorized", async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error.code).toBe("unauthorized");
  });

  it("should return 200 and list of validated donors if authorized", async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: "h1",
    });

    const mockDonors = [
      {
        id: "d1",
        firstName: "Jane",
        lastName: "Doe",
        bloodType: "A+",
        validated: true,
      },
      {
        id: "d2",
        firstName: "Kofi",
        lastName: "Mensah",
        bloodType: "O-",
        validated: false,
      },
    ];
    vi.mocked(donorService.getAllDonors).mockResolvedValue(
      mockDonors as unknown as Awaited<
        ReturnType<typeof donorService.getAllDonors>
      >,
    );

    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toEqual(mockDonors);
  });
});
