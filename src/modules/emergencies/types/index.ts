import { z } from "zod";
import { createEmergencySchema } from "../schemas";

export type CreateEmergencyDTO = z.infer<typeof createEmergencySchema>;

export type EmergencyRecord = {
  id: string;
  hospitalId: string;
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  quantityNeeded: number;
  city: string;
  latitude: number;
  longitude: number;
  status: "active" | "resolved" | "cancelled";
  createdAt: Date;
};
