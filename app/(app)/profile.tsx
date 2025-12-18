import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFirebaseDataContext } from "@/hooks/useFirebaseData";
import { useMyUserActionSheet } from "@/hooks/useMyUserActionSheet";
import { useOtherUserActionSheet } from "@/hooks/useOtherUserActionSheet";
import { useUserProfileData } from "@/hooks/useUserProfileData";
import { BACKGROUND, BLACK, WHITE } from "@/lib/styles";
import { FontAwesome6 } from "@expo/vector-icons";

export default function ProfilePage() {
  const { id, friendCode } = useLocalSearchParams<{
    id?: string;
    friendCode?: string;
  }>();

  const { myUser } = useFirebaseDataContext();
  const { user, isLoading, error } = useUserProfileData(id, friendCode);
  const { showActionSheet: showMyUserActionSheet } = useMyUserActionSheet();
  const showOtherUserActionSheet = useOtherUserActionSheet(user);

  const isYou = useMemo(() => {
    return user?.id === myUser?.id;
  }, [user, myUser?.id]);

  return (
    <SafeAreaView>
      <View style={styles.pageHeader}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome6 name="arrow-left" size={18} color={BLACK} />
        </Pressable>

        {isYou ? (
          <Pressable onPress={showMyUserActionSheet} style={styles.backButton}>
            <FontAwesome6 name="gear" size={18} color={BLACK} />
          </Pressable>
        ) : (
          <Pressable
            onPress={showOtherUserActionSheet}
            style={styles.backButton}
          >
            <FontAwesome6 name="ellipsis-vertical" size={18} color={BLACK} />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: BACKGROUND,
    alignItems: "center",
  },
  pageHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 9,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },
});
