import { Timestamp } from "firebase/firestore";

export type BabyPageId = string;
export type SlugId = string;

export interface HouseRules {
  requireMask: boolean;
  noSickVisitors: boolean;
  noKissing: boolean;
  washHands: boolean;
  removeShoes: boolean;
  customRules: string;
}

export type PagePrivacy = "private" | "searchable";
export type BookingAccess = "open" | "login_required";

export interface BabyPageDocument {
  id: BabyPageId;
  slug: SlugId;
  ownerId: string;

  babyName: string;
  parentNames: string[];
  photoId?: string;
  photoUri?: string;

  houseRules: HouseRules;

  privacy: PagePrivacy;
  bookingAccess: BookingAccess;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SlugDocument {
  babyPageId: BabyPageId;
  ownerId: string;
}

export const DEFAULT_HOUSE_RULES: HouseRules = {
  requireMask: false,
  noSickVisitors: true,
  noKissing: false,
  washHands: true,
  removeShoes: false,
  customRules: "",
};
