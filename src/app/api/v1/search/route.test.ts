import { vi, describe, it, expect } from "vitest";
import { GET } from "./route";
import { donorService } from "@/modules/donors";
import { matchingService } from "@/modules/matching";

vi.mock("@/modules/donors", () => ({
  donorService: {
    getAllAvailableDonors: vi.fn(),
  },
}));

vi.mock("@/modules/matching", () => ({
  matchingService: {
    findMatchingDonors: vi.fn(),
    findAIEmergencyMatching: vi.fn(),
  },
}));

describe("GET /api/v1/search", () => {
  it("should return classic matches by default", async () => {
    const mockDonors = [{ id: "d1" }];
    const mockMatches = [{ id: "d1", distanceKm: 2.5 }];

    vi.mocked(donorService.getAllAvailableDonors).mockResolvedValue(
      mockDonors as unknown as Awaited<
        ReturnType<typeof donorService.getAllAvailableDonors>
      >,
    );
    vi.mocked(matchingService.findMatchingDonors).mockReturnValue(
      mockMatches as unknown as ReturnType<
        typeof matchingService.findMatchingDonors
      >,
    );

    const req = new Request(
      "http://localhost/api/v1/search?bloodType=O-&lat=14.5&lon=-17.5",
    );
    const response = await GET(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.ai).toBe(false);
    expect(json.matches).toEqual(mockMatches);
    expect(matchingService.findMatchingDonors).toHaveBeenCalled();
  });

  it("should return AI-calculated matches if ai=true", async () => {
    const mockAIMatches = [
      { id: "d1", distanceKm: 2.5, score: 95, explanation: "Excellent Match" },
    ];
    vi.mocked(matchingService.findAIEmergencyMatching).mockResolvedValue(
      mockAIMatches as unknown as Awaited<
        ReturnType<typeof matchingService.findAIEmergencyMatching>
      >,
    );

    const req = new Request(
      "http://localhost/api/v1/search?bloodType=O-&lat=14.5&lon=-17.5&ai=true",
    );
    const response = await GET(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.ai).toBe(true);
    expect(json.matches).toEqual(mockAIMatches);
    expect(matchingService.findAIEmergencyMatching).toHaveBeenCalledWith(
      "O-",
      14.5,
      -17.5,
    );
  });
});
