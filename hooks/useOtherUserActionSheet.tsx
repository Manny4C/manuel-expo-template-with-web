import { useMemo } from "react";
import { ActionSheetIOS, Alert, Platform } from "react-native";

import { useFirebaseDataContext } from "@/hooks/useFirebaseData";
import { UserDocument } from "@/models/users";
import { blockFriend, removeFriend, sendFriendInvite } from "@/utils/friends";

export function useOtherUserActionSheet(user: UserDocument | null) {
  const { myUser } = useFirebaseDataContext();

  const isInMyFriends = useMemo(() => {
    return myUser?.friends?.includes(user?.id ?? "");
  }, [myUser?.friends, user?.id]);

  function handleAddFriend() {
    if (!user?.friendCode || !myUser) return;
    sendFriendInvite(myUser, user.friendCode);
  }

  function handleRemoveFriend() {
    if (!user?.id || !myUser) return;
    removeFriend(myUser.id, user.id);
  }

  function handleBlock() {
    if (!user?.id || !myUser) return;
    blockFriend(myUser.id, user.id);
  }

  const showActionSheet = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Add Friend", "Remove Friend", "Block", "Cancel"],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 3,
          disabledButtonIndices: isInMyFriends ? [0] : [1],
          userInterfaceStyle: "light",
        },
        (buttonIndex) => {
          if (buttonIndex === 0) handleAddFriend();
          else if (buttonIndex === 1) handleRemoveFriend();
          else if (buttonIndex === 2) handleBlock();
        },
      );
    } else {
      Alert.alert(
        "User Options",
        "",
        [
          {
            text: "Add Friend",
            onPress: () => handleAddFriend(),
          },
          {
            text: "Remove Friend",
            onPress: () => handleRemoveFriend(),
          },
          {
            text: "Block",
            onPress: () => handleBlock(),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        { cancelable: true },
      );
    }
  };

  return showActionSheet;
}
