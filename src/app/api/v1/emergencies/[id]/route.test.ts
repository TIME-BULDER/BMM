import { vi, describe, it, expect } from "vitest";
import { GET, PATCH, DELETE } from "./route";
import { emergencyService, type EmergencyRecord } from "@/modules/emergencies";
import { authService, type UserProfile } from "@/modules/auth";

vi.mock("@/modules/emergencies", () => {
  const mockSchema = {
    parse: vi.fn((data) => data),
  };
  return {
    updateEmergencyStatusSchema: mockSchema,
    emergencyService: {
      getEmergencyById: vi.fn(),
      updateEmergencyStatus: vi.fn(),
      deleteEmergency: vi.fn(),
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

describe("GET /api/v1/emergencies/[id]", () => {
  it("should return 200 and the emergency if found and user is authenticated", async () => {
    const mockUser: UserProfile = {
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: "h1",
    };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const mockEmergency: EmergencyRecord = {
      id: VALID_UUID,
      hospitalId: "h1",
      bloodType: "O-",
      quantityNeeded: 1,
      city: "Dakar",
      latitude: 14.7167,
      longitude: -17.4677,
      status: "active",
      createdAt: new Date("2026-06-30T12:00:00.000Z"),
    };
    vi.mocked(emergencyService.getEmergencyById).mockResolvedValue(
      mockEmergency,
    );

    const req = new Request(
      `http://localhost/api/v1/emergencies/${VALID_UUID}`,
    );
    const response = await GET(req, {
      params: Promise.resolve({ id: VALID_UUID }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toEqual({
      ...mockEmergency,
      createdAt: mockEmergency.createdAt.toISOString(),
    });
    expect(emergencyService.getEmergencyById).toHaveBeenCalledWith(VALID_UUID);
  });
});

describe("PATCH /api/v1/emergencies/[id]", () => {
  it("should successfully update emergency status if user owns the emergency", async () => {
    const mockUser: UserProfile = {
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: "h1",
    };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const mockEmergency: EmergencyRecord = {
      id: VALID_UUID,
      hospitalId: "h1",
      bloodType: "O-",
      quantityNeeded: 1,
      city: "Dakar",
      latitude: 14.7167,
      longitude: -17.4677,
      status: "active",
      createdAt: new Date("2026-06-30T12:00:00.000Z"),
    };
    const mockUpdated: EmergencyRecord = {
      id: VALID_UUID,
      hospitalId: "h1",
      bloodType: "O-",
      quantityNeeded: 1,
      city: "Dakar",
      latitude: 14.7167,
      longitude: -17.4677,
      status: "resolved",
      createdAt: new Date("2026-06-30T12:00:00.000Z"),
    };

    vi.mocked(emergencyService.getEmergencyById).mockResolvedValue(
      mockEmergency,
    );
    vi.mocked(emergencyService.updateEmergencyStatus).mockResolvedValue(
      mockUpdated,
    );

    const req = new Request(
      `http://localhost/api/v1/emergencies/${VALID_UUID}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status: "resolved" }),
      },
    );

    const response = await PATCH(req, {
      params: Promise.resolve({ id: VALID_UUID }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toEqual({
      ...mockUpdated,
      createdAt: mockUpdated.createdAt.toISOString(),
    });
  });

  it("should return 403 if user tries to update another hospital's emergency", async () => {
    const mockUser: UserProfile = {
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: "other-hospital",
    };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const mockEmergency: EmergencyRecord = {
      id: VALID_UUID,
      hospitalId: "h1",
      bloodType: "O-",
      quantityNeeded: 1,
      city: "Dakar",
      latitude: 14.7167,
      longitude: -17.4677,
      status: "active",
      createdAt: new Date("2026-06-30T12:00:00.000Z"),
    };

    vi.mocked(emergencyService.getEmergencyById).mockResolvedValue(
      mockEmergency,
    );

    const req = new Request(
      `http://localhost/api/v1/emergencies/${VALID_UUID}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status: "resolved" }),
      },
    );

    const response = await PATCH(req, {
      params: Promise.resolve({ id: VALID_UUID }),
    });

    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error.code).toBe("forbidden");
  });
});

describe("DELETE /api/v1/emergencies/[id]", () => {
  it("should successfully delete an emergency if owned by user", async () => {
    const mockUser: UserProfile = {
      id: "u1",
      email: "hospital@blood.org",
      role: "org_admin",
      organizationId: "h1",
    };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const mockEmergency: EmergencyRecord = {
      id: VALID_UUID,
      hospitalId: "h1",
      bloodType: "O-",
      quantityNeeded: 1,
      city: "Dakar",
      latitude: 14.7167,
      longitude: -17.4677,
      status: "active",
      createdAt: new Date("2026-06-30T12:00:00.000Z"),
    };
    vi.mocked(emergencyService.getEmergencyById).mockResolvedValue(
      mockEmergency,
    );
    vi.mocked(emergencyService.deleteEmergency).mockResolvedValue(true);

    const req = new Request(
      `http://localhost/api/v1/emergencies/${VALID_UUID}`,
      {
        method: "DELETE",
      },
    );

    const response = await DELETE(req, {
      params: Promise.resolve({ id: VALID_UUID }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toEqual({ success: true });
  });
});
