import { useRouter, Href } from "expo-router";
import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";

import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { BabyPageCard } from "@/components/baby/BabyPageCard";
import { useBabyPages } from "@/hooks/useBabyPages";
import { useUserContext } from "@/lib/auth";
import { BLACK, BACKGROUND, GRAY } from "@/lib/styles";

export default function HomePage() {
  const router = useRouter();
  const { authUser } = useUserContext();
  const { babyPages, isLoading } = useBabyPages(authUser?.uid);

  const handleCreatePage = () => {
    router.push("/baby/create" as Href);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BLACK} />
      </View>
    );
  }

  // No baby pages yet - show welcome screen
  if (babyPages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Text style={styles.emoji}>👶</Text>
          <Text style={styles.mainText} weight="Bold">
            You gotta see the baby!
          </Text>
          <Text style={styles.subtitle}>
            Create a page to let friends and family schedule visits to meet your
            little one
          </Text>
        </View>
        <Button
          label="I Have a Baby to Show Off"
          onPress={handleCreatePage}
          primary
          style={styles.createButton}
        />
      </View>
    );
  }

  // Has baby pages - show dashboard
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text weight="Bold" style={styles.headerTitle}>
          Your Baby Pages
        </Text>
        <Text style={styles.headerSubtitle}>
          {babyPages.length} {babyPages.length === 1 ? "page" : "pages"}
        </Text>
      </View>

      <View style={styles.pagesList}>
        {babyPages.map((page) => (
          <BabyPageCard key={page.id} page={page} />
        ))}
      </View>

      <View style={styles.addMoreSection}>
        <Button
          label="Create Another Page"
          onPress={handleCreatePage}
          outline
        />
        <Text style={styles.addMoreHint}>
          For a new baby or a different set of visitors
        </Text>
      </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 32,
  },
  emptyContent: {
    alignItems: "center",
    gap: 16,
  },
  emoji: {
    fontSize: 64,
  },
  mainText: {
    fontSize: 32,
    textAlign: "center",
    lineHeight: 40,
    color: BLACK,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: GRAY,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  createButton: {
    minWidth: 280,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    color: BLACK,
  },
  headerSubtitle: {
    fontSize: 16,
    color: GRAY,
    marginTop: 4,
  },
  pagesList: {
    gap: 12,
    marginBottom: 32,
  },
  addMoreSection: {
    alignItems: "center",
    gap: 8,
  },
  addMoreHint: {
    fontSize: 14,
    color: GRAY,
    textAlign: "center",
  },
});
