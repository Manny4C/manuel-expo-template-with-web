import { Timestamp } from "firebase/firestore";
import { BabyPageId } from "./babyPage";

export type GuestId = string;
export type VisitStatus = "not_booked" | "booked" | "visited";

export interface GuestListDocument {
  id: GuestId;
  babyPageId: BabyPageId;
  ownerId: string;

  name: string;
  email: string;
  phone?: string;
  relationship?: string;

  visitStatus: VisitStatus;
  lastVisitDate?: Timestamp;
  totalVisits: number;

  canBook: boolean;
  canBeTagAlong: boolean;

  linkedUserId?: string;

  notes?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
