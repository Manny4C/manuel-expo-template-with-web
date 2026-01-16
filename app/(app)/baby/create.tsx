import { useRouter, Href } from "expo-router";
import { StyleSheet, ScrollView, View, Alert } from "react-native";

import { Text } from "@/components/Text";
import { BabyPageForm, BabyPageFormData } from "@/components/baby/BabyPageForm";
import { useUserContext } from "@/lib/auth";
import { createBabyPage } from "@/utils/babyPage";
import { uploadPhoto } from "@/utils/photo";
import { BLACK, BACKGROUND } from "@/lib/styles";

export default function CreateBabyPageScreen() {
  const router = useRouter();
  const { authUser } = useUserContext();

  const handleSubmit = async (data: BabyPageFormData) => {
    if (!authUser?.uid) {
      Alert.alert("Error", "You must be logged in to create a page");
      return;
    }

    try {
      let photoId: string | undefined;
      let photoUri: string | undefined;

      // Upload photo if provided
      if (data.photoUri) {
        const result = await uploadPhoto(authUser.uid, data.photoUri);
        photoId = result.photoId;
        photoUri = result.photoUri;
      }

      // Create the baby page
      const page = await createBabyPage({
        slug: data.normalizedSlug,
        ownerId: authUser.uid,
        babyName: data.babyName,
        parentNames: data.parentNames,
        photoId,
        photoUri,
        houseRules: data.houseRules,
      });

      // Navigate to the new baby page
      router.replace(`/baby/${page.slug}` as Href);
    } catch (error) {
      console.error("Error creating baby page:", error);
      Alert.alert("Error", "Failed to create baby page. Please try again.");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text weight="Bold" style={styles.title}>
          Create Your Baby Page
        </Text>
        <Text style={styles.subtitle}>
          Set up a page where friends and family can schedule visits to meet
          your little one
        </Text>
      </View>

      <BabyPageForm
        onSubmit={handleSubmit}
        submitLabel="I Have a Baby to Show Off"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    gap: 8,
  },
  title: {
    fontSize: 28,
    color: BLACK,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
});
