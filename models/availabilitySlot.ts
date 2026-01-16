import { Timestamp } from "firebase/firestore";
import { BabyPageId } from "./babyPage";

export type AvailabilitySlotId = string;
export type BookingMode = "auto_confirm" | "manual_approval";
export type SlotStatus = "active" | "cancelled";

export interface AvailabilitySlotDocument {
  id: AvailabilitySlotId;
  babyPageId: BabyPageId;
  ownerId: string;

  startTime: Timestamp;
  endTime: Timestamp;

  maxGuests: number;
  visitDuration: number; // in minutes

  mealAvailable: boolean;
  mealPreferences?: string;

  bookingMode: BookingMode;
  minimumLeadTimeHours: number;

  status: SlotStatus;
  currentBookings: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const DEFAULT_SLOT_SETTINGS = {
  maxGuests: 4,
  visitDuration: 60,
  mealAvailable: false,
  bookingMode: "auto_confirm" as BookingMode,
  minimumLeadTimeHours: 2,
};
