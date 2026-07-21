import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import { emergencyService } from "./emergency.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Mock de Supabase Server Client
vi.mock("@/lib/supabase/server", () => {
  const mockSingle = vi.fn();
  const mockSelect = vi.fn(() => ({
    single: mockSingle,
  }));
  const mockInsert = vi.fn(() => ({
    select: mockSelect,
  }));
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockUpdate = vi.fn(() => ({
    eq: mockEq,
  }));
  const mockDelete = vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({ error: null })),
  }));

  const client = {
    from: vi.fn(() => ({
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      order: mockOrder,
    })),
  };

  return {
    createSupabaseServerClient: vi.fn(() => Promise.resolve(client)),
  };
});

describe("emergencyService", () => {
  let mockClient: { from: Mock };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockClient = (await createSupabaseServerClient()) as unknown as {
      from: Mock;
    };
  });

  describe("createEmergency", () => {
    it("should successfully insert a new emergency and return the mapped record", async () => {
      const mockResult = {
        id: "e123-uuid",
        hospital_id: "h567-uuid",
        blood_type: "O-",
        quantity_needed: 2,
        city: "Dakar",
        latitude: 14.7167,
        longitude: -17.4677,
        status: "active",
        created_at: "2026-06-30T12:00:00.000Z",
      };

      // Mocker la chaîne de Supabase .from().insert().select().single()
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: mockResult, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockInsert = vi.fn(() => ({ select: mockSelect }));
      mockClient.from.mockReturnValue({ insert: mockInsert });

      const dto = {
        hospitalId: "h567-uuid",
        bloodType: "O-" as const,
        quantityNeeded: 2,
        city: "Dakar",
        latitude: 14.7167,
        longitude: -17.4677,
      };

      const result = await emergencyService.createEmergency(dto);

      expect(mockClient.from).toHaveBeenCalledWith("emergencies");
      expect(mockInsert).toHaveBeenCalledWith([
        {
          hospital_id: dto.hospitalId,
          blood_type: dto.bloodType,
          quantity_needed: dto.quantityNeeded,
          city: dto.city,
          latitude: dto.latitude,
          longitude: dto.longitude,
          status: "active",
        },
      ]);
      expect(result).toEqual({
        id: "e123-uuid",
        hospitalId: "h567-uuid",
        bloodType: "O-",
        quantityNeeded: 2,
        city: "Dakar",
        latitude: 14.7167,
        longitude: -17.4677,
        status: "active",
        createdAt: new Date("2026-06-30T12:00:00.000Z"),
      });
    });

    it("should throw an error if supabase insert fails", async () => {
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "DB Error" } });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockInsert = vi.fn(() => ({ select: mockSelect }));
      mockClient.from.mockReturnValue({ insert: mockInsert });

      const dto = {
        hospitalId: "h567-uuid",
        bloodType: "O-" as const,
        quantityNeeded: 2,
        city: "Dakar",
        latitude: 14.7167,
        longitude: -17.4677,
      };

      await expect(emergencyService.createEmergency(dto)).rejects.toThrow(
        "Erreur lors de la création de l'urgence",
      );
    });
  });

  describe("getEmergencyById", () => {
    it("should return the emergency record if found", async () => {
      const mockRecord = {
        id: "e123-uuid",
        hospital_id: "h567-uuid",
        blood_type: "A+",
        quantity_needed: 1,
        city: "Abidjan",
        latitude: 5.36,
        longitude: -4.0083,
        status: "active",
        created_at: "2026-06-30T12:00:00.000Z",
      };

      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: mockRecord, error: null });
      const mockEq = vi.fn(() => ({ single: mockSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      mockClient.from.mockReturnValue({ select: mockSelect });

      const result = await emergencyService.getEmergencyById("e123-uuid");

      expect(mockClient.from).toHaveBeenCalledWith("emergencies");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("id", "e123-uuid");
      expect(result).toEqual({
        id: "e123-uuid",
        hospitalId: "h567-uuid",
        bloodType: "A+",
        quantityNeeded: 1,
        city: "Abidjan",
        latitude: 5.36,
        longitude: -4.0083,
        status: "active",
        createdAt: new Date("2026-06-30T12:00:00.000Z"),
      });
    });

    it("should return null if emergency is not found", async () => {
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Not Found" } });
      const mockEq = vi.fn(() => ({ single: mockSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      mockClient.from.mockReturnValue({ select: mockSelect });

      const result = await emergencyService.getEmergencyById("invalid-id");
      expect(result).toBeNull();
    });
  });

  describe("getHospitalEmergencies", () => {
    it("should return the list of emergencies for a given hospital", async () => {
      const mockList = [
        {
          id: "e1",
          hospital_id: "h1",
          blood_type: "B+",
          quantity_needed: 1,
          city: "Bamako",
          latitude: 12.6392,
          longitude: -8.0029,
          status: "active",
          created_at: "2026-06-30T12:00:00.000Z",
        },
      ];

      const mockOrder = vi
        .fn()
        .mockResolvedValue({ data: mockList, error: null });
      const mockEq = vi.fn(() => ({ order: mockOrder }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      mockClient.from.mockReturnValue({ select: mockSelect });

      const result = await emergencyService.getHospitalEmergencies("h1");

      expect(mockClient.from).toHaveBeenCalledWith("emergencies");
      expect(mockEq).toHaveBeenCalledWith("hospital_id", "h1");
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toHaveLength(1);
      expect(result[0].city).toBe("Bamako");
    });
  });

  describe("updateEmergencyStatus", () => {
    it("should update and return the updated record", async () => {
      const mockRecord = {
        id: "e1",
        hospital_id: "h1",
        blood_type: "B+",
        quantity_needed: 1,
        city: "Bamako",
        latitude: 12.6392,
        longitude: -8.0029,
        status: "resolved",
        created_at: "2026-06-30T12:00:00.000Z",
      };

      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: mockRecord, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockEq = vi.fn(() => ({ select: mockSelect }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));
      mockClient.from.mockReturnValue({ update: mockUpdate });

      const result = await emergencyService.updateEmergencyStatus(
        "e1",
        "resolved",
      );

      expect(mockClient.from).toHaveBeenCalledWith("emergencies");
      expect(mockUpdate).toHaveBeenCalledWith({ status: "resolved" });
      expect(mockEq).toHaveBeenCalledWith("id", "e1");
      expect(result?.status).toBe("resolved");
    });
  });

  describe("deleteEmergency", () => {
    it("should return true if deletion succeeds", async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn(() => ({ eq: mockEq }));
      mockClient.from.mockReturnValue({ delete: mockDelete });

      const result = await emergencyService.deleteEmergency("e1");

      expect(mockClient.from).toHaveBeenCalledWith("emergencies");
      expect(mockEq).toHaveBeenCalledWith("id", "e1");
      expect(result).toBe(true);
    });

    it("should return false if deletion fails", async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: { message: "Error" } });
      const mockDelete = vi.fn(() => ({ eq: mockEq }));
      mockClient.from.mockReturnValue({ delete: mockDelete });

      const result = await emergencyService.deleteEmergency("e1");
      expect(result).toBe(false);
    });
  });
});
