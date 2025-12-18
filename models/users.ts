import { GeoPoint, Timestamp } from "firebase/firestore";

export type UserId = string;

export interface UserDocument {
  id: UserId;
  name: string;
  email: string;
  pushToken?: string;
  friendCode?: string;

  photoId?: string;
  photoUri?: string;

  hasCompletedOnboarding?: boolean;

  friends?: UserId[];
  blocked?: UserId[];

  // TODO: These are example fields
  lastActivity?: Timestamp;
  lastLocation?: GeoPoint;
}
