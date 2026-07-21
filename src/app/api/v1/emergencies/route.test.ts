import { vi, describe, it, expect } from "vitest";
import { POST, GET } from "./route";
import { emergencyService, type EmergencyRecord } from "@/modules/emergencies";
import { authService, type UserProfile } from "@/modules/auth";

vi.mock("@/modules/emergencies", () => {
  const mockSchema = {
    parse: vi.fn((data) => {
      if (!data.bloodType) throw new Error("Validation failed");
      return data;
    }),
  };
  return {
    createEmergencySchema: mockSchema,
    emergencyService: {
      createEmergency: vi.fn(),
      getHospitalEmergencies: vi.fn(),
      getAllActiveEmergencies: vi.fn(),
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

describe("POST /api/v1/emergencies", () => {
  it("should return 201 and the created emergency on success", async () => {
    const mockUser: UserProfile = {
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: "h1-uuid",
    };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const mockEmergency: EmergencyRecord = {
      id: "e1-uuid",
      hospitalId: "h1-uuid",
      bloodType: "O-",
      quantityNeeded: 2,
      city: "Dakar",
      latitude: 14.7167,
      longitude: -17.4677,
      status: "active",
      createdAt: new Date("2026-06-30T12:00:00.000Z"),
    };
    vi.mocked(emergencyService.createEmergency).mockResolvedValue(
      mockEmergency,
    );

    const body = {
      bloodType: "O-",
      quantityNeeded: 2,
      city: "Dakar",
      latitude: 14.7167,
      longitude: -17.4677,
    };

    const req = new Request("http://localhost/api/v1/emergencies", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json.data).toEqual({
      ...mockEmergency,
      createdAt: mockEmergency.createdAt.toISOString(),
    });
    expect(emergencyService.createEmergency).toHaveBeenCalledWith({
      ...body,
      hospitalId: "h1-uuid",
    });
  });

  it("should allow creating an emergency without an organization (hospitalId null)", async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: null,
    } as unknown as UserProfile);

    vi.mocked(emergencyService.createEmergency).mockResolvedValue({
      id: "e2-uuid",
      hospitalId: null,
      bloodType: "O-",
      quantityNeeded: 1,
      city: "Cotonou",
      latitude: 6.37,
      longitude: 2.42,
      status: "active",
      createdAt: new Date("2026-06-30T12:00:00.000Z"),
    } as unknown as EmergencyRecord);

    const body = {
      bloodType: "O-",
      quantityNeeded: 1,
      city: "Cotonou",
      latitude: 6.37,
      longitude: 2.42,
    };

    const req = new Request("http://localhost/api/v1/emergencies", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);
    expect(emergencyService.createEmergency).toHaveBeenCalledWith({
      ...body,
      hospitalId: null,
    });
  });
});

describe("GET /api/v1/emergencies", () => {
  it("should fetch all active emergencies when no hospitalId is provided", async () => {
    const mockUser: UserProfile = {
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: "h1",
    };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const mockEmergencies: EmergencyRecord[] = [
      {
        id: "e1",
        hospitalId: "h1",
        bloodType: "O-",
        quantityNeeded: 1,
        city: "Dakar",
        latitude: 14.7167,
        longitude: -17.4677,
        status: "active",
        createdAt: new Date("2026-06-30T12:00:00.000Z"),
      },
    ];
    vi.mocked(emergencyService.getAllActiveEmergencies).mockResolvedValue(
      mockEmergencies,
    );

    const req = new Request("http://localhost/api/v1/emergencies");
    const response = await GET(req);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toEqual([
      {
        ...mockEmergencies[0],
        createdAt: mockEmergencies[0].createdAt.toISOString(),
      },
    ]);
  });

  it("should fetch hospital emergencies if user queries their own hospitalId", async () => {
    const mockUser: UserProfile = {
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: "h1",
    };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const mockEmergencies: EmergencyRecord[] = [
      {
        id: "e1",
        hospitalId: "h1",
        bloodType: "O-",
        quantityNeeded: 1,
        city: "Dakar",
        latitude: 14.7167,
        longitude: -17.4677,
        status: "active",
        createdAt: new Date("2026-06-30T12:00:00.000Z"),
      },
    ];
    vi.mocked(emergencyService.getHospitalEmergencies).mockResolvedValue(
      mockEmergencies,
    );

    const req = new Request(
      "http://localhost/api/v1/emergencies?hospitalId=h1",
    );
    const response = await GET(req);

    expect(response.status).toBe(200);
    expect(emergencyService.getHospitalEmergencies).toHaveBeenCalledWith("h1");
  });

  it("should return 403 if org_admin queries another hospital's emergencies", async () => {
    const mockUser: UserProfile = {
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: "h1",
    };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const req = new Request(
      "http://localhost/api/v1/emergencies?hospitalId=h2",
    );
    const response = await GET(req);

    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error.code).toBe("forbidden");
  });
});
