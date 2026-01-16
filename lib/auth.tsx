import {
  AuthError,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";

import { useStorageState } from "@/hooks/useStorageState";
import { auth, firestore } from "@/lib/firebase";
import { UserDocument } from "@/models/users";
import { createUniqueFriendCode } from "@/utils/friends";

export interface IFirebaseAuth {
  authUser: User | null;
  error: AuthError | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (
    name: string,
    email: string,
    password: string,
    startingData: Partial<UserDocument>,
  ) => Promise<User | null>;
  logOut: () => Promise<void>;
}

export interface IUserContextType extends IFirebaseAuth {
  session: string;
}

export const UserContext = React.createContext<IUserContextType>({
  session: "",
  authUser: null,
  error: null,
  loading: false,
  signIn: async () => Promise.resolve(null),
  signUp: async () => Promise.resolve(null),
  logOut: async () => {},
});

export const useUserContext = () => {
  const value = React.useContext(UserContext);

  if (value === undefined) {
    throw new Error(
      "useUserContext must be used within a UserContext.Provider",
    );
  }

  return value;
};

export function SessionProvider({
  children,
  pushToken,
}: {
  children: React.ReactNode;
  pushToken?: string | null;
}) {
  const [[isLoading, session], setSession] = useStorageState("session");

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState(false);

  // Keep you logged in
  useEffect(function setLoggedInState() {
    if (!auth) {
      console.error("Firebase auth is not initialized. Please check your Firebase configuration.");
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setAuthUser(user);
        setSession(user?.uid || null);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up auth state listener:", error);
      setLoading(false);
    }
  }, []);

  // Update the user's push token in your database
  useEffect(() => {
    if (authUser && pushToken) {
      updateUserPushToken(authUser?.uid, pushToken);
    }
  }, [authUser, pushToken]);

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      startingData: Partial<UserDocument>,
    ) => {
      try {
        setLoading(true);

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const newUser = userCredential.user;

        const userRef = doc(firestore, `users/${newUser.uid}`);
        const friendCode = await createUniqueFriendCode(newUser.uid);

        // Save the friend code mapping
        const friendCodeRef = doc(firestore, `friendCodes/${friendCode}`);
        await setDoc(friendCodeRef, { userId: newUser.uid });

        // Save the user's profile
        await setDoc(userRef, {
          id: newUser.uid,
          name: name,
          email,
          ...startingData,
          friendCode,
          friends: [],
        });

        // Set local in context
        setSession(newUser.uid);
        setAuthUser(newUser);
        setLoading(false);
        setError(null);

        return newUser;
      } catch (error: any) {
        setError(error);
        setLoading(false);

        console.error(error.code, error.message);
        return null;
      }
    },
    [auth],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );

        const newUser = userCredential.user;

        setSession(newUser.uid);
        setAuthUser(newUser);
        setLoading(false);
        setError(null);

        return newUser;
      } catch (error: any) {
        setError(error);
        setLoading(false);

        console.error(error.code, error.message);
        return null;
      }
    },
    [auth],
  );

  const logOut = useCallback(async () => {
    await auth.signOut();
    setSession(null);
    setAuthUser(null);
  }, [auth]);

  return (
    <UserContext.Provider
      value={{
        session: session || "",
        authUser,
        error,
        loading: loading || isLoading,
        signIn,
        signUp,
        logOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

async function updateUserPushToken(userId: string, pushToken: string) {
  try {
    const userRef = doc(firestore, `users/${userId}`);
    await updateDoc(userRef, {
      pushToken,
    });
  } catch (error) {
    console.error(error);
  }
}
