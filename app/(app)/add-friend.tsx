import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { FriendList } from "@/components/FriendList";
import { Input } from "@/components/Input";
import { Text } from "@/components/Text";
import { useFirebaseDataContext } from "@/hooks/useFirebaseData";
import { useSendNotificationToFriends } from "@/hooks/useSendNotificationToFriend";
import {
  BLACK,
  BORDER_STYLES,
  GRAY,
  SECONDARY_TEXT_COLOR,
  WHITE,
} from "@/lib/styles";
import { UserDocument } from "@/models/users";
import {
  acceptFriendInvite,
  blockFriend,
  getFriendInviteLink,
  removeFriend,
  sendFriendInvite,
} from "@/utils/friends";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function AddFriendModal() {
  const { myUser, friends, incomingRequests } = useFirebaseDataContext();
  const { sendAcceptFriendInvite } = useSendNotificationToFriends();

  const [code, setCode] = useState("");
  const isNoFriends = Object.keys(friends).length === 0;
  const isFriendRequests = (incomingRequests?.length || 0) > 0;

  const friendList = useMemo(() => {
    return Object.values(friends).filter((fr) => fr.id !== myUser.id);
  }, [friends, myUser.id]);

  async function handleCopyFriendCode() {
    const link = getFriendInviteLink(
      myUser?.name?.split(" ")[0] || "",
      myUser?.friendCode || "",
    );
    await Share.share(
      {
        message: `Join me on Stampede! My friend code is ${myUser?.friendCode}`,
        url: link,
        title: "Invite a Friend",
      },
      {
        subject: "Join me on Stampede!",
        dialogTitle: "Share your friend code",
      },
    );
  }

  async function handleSendFriendInvite() {
    if (!code) {
      return;
    }

    await sendFriendInvite(myUser, code);
    setCode("");
  }

  async function handleAcceptFriendInvite(friendId: string) {
    await acceptFriendInvite(myUser?.id, friendId);
    await sendAcceptFriendInvite(friendId);
  }

  function handleRemoveFriend(friend: UserDocument) {
    return Alert.alert(
      `are you sure you want to remove ${friend?.name}?`,
      undefined,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFriend(myUser?.id, friend?.id),
        },
      ],
    );
  }

  function handleBlockFriend(friend: UserDocument) {
    Alert.alert(`are you sure you want to block ${friend?.name}?`, undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Block",
        style: "destructive",
        onPress: () => blockFriend(myUser?.id, friend?.id),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.innerContainer}>
        <Pressable
          style={styles.friendCodeContainer}
          onPress={handleCopyFriendCode}
        >
          <Text style={styles.friendCodeLabel}>Your Friend Code</Text>
          <Text style={[styles.friendCode]}>{myUser?.friendCode}</Text>
        </Pressable>
        {myUser?.friendCode && (
          <View style={{ alignItems: "center" }}>
            <QRCode
              value={getFriendInviteLink(
                myUser?.name?.split(" ")[0] || "",
                myUser?.friendCode || "",
              )}
              color={BLACK}
              backgroundColor={WHITE}
              size={150}
            />
          </View>
        )}

        <View style={{ gap: 10, flexDirection: "row" }}>
          <Input
            placeholder="Friend code"
            autoComplete="off"
            inputMode="text"
            textContentType="none"
            value={code}
            onChangeText={setCode}
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleSendFriendInvite}
          />
          <Button
            style={{ flexGrow: 0 }}
            primary
            label="Add"
            onPress={handleSendFriendInvite}
          />
        </View>

        <ScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={{ gap: 10 }}
          keyboardShouldPersistTaps="handled"
        >
          {isFriendRequests && (
            <View style={styles.sectionContainer}>
              <Text style={{ textAlign: "center" }}>
                Requests ({incomingRequests?.length})
              </Text>
              {incomingRequests?.map((friend) => (
                <Pressable key={friend?.id}>
                  <View style={styles.singleRequestContainer}>
                    <View>
                      <Text style={{ fontSize: 16 }}>{friend?.name}</Text>
                      <Text style={{ color: SECONDARY_TEXT_COLOR }}>
                        {friend?.friendCode}
                      </Text>
                    </View>

                    <View style={styles.requestButtonsContainer}>
                      <Button
                        style={styles.circleButton}
                        content={
                          <FontAwesome6 name="check" size={16} color={WHITE} />
                        }
                        onPress={() => handleAcceptFriendInvite(friend?.id)}
                        primary
                      />
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          <View
            style={[styles.sectionContainer, isNoFriends && { minHeight: 200 }]}
          >
            {isNoFriends && (
              <View
                style={{
                  minHeight: 200,
                  justifyContent: "center",
                }}
              >
                <Text style={styles.modalTitle}>
                  Add friends to get started
                </Text>
              </View>
            )}
            <FriendList
              friends={friendList}
              currentUserId={myUser?.id || ""}
              showActions={true}
              onRemoveFriend={handleRemoveFriend}
              onBlockFriend={handleBlockFriend}
            />
          </View>
        </ScrollView>

        <View>
          <Button label="Close" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  modalTitle: {
    color: BLACK,
    textAlign: "center",
    fontSize: 18,
  },
  friendCodeContainer: {
    ...BORDER_STYLES,
    alignItems: "center",
    borderColor: GRAY,
    paddingVertical: 10,
    padding: 20,
    gap: 10,
  },
  friendCodeLabel: {
    backgroundColor: WHITE,
    color: SECONDARY_TEXT_COLOR,
    position: "absolute",
    top: -10,
    paddingHorizontal: 5,
  },
  friendCode: {
    fontSize: 20,
  },
  sectionContainer: {
    paddingVertical: 10,
    gap: 10,
    backgroundColor: GRAY,
    borderRadius: 10,
  },
  singleInfoContainer: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-start",
  },
  icon: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 32,
  },
  singleRequestContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestButtonsContainer: {
    flexGrow: 0,
    flexDirection: "row",
    gap: 10,
  },
  circleButton: {
    width: 30,
    height: 30,
    flexGrow: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
