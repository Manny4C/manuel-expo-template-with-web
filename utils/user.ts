import { getAuth } from "firebase/auth";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";

import { firestore } from "@/lib/firebase";
import { UserDocument } from "@/models/users";

export function updateUser(userId: string, data: Partial<UserDocument>) {
  if (!userId || !firestore) return;

  const userRef = doc(firestore, `users/${userId}`);
  return updateDoc(userRef, data);
}

export async function deleteUser(user: UserDocument) {
  if (!user.id || !firestore) return;

  const promises: Promise<any>[] = [];

  // Get all feed posts that the user has posted and delete them
  // const feedPosts = await getDocs(
  //   query(
  //     collection(firestore, FEED_POSTS_COLLECTION),
  //     where("userId", "==", user.id),
  //   ),
  // );
  // feedPosts.forEach((feedPost) => {
  //   promises.push(deleteDoc(feedPost.ref));
  // });

  // Delete your friend code entry
  const friendCodeRef = doc(firestore, `friendCodes/${user.friendCode}`);
  getDoc(friendCodeRef).then((doc) => {
    if (doc.exists()) {
      promises.push(deleteDoc(friendCodeRef));
    }
  });

  // Don't delete auth until all other promises are resolved
  await Promise.all(promises);

  // Delete the user doc
  const lastPromises = [];
  const userRef = doc(firestore, `users/${user.id}`);
  lastPromises.push(deleteDoc(userRef));

  // Delete from authentication
  const auth = getAuth();
  lastPromises.push(auth.currentUser?.delete());

  await Promise.all(lastPromises);
}
