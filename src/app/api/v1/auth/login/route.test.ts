import { vi, describe, it, expect } from "vitest";
import { POST } from "./route";
import { authService } from "@/modules/auth";

vi.mock("@/modules/auth", () => {
  const mockSchema = {
    parse: vi.fn((data) => {
      if (!data.email || !data.password) throw new Error("Validation failed");
      return data;
    }),
  };
  return {
    loginSchema: mockSchema,
    authService: {
      login: vi.fn(),
    },
  };
});

describe("POST /api/v1/auth/login", () => {
  it("should return 200 and session data on successful authentication", async () => {
    const mockSession = {
      user: { id: "u1" },
      session: { access_token: "jwt" },
    };
    vi.mocked(authService.login).mockResolvedValue(
      mockSession as unknown as Awaited<ReturnType<typeof authService.login>>,
    );

    const body = { email: "hospital@blood.org", password: "password123" };
    const req = new Request("http://localhost/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.data).toEqual(mockSession);
    expect(authService.login).toHaveBeenCalledWith(body);
  });
});
