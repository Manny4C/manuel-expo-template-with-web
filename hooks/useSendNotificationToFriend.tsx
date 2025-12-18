import { sendPushNotification } from "@/lib/notifications";
import { UserDocument } from "@/models/users";

import { useFirebaseDataContext } from "./useFirebaseData";

export function useSendNotificationToFriends() {
  const { myUser, friends } = useFirebaseDataContext();

  const sendFriendInvite = async (friendId: string) => {};

  const sendAcceptFriendInvite = async (friendId: string) => {
    if (!friendId) return;

    const friend = Object.values(friends).find(
      (friend) => friend.id === friendId,
    );
    if (!friend) return;

    const pushTokens = await getPushTokens([friend]);

    pushTokens.forEach(async (token) => {
      await sendPushNotification(
        token,
        `You are now friends with ${myUser?.name}!`,
      );
    });
  };

  return {
    sendFriendInvite,
    sendAcceptFriendInvite,
  };
}

async function getPushTokens(friends: UserDocument[]): Promise<string[]> {
  return friends
    .map((friend) => friend.pushToken)
    .filter((token): token is string => token !== undefined);
}
