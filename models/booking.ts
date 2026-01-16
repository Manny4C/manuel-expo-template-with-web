import { Timestamp } from "firebase/firestore";
import { BabyPageId } from "./babyPage";
import { AvailabilitySlotId } from "./availabilitySlot";
import { GuestId } from "./guestList";

export type BookingId = string;
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export interface TagAlong {
  guestId: GuestId;
  name: string;
}

export interface BookingDocument {
  id: BookingId;
  babyPageId: BabyPageId;
  availabilitySlotId: AvailabilitySlotId;

  visitorId: string;
  visitorName: string;
  visitorEmail: string;

  arrivalTime: Timestamp;

  tagAlongs: TagAlong[];
  totalGuestCount: number;

  bringingMeal: boolean;
  mealDescription?: string;

  status: BookingStatus;

  visitorNotes?: string;
  parentNotes?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmedAt?: Timestamp;
  cancelledAt?: Timestamp;
  completedAt?: Timestamp;
}
