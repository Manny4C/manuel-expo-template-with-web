// NOTE: This is an example of what a Firebase hook could look like

import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import { firestore } from "@/lib/firebase";
import { UserDocument } from "@/models/users";
import { partition } from "@/utils/common";

export function useFirebaseData(myId: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [myUser, setMyUser] = useState<UserDocument>({} as UserDocument);
  const [friends, setFriends] = useState<Record<string, UserDocument>>({});
  const [incomingRequests, setIncomingRequests] = useState<UserDocument[]>([]);
  // Use ref to access latest myUser value in closures
  const myUserRef = React.useRef<UserDocument>({} as UserDocument);

  // Keep ref in sync with state
  React.useEffect(() => {
    myUserRef.current = myUser;
  }, [myUser]);

  function subscribeToMyUser() {
    if (!firestore || !myId) {
      return { myDoc: null, unsubUser: null };
    }

    const myDoc = doc(firestore, "users", myId);
    const unsubUser = onSnapshot(myDoc, (snapshot) => {
      const myDoc = snapshot.data() as UserDocument;
      setMyUser((prev) => ({ ...prev, ...myDoc }));
      setIsLoaded(true);
    });

    return { myDoc, unsubUser };
  }

  function subscribeToMyFriends() {
    const friendQuery = query(
      collection(firestore, "users"),
      where("friends", "array-contains", myId),
    );

    const unsubFriends = onSnapshot(friendQuery, (snapshot) => {
      const friendDocs = snapshot.docs.map((doc) => doc.data() as UserDocument);

      // Use ref to get latest myUser value instead of closure
      const currentMyUser = myUserRef.current;

      const filteredFriendDocs = friendDocs.filter(
        (f) => !currentMyUser?.blocked?.includes(f.id),
      );
      const [mutualFriends, incomingFriendRequests] = partition(
        filteredFriendDocs,
        (friend) => currentMyUser?.friends?.includes(friend.id) ?? false,
      );

      setFriends((prev) =>
        mutualFriends.reduce((acc, doc) => {
          acc[doc.id] = { ...prev[doc.id], ...doc };
          return acc;
        }, {} as Record<string, UserDocument>),
      );

      setIncomingRequests(incomingFriendRequests);
      setIsLoaded(true);
    });

    const unsubscribeAll = () => {
      unsubFriends();
    };

    return unsubscribeAll;
  }

  useEffect(() => {
    if (!firestore || !myId) return;

    const { myDoc, unsubUser } = subscribeToMyUser();

    return () => {
      unsubUser?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, myId]);

  useEffect(() => {
    if (!firestore) return;

    const unsubFriends = subscribeToMyFriends();

    return () => {
      unsubFriends?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, myUser?.friends]);

  return {
    myUser,
    friends,
    incomingRequests,
    isLoaded,
  };
}

export interface FirebaseDataContextType {
  myUser: UserDocument;
  friends: Record<string, UserDocument>;
  incomingRequests: UserDocument[];
  isLoaded: boolean;
}

export const FirebaseDataContext = React.createContext<FirebaseDataContextType>(
  {
    myUser: {} as UserDocument,
    friends: {},
    incomingRequests: [],
    isLoaded: false,
  },
);

export const FirebaseDataProvider = ({
  data,
  children,
}: {
  data: FirebaseDataContextType;
  children: React.ReactNode;
}) => {
  return (
    <FirebaseDataContext.Provider value={data}>
      {children}
    </FirebaseDataContext.Provider>
  );
};

export const useFirebaseDataContext = () => {
  const value = React.useContext(FirebaseDataContext);

  if (value === undefined) {
    throw new Error(
      "useUserContext must be used within a UserContext.Provider",
    );
  }

  return value;
};
