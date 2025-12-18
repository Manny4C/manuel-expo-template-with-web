import { router } from "expo-router";
import { useState } from "react";
import { ActionSheetIOS, Alert, Platform } from "react-native";

import { useFirebaseDataContext } from "@/hooks/useFirebaseData";
import { useUserContext } from "@/lib/auth";
import { deleteUser } from "@/utils/user";

export function useMyUserActionSheet() {
  const { logOut } = useUserContext();
  const { myUser } = useFirebaseDataContext();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      router.dismissAll();
      await deleteUser(myUser);
      console.log("deleted user");
      await logOut();
      router.replace("/login");
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  }

  const showActionSheet = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Change Picture", "Delete Account", "Log Out", "Cancel"],
          destructiveButtonIndex: [1, 2],
          cancelButtonIndex: 3,
          userInterfaceStyle: "light",
        },
        (buttonIndex) => {
          if (buttonIndex === 0) router.push("/profile-photo");
          else if (buttonIndex === 1) deleteAccount();
          else if (buttonIndex === 2) logOut();
        },
      );
    } else {
      Alert.alert(
        "User Options",
        "",
        [
          {
            text: "Change Profile",
            onPress: () => router.push("/profile-photo"),
          },
          {
            text: "Delete Account",
            style: "destructive",
            onPress: deleteAccount,
          },
          {
            text: "Log Out",
            onPress: () => logOut(),
          },
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true },
      );
    }
  };

  async function deleteAccountReally() {
    return Alert.alert(
      "You are absolutely sure you want to delete your account?",
      "This is irreversible.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: handleDeleteAccount,
        },
      ],
    );
  }

  async function deleteAccount() {
    return Alert.alert(
      "Are you sure you want to delete your account?",
      "This is irreversible. All your data, including all your stamps, will be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: deleteAccountReally,
        },
      ],
    );
  }

  return { showActionSheet, isDeleting };
}
