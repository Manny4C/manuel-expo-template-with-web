import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";

import { firestore } from "@/lib/firebase";
import { BabyPageDocument } from "@/models/babyPage";

export function useBabyPages(userId: string | undefined) {
  const [babyPages, setBabyPages] = useState<BabyPageDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const pagesRef = collection(firestore, "babyPages");
    const q = query(
      pagesRef,
      where("ownerId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BabyPageDocument[];

        setBabyPages(pages);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching baby pages:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { babyPages, isLoading, error };
}
