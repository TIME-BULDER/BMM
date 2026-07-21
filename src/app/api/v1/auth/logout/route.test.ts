import { vi, describe, it, expect } from "vitest";
import { POST } from "./route";
import { authService } from "@/modules/auth";

vi.mock("@/modules/auth", () => {
  return {
    authService: {
      logout: vi.fn(),
    },
  };
});

describe("POST /api/v1/auth/logout", () => {
  it("should successfully log out and return success", async () => {
    vi.mocked(authService.logout).mockResolvedValue(
      undefined as unknown as Awaited<ReturnType<typeof authService.logout>>,
    );

    const response = await POST();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.data).toEqual({ success: true });
    expect(authService.logout).toHaveBeenCalled();
  });
});
