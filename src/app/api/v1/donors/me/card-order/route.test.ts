/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";
import { POST as confirmPOST } from "./confirm/route";
import { authService } from "@/modules/auth";
import { donorService } from "@/modules/donors/services/donor.service";
import { izichangeService } from "@/modules/bitcoin/services/izichange.service";

vi.mock("@/modules/auth", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

vi.mock("@/modules/donors/services/donor.service", () => ({
  donorService: {
    getActivitiesCount: vi.fn(),
    createCardOrder: vi.fn(),
    confirmCardOrderPayment: vi.fn(),
  },
}));

vi.mock("@/modules/bitcoin/services/izichange.service", () => ({
  izichangeService: {
    initiateCardPayment: vi.fn(),
  },
}));

describe("Card Order Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/donors/me/card-order", () => {
    it("should return 401 if unauthorized or not a donor", async () => {
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

      const req = new Request("http://localhost/api/v1/donors/me/card-order", {
        method: "POST",
        body: JSON.stringify({ method: "merit" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(401);
    });

    it("should return 400 if ordering by merit but donor has less than 3 activities", async () => {
      vi.mocked(authService.getCurrentUser).mockResolvedValue({
        id: "d1",
        email: "donor@blood.org",
        role: "donor",
        organizationId: null,
        donor: { id: "d1" },
      } as any);
      vi.mocked(donorService.getActivitiesCount).mockResolvedValue(2);

      const req = new Request("http://localhost/api/v1/donors/me/card-order", {
        method: "POST",
        body: JSON.stringify({ method: "merit" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error.message).toContain("pas assez d'activités");
    });

    it("should successfully order by merit if donor has at least 3 activities", async () => {
      vi.mocked(authService.getCurrentUser).mockResolvedValue({
        id: "d1",
        email: "donor@blood.org",
        role: "donor",
        organizationId: null,
        donor: { id: "d1" },
      } as any);
      vi.mocked(donorService.getActivitiesCount).mockResolvedValue(3);
      vi.mocked(donorService.createCardOrder).mockResolvedValue({
        id: "order1",
        status: "merited",
      });

      const req = new Request("http://localhost/api/v1/donors/me/card-order", {
        method: "POST",
        body: JSON.stringify({ method: "merit" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.data.status).toBe("merited");
      expect(donorService.createCardOrder).toHaveBeenCalledWith({
        donorId: "d1",
        status: "merited",
        paymentMethod: "merit",
        amountPaid: 0,
      });
    });

    it("should successfully initiate paid order via Izichange Pay", async () => {
      vi.mocked(authService.getCurrentUser).mockResolvedValue({
        id: "d1",
        email: "donor@blood.org",
        role: "donor",
        organizationId: null,
        donor: { id: "d1" },
      } as any);
      vi.mocked(donorService.createCardOrder).mockResolvedValue({
        id: "order2",
        status: "pending",
      });
      vi.mocked(izichangeService.initiateCardPayment).mockResolvedValue({
        checkoutUrl: "http://checkout.url",
        paymentReference: "ref123",
      });

      const req = new Request("http://localhost/api/v1/donors/me/card-order", {
        method: "POST",
        body: JSON.stringify({ method: "pay" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.data.status).toBe("pending");
      expect(json.data.checkoutUrl).toBe("http://checkout.url");
      expect(donorService.createCardOrder).toHaveBeenCalledWith({
        donorId: "d1",
        status: "pending",
        paymentMethod: "izichange_pay",
        amountPaid: 5000,
      });
    });
  });

  describe("POST /api/v1/donors/me/card-order/confirm", () => {
    it("should return 401 if unauthorized", async () => {
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

      const req = new Request(
        "http://localhost/api/v1/donors/me/card-order/confirm",
        {
          method: "POST",
          body: JSON.stringify({ orderId: "order-id-xyz" }),
        },
      );

      const response = await confirmPOST(req);
      expect(response.status).toBe(401);
    });

    it("should confirm payment successfully", async () => {
      vi.mocked(authService.getCurrentUser).mockResolvedValue({
        id: "d1",
        role: "donor",
        donor: { id: "d1" },
      } as any);
      vi.mocked(donorService.confirmCardOrderPayment).mockResolvedValue(true);

      const orderId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
      const req = new Request(
        "http://localhost/api/v1/donors/me/card-order/confirm",
        {
          method: "POST",
          body: JSON.stringify({ orderId }),
        },
      );

      const response = await confirmPOST(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data.physicalCardStatus).toBe("ordered_paid");
      expect(donorService.confirmCardOrderPayment).toHaveBeenCalledWith(
        orderId,
        "d1",
      );
    });
  });
});
