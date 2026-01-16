import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { firestore } from "@/lib/firebase";
import { BookingDocument, BookingStatus } from "@/models/booking";

interface UseBookingsOptions {
  status?: BookingStatus | BookingStatus[];
}

export function useBookingsForPage(
  babyPageId: string | undefined,
  options: UseBookingsOptions = {}
) {
  const { status } = options;

  const [bookings, setBookings] = useState<BookingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !babyPageId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

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

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BookingDocument[];

        setBookings(bookingDocs);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching bookings:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [babyPageId, status]);

  return { bookings, isLoading, error };
}

export function useVisitorBookings(
  visitorId: string | undefined,
  options: UseBookingsOptions = {}
) {
  const { status } = options;

  const [bookings, setBookings] = useState<BookingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !visitorId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

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

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BookingDocument[];

        setBookings(bookingDocs);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching visitor bookings:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [visitorId, status]);

  return { bookings, isLoading, error };
}
