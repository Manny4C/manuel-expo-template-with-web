import { router } from "expo-router";
import React from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { GRAY, SECONDARY_TEXT_COLOR, WHITE } from "@/lib/styles";
import { UserDocument } from "@/models/users";
import { blockFriend, openProfile, removeFriend } from "@/utils/friends";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

interface FriendListProps {
  friends: UserDocument[];
  currentUserId: string;
  showActions?: boolean;
  onRemoveFriend?: (friend: UserDocument) => void;
  onBlockFriend?: (friend: UserDocument) => void;
}

export function FriendList({
  friends,
  currentUserId,
  showActions = false,
  onRemoveFriend,
  onBlockFriend,
}: FriendListProps) {
  function handleFriendPress(friend: UserDocument) {
    openProfile(router, friend.id, friend.friendCode);
  }

  function handleRemoveFriend(friend: UserDocument) {
    if (onRemoveFriend) {
      onRemoveFriend(friend);
    } else {
      Alert.alert(
        `Are you sure you want to remove ${friend?.name}?`,
        undefined,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => removeFriend(currentUserId, friend?.id),
          },
        ],
      );
    }
  }

  function handleBlockFriend(friend: UserDocument) {
    if (onBlockFriend) {
      onBlockFriend(friend);
    } else {
      Alert.alert(
        `Are you sure you want to block ${friend?.name}?`,
        undefined,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Block",
            style: "destructive",
            onPress: () => blockFriend(currentUserId, friend?.id),
          },
        ],
      );
    }
  }

  if (friends.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {friends.map((friend) => (
        <View key={friend?.id} style={styles.friendItem}>
          <View style={styles.friendContent}>
            <Pressable
              style={styles.friendBubble}
              onPress={() => handleFriendPress(friend)}
            >
              <Text>{friend?.name.charAt(0)}</Text>
            </Pressable>
            <Pressable
              onPress={() => handleFriendPress(friend)}
              style={styles.friendInfoPressable}
            >
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend?.name}</Text>
                {friend?.friendCode && (
                  <Text style={styles.friendCode}>{friend.friendCode}</Text>
                )}
              </View>
            </Pressable>
          </View>

          {showActions && (
            <View
              style={styles.actionsContainer}
              onStartShouldSetResponder={() => true}
            >
              <Button
                style={styles.actionButton}
                content={<FontAwesome6 name="ban" size={16} color={WHITE} />}
                onPress={() => handleBlockFriend(friend)}
              />
              <Button
                style={styles.actionButton}
                content={<FontAwesome6 name="xmark" size={16} color={WHITE} />}
                onPress={() => handleRemoveFriend(friend)}
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  friendContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexGrow: 1,
  },
  friendBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GRAY,
    alignItems: "center",
    justifyContent: "center",
  },
  friendInfoPressable: {
    flexShrink: 1,
  },
  friendInfo: {
    gap: 2,
  },
  spacer: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
  },
  friendCode: {
    fontSize: 14,
    color: SECONDARY_TEXT_COLOR,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: GRAY,
    borderRadius: 16,
  },
});
