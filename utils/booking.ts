import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  increment,
  runTransaction,
} from "firebase/firestore";

import { firestore } from "@/lib/firebase";
import { BookingDocument, BookingStatus, TagAlong } from "@/models/booking";
import { AvailabilitySlotDocument } from "@/models/availabilitySlot";

export interface CreateBookingInput {
  babyPageId: string;
  availabilitySlotId: string;
  visitorId: string;
  visitorName: string;
  visitorEmail: string;
  arrivalTime: Date;
  tagAlongs?: TagAlong[];
  bringingMeal?: boolean;
  mealDescription?: string;
  visitorNotes?: string;
}

export async function createBooking(
  input: CreateBookingInput
): Promise<BookingDocument> {
  if (!firestore) throw new Error("Firestore not initialized");

  // Use transaction to ensure slot capacity is respected
  return await runTransaction(firestore, async (transaction) => {
    const slotRef = doc(firestore!, "availabilitySlots", input.availabilitySlotId);
    const slotSnapshot = await transaction.get(slotRef);

    if (!slotSnapshot.exists()) {
      throw new Error("Availability slot not found");
    }

    const slot = slotSnapshot.data() as AvailabilitySlotDocument;
    const totalGuests = 1 + (input.tagAlongs?.length ?? 0);

    if (slot.currentBookings + totalGuests > slot.maxGuests) {
      throw new Error("Not enough capacity in this slot");
    }

    if (slot.status !== "active") {
      throw new Error("This slot is no longer available");
    }

    const bookingRef = doc(collection(firestore!, "bookings"));
    const bookingId = bookingRef.id;

    const now = Timestamp.now();
    const initialStatus: BookingStatus =
      slot.bookingMode === "auto_confirm" ? "confirmed" : "pending";

    const bookingData: Omit<BookingDocument, "id"> = {
      babyPageId: input.babyPageId,
      availabilitySlotId: input.availabilitySlotId,
      visitorId: input.visitorId,
      visitorName: input.visitorName,
      visitorEmail: input.visitorEmail,
      arrivalTime: Timestamp.fromDate(input.arrivalTime),
      tagAlongs: input.tagAlongs ?? [],
      totalGuestCount: totalGuests,
      bringingMeal: input.bringingMeal ?? false,
      mealDescription: input.mealDescription,
      status: initialStatus,
      visitorNotes: input.visitorNotes,
      createdAt: now,
      updatedAt: now,
      ...(initialStatus === "confirmed" && { confirmedAt: now }),
    };

    // Update slot booking count
    transaction.update(slotRef, {
      currentBookings: increment(totalGuests),
    });

    // Create booking
    transaction.set(bookingRef, bookingData);

    return { id: bookingId, ...bookingData };
  });
}

export async function confirmBooking(bookingId: string): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  const bookingRef = doc(firestore, "bookings", bookingId);
  await updateDoc(bookingRef, {
    status: "confirmed",
    confirmedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function cancelBooking(
  bookingId: string,
  cancelledByVisitor = true
): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  await runTransaction(firestore, async (transaction) => {
    const bookingRef = doc(firestore!, "bookings", bookingId);
    const bookingSnapshot = await transaction.get(bookingRef);

    if (!bookingSnapshot.exists()) {
      throw new Error("Booking not found");
    }

    const booking = bookingSnapshot.data() as BookingDocument;

    // Update slot capacity
    const slotRef = doc(firestore!, "availabilitySlots", booking.availabilitySlotId);
    transaction.update(slotRef, {
      currentBookings: increment(-booking.totalGuestCount),
    });

    // Update booking status
    transaction.update(bookingRef, {
      status: "cancelled",
      cancelledAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });
}

export async function completeBooking(bookingId: string): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  const bookingRef = doc(firestore, "bookings", bookingId);
  await updateDoc(bookingRef, {
    status: "completed",
    completedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function markNoShow(bookingId: string): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  const bookingRef = doc(firestore, "bookings", bookingId);
  await updateDoc(bookingRef, {
    status: "no_show",
    updatedAt: Timestamp.now(),
  });
}

export async function getBooking(bookingId: string): Promise<BookingDocument | null> {
  if (!firestore) return null;

  const bookingRef = doc(firestore, "bookings", bookingId);
  const snapshot = await getDoc(bookingRef);

  if (!snapshot.exists()) return null;

  return { id: snapshot.id, ...snapshot.data() } as BookingDocument;
}

export async function getBookingsForPage(
  babyPageId: string,
  status?: BookingStatus | BookingStatus[]
): Promise<BookingDocument[]> {
  if (!firestore) return [];

  const bookingsRef = collection(firestore, "bookings");
  let q;

  if (status) {
    const statuses = Array.isArray(status) ? status : [status];
    q = query(
      bookingsRef,
      where("babyPageId", "==", babyPageId),
      where("status", "in", statuses),
      orderBy("arrivalTime", "asc")
    );
  } else {
    q = query(
      bookingsRef,
      where("babyPageId", "==", babyPageId),
      orderBy("arrivalTime", "asc")
    );
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as BookingDocument[];
}

export async function getBookingsForSlot(
  slotId: string
): Promise<BookingDocument[]> {
  if (!firestore) return [];

  const bookingsRef = collection(firestore, "bookings");
  const q = query(
    bookingsRef,
    where("availabilitySlotId", "==", slotId),
    where("status", "in", ["pending", "confirmed"]),
    orderBy("arrivalTime", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as BookingDocument[];
}

export async function getVisitorBookings(
  visitorId: string,
  status?: BookingStatus | BookingStatus[]
): Promise<BookingDocument[]> {
  if (!firestore) return [];

  const bookingsRef = collection(firestore, "bookings");
  let q;

  if (status) {
    const statuses = Array.isArray(status) ? status : [status];
    q = query(
      bookingsRef,
      where("visitorId", "==", visitorId),
      where("status", "in", statuses),
      orderBy("arrivalTime", "asc")
    );
  } else {
    q = query(
      bookingsRef,
      where("visitorId", "==", visitorId),
      orderBy("arrivalTime", "asc")
    );
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as BookingDocument[];
}
