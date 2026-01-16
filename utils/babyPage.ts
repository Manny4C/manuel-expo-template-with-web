import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

import { firestore } from "@/lib/firebase";
import {
  BabyPageDocument,
  HouseRules,
  PagePrivacy,
  BookingAccess,
  DEFAULT_HOUSE_RULES,
} from "@/models/babyPage";
import { normalizeSlug, reserveSlug, releaseSlug } from "./slug";

export interface CreateBabyPageInput {
  slug: string;
  ownerId: string;
  babyName: string;
  parentNames: string[];
  photoId?: string;
  photoUri?: string;
  houseRules?: Partial<HouseRules>;
  privacy?: PagePrivacy;
  bookingAccess?: BookingAccess;
}

export async function createBabyPage(
  input: CreateBabyPageInput
): Promise<BabyPageDocument> {
  if (!firestore) throw new Error("Firestore not initialized");

  const normalizedSlug = normalizeSlug(input.slug);
  const pageRef = doc(collection(firestore, "babyPages"));
  const pageId = pageRef.id;

  const now = Timestamp.now();
  const pageData: Omit<BabyPageDocument, "id"> = {
    slug: normalizedSlug,
    ownerId: input.ownerId,
    babyName: input.babyName,
    parentNames: input.parentNames,
    photoId: input.photoId,
    photoUri: input.photoUri,
    houseRules: {
      ...DEFAULT_HOUSE_RULES,
      ...input.houseRules,
    },
    privacy: input.privacy || "private",
    bookingAccess: input.bookingAccess || "open",
    createdAt: now,
    updatedAt: now,
  };

  // Reserve the slug first
  await reserveSlug(normalizedSlug, pageId, input.ownerId);

  // Then create the baby page
  await setDoc(pageRef, pageData);

  return { id: pageId, ...pageData };
}

export interface UpdateBabyPageInput {
  babyName?: string;
  parentNames?: string[];
  photoId?: string;
  photoUri?: string;
  houseRules?: Partial<HouseRules>;
  privacy?: PagePrivacy;
  bookingAccess?: BookingAccess;
}

export async function updateBabyPage(
  pageId: string,
  input: UpdateBabyPageInput
): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  const pageRef = doc(firestore, "babyPages", pageId);

  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (input.babyName !== undefined) updateData.babyName = input.babyName;
  if (input.parentNames !== undefined) updateData.parentNames = input.parentNames;
  if (input.photoId !== undefined) updateData.photoId = input.photoId;
  if (input.photoUri !== undefined) updateData.photoUri = input.photoUri;
  if (input.privacy !== undefined) updateData.privacy = input.privacy;
  if (input.bookingAccess !== undefined) updateData.bookingAccess = input.bookingAccess;

  if (input.houseRules) {
    // Merge house rules
    const pageSnapshot = await getDoc(pageRef);
    if (pageSnapshot.exists()) {
      const existingRules = (pageSnapshot.data() as BabyPageDocument).houseRules;
      updateData.houseRules = { ...existingRules, ...input.houseRules };
    }
  }

  await updateDoc(pageRef, updateData);
}

export async function deleteBabyPage(pageId: string): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  const pageRef = doc(firestore, "babyPages", pageId);
  const pageSnapshot = await getDoc(pageRef);

  if (!pageSnapshot.exists()) return;

  const page = pageSnapshot.data() as BabyPageDocument;

  // Release the slug
  await releaseSlug(page.slug);

  // Delete the baby page
  await deleteDoc(pageRef);

  // TODO: Also delete related availability slots, bookings, and guest list
}

export async function getBabyPage(pageId: string): Promise<BabyPageDocument | null> {
  if (!firestore) return null;

  const pageRef = doc(firestore, "babyPages", pageId);
  const snapshot = await getDoc(pageRef);

  if (!snapshot.exists()) return null;

  return { id: snapshot.id, ...snapshot.data() } as BabyPageDocument;
}

export async function getUserBabyPages(userId: string): Promise<BabyPageDocument[]> {
  if (!firestore) return [];

  const pagesRef = collection(firestore, "babyPages");
  const q = query(pagesRef, where("ownerId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as BabyPageDocument[];
}
