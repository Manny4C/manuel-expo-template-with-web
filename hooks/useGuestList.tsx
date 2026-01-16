import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { firestore } from "@/lib/firebase";
import { GuestListDocument, VisitStatus } from "@/models/guestList";

interface UseGuestListOptions {
  status?: VisitStatus;
}

export function useGuestList(
  babyPageId: string | undefined,
  options: UseGuestListOptions = {}
) {
  const { status } = options;

  const [guests, setGuests] = useState<GuestListDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !babyPageId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

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

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const guestDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as GuestListDocument[];

        setGuests(guestDocs);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching guest list:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [babyPageId, status]);

  // Computed values
  const visitedGuests = guests.filter((g) => g.visitStatus === "visited");
  const notVisitedGuests = guests.filter((g) => g.visitStatus !== "visited");
  const tagAlongOptions = guests.filter((g) => g.canBeTagAlong);

  return {
    guests,
    visitedGuests,
    notVisitedGuests,
    tagAlongOptions,
    isLoading,
    error,
  };
}
