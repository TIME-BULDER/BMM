import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("combine des classes conditionnelles", () => {
    expect(cn("px-2", false && "hidden", "py-1")).toBe("px-2 py-1");
  });

  it("résout les conflits Tailwind au profit de la dernière classe", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
