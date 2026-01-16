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
  orderBy,
} from "firebase/firestore";

import { firestore } from "@/lib/firebase";
import { GuestListDocument, VisitStatus } from "@/models/guestList";

export interface CreateGuestInput {
  babyPageId: string;
  ownerId: string;
  name: string;
  email: string;
  phone?: string;
  relationship?: string;
  notes?: string;
}

export async function createGuest(
  input: CreateGuestInput
): Promise<GuestListDocument> {
  if (!firestore) throw new Error("Firestore not initialized");

  const guestRef = doc(collection(firestore, "guestLists"));
  const guestId = guestRef.id;

  const now = Timestamp.now();
  const guestData: Omit<GuestListDocument, "id"> = {
    babyPageId: input.babyPageId,
    ownerId: input.ownerId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    relationship: input.relationship,
    visitStatus: "not_booked",
    totalVisits: 0,
    canBook: true,
    canBeTagAlong: true,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(guestRef, guestData);

  return { id: guestId, ...guestData };
}

export interface UpdateGuestInput {
  name?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  notes?: string;
  canBook?: boolean;
  canBeTagAlong?: boolean;
}

export async function updateGuest(
  guestId: string,
  input: UpdateGuestInput
): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  const guestRef = doc(firestore, "guestLists", guestId);

  const updateData: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.email !== undefined) updateData.email = input.email;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.relationship !== undefined) updateData.relationship = input.relationship;
  if (input.notes !== undefined) updateData.notes = input.notes;
  if (input.canBook !== undefined) updateData.canBook = input.canBook;
  if (input.canBeTagAlong !== undefined) updateData.canBeTagAlong = input.canBeTagAlong;

  await updateDoc(guestRef, updateData);
}

export async function deleteGuest(guestId: string): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  const guestRef = doc(firestore, "guestLists", guestId);
  await deleteDoc(guestRef);
}

export async function updateGuestVisitStatus(
  guestId: string,
  status: VisitStatus,
  visitDate?: Date
): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  const guestRef = doc(firestore, "guestLists", guestId);

  const updateData: Record<string, unknown> = {
    visitStatus: status,
    updatedAt: Timestamp.now(),
  };

  if (status === "visited" && visitDate) {
    updateData.lastVisitDate = Timestamp.fromDate(visitDate);

    // Increment total visits
    const guestSnapshot = await getDoc(guestRef);
    if (guestSnapshot.exists()) {
      const guest = guestSnapshot.data() as GuestListDocument;
      updateData.totalVisits = guest.totalVisits + 1;
    }
  }

  await updateDoc(guestRef, updateData);
}

export async function linkGuestToUser(
  guestId: string,
  userId: string
): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  const guestRef = doc(firestore, "guestLists", guestId);
  await updateDoc(guestRef, {
    linkedUserId: userId,
    updatedAt: Timestamp.now(),
  });
}

export async function getGuest(guestId: string): Promise<GuestListDocument | null> {
  if (!firestore) return null;

  const guestRef = doc(firestore, "guestLists", guestId);
  const snapshot = await getDoc(guestRef);

  if (!snapshot.exists()) return null;

  return { id: snapshot.id, ...snapshot.data() } as GuestListDocument;
}

export async function getGuestsForPage(
  babyPageId: string,
  status?: VisitStatus
): Promise<GuestListDocument[]> {
  if (!firestore) return [];

  const guestsRef = collection(firestore, "guestLists");
  let q;

  if (status) {
    q = query(
      guestsRef,
      where("babyPageId", "==", babyPageId),
      where("visitStatus", "==", status),
      orderBy("name", "asc")
    );
  } else {
    q = query(
      guestsRef,
      where("babyPageId", "==", babyPageId),
      orderBy("name", "asc")
    );
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as GuestListDocument[];
}

export async function getGuestByEmail(
  babyPageId: string,
  email: string
): Promise<GuestListDocument | null> {
  if (!firestore) return null;

  const guestsRef = collection(firestore, "guestLists");
  const q = query(
    guestsRef,
    where("babyPageId", "==", babyPageId),
    where("email", "==", email.toLowerCase())
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as GuestListDocument;
}

export async function getTagAlongOptions(
  babyPageId: string
): Promise<GuestListDocument[]> {
  if (!firestore) return [];

  const guestsRef = collection(firestore, "guestLists");
  const q = query(
    guestsRef,
    where("babyPageId", "==", babyPageId),
    where("canBeTagAlong", "==", true),
    orderBy("name", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as GuestListDocument[];
}
