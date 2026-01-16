import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { firestore } from "@/lib/firebase";
import { AvailabilitySlotDocument } from "@/models/availabilitySlot";

interface UseAvailabilitySlotsOptions {
  includeExpired?: boolean;
  includeCancelled?: boolean;
}

export function useAvailabilitySlots(
  babyPageId: string | undefined,
  options: UseAvailabilitySlotsOptions = {}
) {
  const { includeExpired = false, includeCancelled = false } = options;

  const [slots, setSlots] = useState<AvailabilitySlotDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !babyPageId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const slotsRef = collection(firestore, "availabilitySlots");

    // Build query constraints
    const constraints = [
      where("babyPageId", "==", babyPageId),
      orderBy("startTime", "asc"),
    ];

    if (!includeCancelled) {
      constraints.splice(1, 0, where("status", "==", "active"));
    }

    const q = query(slotsRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let slotDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AvailabilitySlotDocument[];

        // Filter out expired slots if needed (client-side for real-time)
        if (!includeExpired) {
          const now = Timestamp.now();
          slotDocs = slotDocs.filter(
            (slot) => slot.startTime.toMillis() > now.toMillis()
          );
        }

        setSlots(slotDocs);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching availability slots:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [babyPageId, includeExpired, includeCancelled]);

  return { slots, isLoading, error };
}
