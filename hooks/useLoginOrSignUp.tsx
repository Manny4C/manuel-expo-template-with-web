import { CameraCapturedPicture } from "expo-camera";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import { useState } from "react";

import { useUserContext } from "@/lib/auth";
import { getPhotoUri, resizePhoto, uploadToFirebase } from "@/utils/photo";
import { updateUser } from "@/utils/user";

export type PageState = "about" | "setup" | "login";

export function useLoginOrSignUp() {
  const { signIn, signUp, error } = useUserContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [pageState, setPageState] = useState<PageState>("about");

  function handleOnboardingComplete() {
    setPageState("setup");
  }

  function handleSwitchToSignIn() {
    setEmail("");
    setPassword("");
    setFriendCode("");
    setPageState("login");
  }

  function handleSwitchToSignUp() {
    setEmail("");
    setPassword("");
    setFriendCode("");
    setPageState("setup");
  }

  async function handleSignIn() {
    if (!email || !password) {
      return;
    }

    const newUser = await signIn(email, password);

    if (error) {
      alert("unable to sign in!");
      return;
    }

    if (newUser) {
      router.replace("/");
    }
  }

  async function handleUploadPhoto(
    userId: string,
    photo?: CameraCapturedPicture,
  ) {
    let photoId: string | undefined;
    let photoUri: string | undefined;
    try {
      // Upload photo if provided (now that we have userId)
      if (photo?.uri) {
        const id = Crypto.randomUUID();
        photoId = `${userId}-${id}.jpeg`;

        const resizedPhoto = await resizePhoto(photo);
        await uploadToFirebase(resizedPhoto, photoId);

        photoUri = (await getPhotoUri(photoId)) || undefined;
      }
      return { photoId, photoUri };
    } catch (error) {
      console.error("Failed to upload photo:", error);
      return { photoId, photoUri };
    }
  }

  async function handleSignUp(photo?: CameraCapturedPicture) {
    try {
      // Sign up the user first
      const newUser = await signUp(name, email, password, {
        hasCompletedOnboarding: true,
      });

      if (!newUser) return;

      // Upload photo if provided (now that we have userId)
      const { photoId, photoUri } = await handleUploadPhoto(newUser.uid, photo);

      // Update user with photo, passport color, interests, and mark onboarding complete
      await updateUser(newUser.uid, {
        ...(photoId ? { photoId } : {}),
        ...(photoUri ? { photoUri } : {}),
      });

      router.replace("/");
    } catch (error) {
      console.error("Onboarding completion error:", error);
    }
  }

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    friendCode,
    setFriendCode,
    handleSignIn,
    handleSwitchToSignUp,
    handleSignUp,
    handleSwitchToSignIn,
    handleOnboardingComplete,
    pageState,
  };
}
