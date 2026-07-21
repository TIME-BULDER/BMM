import { vi, describe, it, expect } from "vitest";
import { POST } from "./route";
import { authService } from "@/modules/auth";

vi.mock("@/modules/auth", () => {
  const mockSchema = {
    parse: vi.fn((data) => {
      if (!data.email || !data.password || !data.name)
        throw new Error("Validation failed");
      return data;
    }),
  };
  return {
    signUpSchema: mockSchema,
    authService: {
      signUpOrganization: vi.fn(),
    },
  };
});

describe("POST /api/v1/auth/register", () => {
  it("should return 201 and created user/org data on successful registration", async () => {
    const mockResult = {
      user: { id: "u1" },
      organization: { id: "o1", name: "Hospital Dakar" },
    };
    vi.mocked(authService.signUpOrganization).mockResolvedValue(
      mockResult as unknown as Awaited<
        ReturnType<typeof authService.signUpOrganization>
      >,
    );

    const body = {
      email: "hospital@blood.org",
      password: "password123",
      name: "Hospital Dakar",
      type: "hospital",
      latitude: 14.5,
      longitude: -17.5,
      city: "Dakar",
      contactEmail: "contact@blood.org",
    };

    const req = new Request("http://localhost/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json.data).toEqual(mockResult);
    expect(authService.signUpOrganization).toHaveBeenCalledWith(body);
  });
});
