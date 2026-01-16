import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { BabyPageForm, BabyPageFormData } from "@/components/baby/BabyPageForm";
import { useBabyPage } from "@/hooks/useBabyPage";
import { getBabyPageBySlug } from "@/utils/slug";
import { updateBabyPage, deleteBabyPage } from "@/utils/babyPage";
import { uploadPhoto } from "@/utils/photo";
import { useUserContext } from "@/lib/auth";
import { BLACK, BACKGROUND, LIGHT_GRAY } from "@/lib/styles";

export default function EditBabyPageScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { authUser } = useUserContext();
  const [pageId, setPageId] = useState<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  // Fetch page ID from slug
  useEffect(() => {
    async function fetchPageId() {
      if (!slug) return;
      try {
        const page = await getBabyPageBySlug(slug);
        if (page) {
          setPageId(page.id);
        }
      } catch (error) {
        console.error("Error fetching page:", error);
      } finally {
        setIsLoadingPage(false);
      }
    }
    fetchPageId();
  }, [slug]);

  const { babyPage, isLoading: isLoadingBabyPage } = useBabyPage(
    pageId || undefined
  );

  const isLoading = isLoadingPage || isLoadingBabyPage;

  const handleSubmit = async (data: BabyPageFormData) => {
    if (!pageId || !authUser?.uid) return;

    try {
      let photoId = babyPage?.photoId;
      let photoUri = babyPage?.photoUri;

      // Upload new photo if changed
      if (data.photoUri && data.photoUri !== babyPage?.photoUri) {
        const result = await uploadPhoto(authUser.uid, data.photoUri);
        photoId = result.photoId;
        photoUri = result.photoUri;
      }

      await updateBabyPage(pageId, {
        babyName: data.babyName,
        parentNames: data.parentNames,
        photoId,
        photoUri,
        houseRules: data.houseRules,
      });

      Alert.alert("Saved", "Your changes have been saved");
      router.back();
    } catch (error) {
      console.error("Error updating baby page:", error);
      Alert.alert("Error", "Failed to save changes");
    }
  };

  const handleDelete = () => {
    if (!pageId) return;

    Alert.alert(
      "Delete Page",
      "Are you sure you want to delete this baby page? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBabyPage(pageId);
              router.replace("/");
            } catch (error) {
              console.error("Error deleting page:", error);
              Alert.alert("Error", "Failed to delete page");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BLACK} />
      </View>
    );
  }

  if (!babyPage) {
    return (
      <View style={styles.errorContainer}>
        <Text weight="Bold" style={styles.errorTitle}>
          Page not found
        </Text>
        <Button label="Go Back" onPress={() => router.back()} outline />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Edit Page",
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <BabyPageForm
          initialData={{
            babyName: babyPage.babyName,
            parentNames: babyPage.parentNames,
            slug: babyPage.slug,
            normalizedSlug: babyPage.slug,
            photoUri: babyPage.photoUri,
            houseRules: babyPage.houseRules,
          }}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          isEdit
        />

        <View style={styles.dangerZone}>
          <Text weight="Bold" style={styles.dangerTitle}>
            Danger Zone
          </Text>
          <Text style={styles.dangerDescription}>
            Deleting this page will remove all availability slots, bookings, and
            guest lists. This cannot be undone.
          </Text>
          <Button
            label="Delete This Baby Page"
            onPress={handleDelete}
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>
    </>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    color: BLACK,
  },
  dangerZone: {
    marginTop: 40,
    padding: 20,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  dangerTitle: {
    fontSize: 16,
    color: "#991B1B",
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: "#991B1B",
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
  },
});
