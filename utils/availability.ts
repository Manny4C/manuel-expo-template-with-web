import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from "firebase/firestore";

import { firestore } from "@/lib/firebase";
import {
  AvailabilitySlotDocument,
  BookingMode,
  DEFAULT_SLOT_SETTINGS,
} from "@/models/availabilitySlot";

export interface CreateAvailabilitySlotInput {
  babyPageId: string;
  ownerId: string;
  startTime: Date;
  endTime: Date;
  maxGuests?: number;
  visitDuration?: number;
  mealAvailable?: boolean;
  mealPreferences?: string;
  bookingMode?: BookingMode;
  minimumLeadTimeHours?: number;
}

export async function createAvailabilitySlot(
  input: CreateAvailabilitySlotInput
): Promise<AvailabilitySlotDocument> {
  if (!firestore) throw new Error("Firestore not initialized");

  const slotRef = doc(collection(firestore, "availabilitySlots"));
  const slotId = slotRef.id;

  const now = Timestamp.now();
  const slotData: Omit<AvailabilitySlotDocument, "id"> = {
    babyPageId: input.babyPageId,
    ownerId: input.ownerId,
    startTime: Timestamp.fromDate(input.startTime),
    endTime: Timestamp.fromDate(input.endTime),
    maxGuests: input.maxGuests ?? DEFAULT_SLOT_SETTINGS.maxGuests,
    visitDuration: input.visitDuration ?? DEFAULT_SLOT_SETTINGS.visitDuration,
    mealAvailable: input.mealAvailable ?? DEFAULT_SLOT_SETTINGS.mealAvailable,
    mealPreferences: input.mealPreferences,
    bookingMode: input.bookingMode ?? DEFAULT_SLOT_SETTINGS.bookingMode,
    minimumLeadTimeHours:
      input.minimumLeadTimeHours ?? DEFAULT_SLOT_SETTINGS.minimumLeadTimeHours,
    status: "active",
    currentBookings: 0,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(slotRef, slotData);

  return { id: slotId, ...slotData };
}

export interface UpdateAvailabilitySlotInput {
  startTime?: Date;
  endTime?: Date;
  maxGuests?: number;
  visitDuration?: number;
  mealAvailable?: boolean;
  mealPreferences?: string;
  bookingMode?: BookingMode;
  minimumLeadTimeHours?: number;
}

export async function updateAvailabilitySlot(
  slotId: string,
  input: UpdateAvailabilitySlotInput
): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  const slotRef = doc(firestore, "availabilitySlots", slotId);

  const updateData: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  if (input.startTime !== undefined)
    updateData.startTime = Timestamp.fromDate(input.startTime);
  if (input.endTime !== undefined)
    updateData.endTime = Timestamp.fromDate(input.endTime);
  if (input.maxGuests !== undefined) updateData.maxGuests = input.maxGuests;
  if (input.visitDuration !== undefined)
    updateData.visitDuration = input.visitDuration;
  if (input.mealAvailable !== undefined)
    updateData.mealAvailable = input.mealAvailable;
  if (input.mealPreferences !== undefined)
    updateData.mealPreferences = input.mealPreferences;
  if (input.bookingMode !== undefined)
    updateData.bookingMode = input.bookingMode;
  if (input.minimumLeadTimeHours !== undefined)
    updateData.minimumLeadTimeHours = input.minimumLeadTimeHours;

  await updateDoc(slotRef, updateData);
}

export async function cancelAvailabilitySlot(slotId: string): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  const slotRef = doc(firestore, "availabilitySlots", slotId);
  await updateDoc(slotRef, {
    status: "cancelled",
    updatedAt: Timestamp.now(),
  });
}

export async function deleteAvailabilitySlot(slotId: string): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  const slotRef = doc(firestore, "availabilitySlots", slotId);
  await deleteDoc(slotRef);
}

export async function getAvailabilitySlotsForPage(
  babyPageId: string,
  includeExpired = false
): Promise<AvailabilitySlotDocument[]> {
  if (!firestore) return [];

  const slotsRef = collection(firestore, "availabilitySlots");

  let q = query(
    slotsRef,
    where("babyPageId", "==", babyPageId),
    where("status", "==", "active"),
    orderBy("startTime", "asc")
  );

  if (!includeExpired) {
    const now = Timestamp.now();
    q = query(
      slotsRef,
      where("babyPageId", "==", babyPageId),
      where("status", "==", "active"),
      where("startTime", ">=", now),
      orderBy("startTime", "asc")
    );
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AvailabilitySlotDocument[];
}

export function isSlotAvailable(slot: AvailabilitySlotDocument): boolean {
  if (slot.status !== "active") return false;
  if (slot.currentBookings >= slot.maxGuests) return false;

  const now = new Date();
  const slotStart = slot.startTime.toDate();
  const leadTimeMs = slot.minimumLeadTimeHours * 60 * 60 * 1000;

  if (slotStart.getTime() - now.getTime() < leadTimeMs) return false;

  return true;
}

export function getRemainingCapacity(slot: AvailabilitySlotDocument): number {
  return Math.max(0, slot.maxGuests - slot.currentBookings);
}
