import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { firestore } from "@/lib/firebase";
import { UserDocument } from "@/models/users";

export function useUserProfileData(id?: string, friendCode?: string) {
  const [userId, setUserId] = useState<string | undefined>(id);
  const [user, setUser] = useState<UserDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function getUserIdByFriendCode(friendCode: string) {
    // Find the user id by friend code
    const friendCodeRef = doc(firestore, "friendCodes", friendCode);
    const friendCodeDoc = await getDoc(friendCodeRef);
    if (!friendCodeDoc.exists()) {
      setError("We couldn't find that Scout.");
      setIsLoading(false);
      return;
    }
    setUserId(friendCodeDoc.data()?.userId);
  }

  useEffect(() => {
    if (!userId && friendCode) {
      getUserIdByFriendCode(friendCode);
    }
  }, [friendCode]);

  useEffect(() => {
    if (!firestore) return;

    if (!userId || typeof userId !== "string") {
      setError("A user id or friend code is required to load this profile.");
      setIsLoading(false);
      return;
    }

    const userRef = doc(firestore, "users", userId);

    const unsubscribeUser = onSnapshot(
      userRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setError("We couldn't find that Scout.");
          setIsLoading(false);
          return;
        }

        setUser(snapshot.data() as UserDocument);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to load profile", err);
        setError("We couldn't load this profile just now.");
        setIsLoading(false);
      },
    );

    // const stampsQuery = query(
    //   collection(userRef, "stampsCollected"),
    //   orderBy("timestamp", "desc"),
    // );

    // const unsubscribeStamps = onSnapshot(
    //   stampsQuery,
    //   (snapshot) => {
    //     setStamps(snapshot.docs.map((doc) => doc.data() as StampDocument));
    //   },
    //   (err) => {
    //     console.error("Failed to load profile stamps", err);
    //   },
    // );

    return () => {
      unsubscribeUser();
      // unsubscribeStamps();
    };
  }, [userId]);

  return {
    user,
    isLoading,
    error,
  };
}
