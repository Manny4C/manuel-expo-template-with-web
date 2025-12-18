import * as Crypto from "expo-crypto";
import { Router } from "expo-router";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Alert } from "react-native";

import { firestore } from "@/lib/firebase";
import { sendPushNotification } from "@/lib/notifications";
import { FriendCodeDocument, UserDocument } from "@/models/users";

export async function generateFriendCode() {
  const bytes = await Crypto.getRandomBytesAsync(8); // 8 random bytes
  return Array.from(bytes, (b) => (b % 36).toString(36).toUpperCase()).join(""); // Convert to A-Z + 0-9
}

// Ensure friend code is unique in Firestore
export async function createUniqueFriendCode(userId: string) {
  let friendCode = await generateFriendCode(); // Initial value
  let exists = true;

  while (exists) {
    friendCode = await generateFriendCode();
    const docRef = doc(firestore, "friendCodes", friendCode);
    const snapshot = await getDoc(docRef);
    exists = snapshot.exists();
  }

  return friendCode;
}

export async function sendFriendInvite(myUser: UserDocument, code: string) {
  const allCapsCode = code.toUpperCase();
  const docRef = doc(firestore, `friendCodes/${allCapsCode}`);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    Alert.alert("Didn't find anyone to add 😥");
    return;
  }

  const friend = snapshot.data() as FriendCodeDocument;
  const friendId = friend.userId;

  // If this is you don't send invite
  if (myUser?.id === friendId) {
    return;
  }

  // If is already a friend, don't send invite
  if (myUser?.friends?.includes(friendId)) {
    Alert.alert("Already friends!");
    return;
  }

  // Add the doc.id to my friends list
  const userRef = doc(firestore, `users/${myUser?.id}`);
  await updateDoc(userRef, { friends: arrayUnion(friendId) });

  // Send notification to person
  const friendDataRef = doc(firestore, `users/${friendId}`);
  const friendSnapshot = await getDoc(friendDataRef);
  if (friendSnapshot.exists()) {
    const friendData = friendSnapshot.data() as UserDocument;
    const pushToken = friendData.pushToken;
    if (friendData.friends?.includes(myUser?.id ?? "")) {
      Alert.alert("You are friends!", "🤝");
      return;
    }

    if (pushToken) {
      sendPushNotification(pushToken, `${myUser?.name} wants to be friends 😎`);
    }
  }

  Alert.alert("Sent friend request!", "Ask them to accept 🥺");
}

export async function acceptFriendInvite(myUserId: string, friendId: string) {
  const userRef = doc(firestore, `users/${myUserId}`);
  await updateDoc(userRef, { friends: arrayUnion(friendId) });
}

export async function removeFriend(myUserId: string, friendId: string) {
  const userRef = doc(firestore, `users/${myUserId}`);
  await updateDoc(userRef, { friends: arrayRemove(friendId) });
}

export async function blockFriend(myUserId: string, friendId: string) {
  const userRef = doc(firestore, `users/${myUserId}`);
  await updateDoc(userRef, { blocked: arrayUnion(friendId) });
  await updateDoc(userRef, { friends: arrayRemove(friendId) });
}

export const WEB_LINK = "https://stampede.expo.app";
export function getFriendInviteLink(myName: string, myFriendCode: string) {
  return `${WEB_LINK}/friend-invite?code=${myFriendCode}&name=${myName}`;
}

export function createLink(
  path: string,
  queryParams: Record<string, undefined | string | string[]> | null,
) {
  if (!queryParams) return `${WEB_LINK}/${path}`;

  return `${WEB_LINK}/${path}?${Object.entries(queryParams)
    .map(([key, value]) => `${key}=${value?.toString()}`)
    .join("&")}`;
}

export function openProfile(
  router: Router,
  friendId: string,
  friendCode?: string,
) {
  if (!friendId && !friendCode) return;
  router.push({
    pathname: "/profile",
    params: { id: friendId, friendCode: friendCode },
  });
}
