import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { firestore } from "@/lib/firebase";
import { BabyPageDocument } from "@/models/babyPage";

export function useBabyPage(pageId: string | undefined) {
  const [babyPage, setBabyPage] = useState<BabyPageDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !pageId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const pageRef = doc(firestore, "babyPages", pageId);

    const unsubscribe = onSnapshot(
      pageRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setBabyPage({
            id: snapshot.id,
            ...snapshot.data(),
          } as BabyPageDocument);
        } else {
          setBabyPage(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching baby page:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [pageId]);

  return { babyPage, isLoading, error };
}
