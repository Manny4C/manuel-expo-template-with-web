import { useLocalSearchParams, useRouter, Stack, Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Image,
  Pressable,
  Share,
  ActivityIndicator,
} from "react-native";

import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { useBabyPage } from "@/hooks/useBabyPage";
import { useAvailabilitySlots } from "@/hooks/useAvailabilitySlots";
import { useBookingsForPage } from "@/hooks/useBookings";
import { useGuestList } from "@/hooks/useGuestList";
import { getBabyPageBySlug, getBabyPageUrl } from "@/utils/slug";
import { BabyPageDocument } from "@/models/babyPage";
import { BLACK, GRAY, LIGHT_GRAY, BACKGROUND, BORDER_WIDTH } from "@/lib/styles";

export default function BabyPageOwnerView() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
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

  const { babyPage, isLoading: isLoadingBabyPage } = useBabyPage(pageId || undefined);
  const { slots } = useAvailabilitySlots(pageId || undefined);
  const { bookings } = useBookingsForPage(pageId || undefined, {
    status: ["pending", "confirmed"],
  });
  const { guests, visitedGuests, notVisitedGuests } = useGuestList(
    pageId || undefined
  );

  const isLoading = isLoadingPage || isLoadingBabyPage;

  const handleShare = async () => {
    if (!babyPage) return;
    try {
      await Share.share({
        message: `Come see ${babyPage.babyName}! Book your visit: ${getBabyPageUrl(babyPage.slug)}`,
        url: getBabyPageUrl(babyPage.slug),
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
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

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const upcomingBookings = bookings.filter((b) => b.status === "confirmed");

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: babyPage.babyName,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.photoContainer}>
            {babyPage.photoUri ? (
              <Image
                source={{ uri: babyPage.photoUri }}
                style={styles.photo}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>👶</Text>
              </View>
            )}
          </View>
          <Text weight="Bold" style={styles.babyName}>
            {babyPage.babyName}
          </Text>
          <Text style={styles.parentNames}>
            {babyPage.parentNames.join(" & ")}
          </Text>
          <Pressable onPress={handleShare}>
            <Text style={styles.shareLink}>
              {getBabyPageUrl(babyPage.slug)} ↗
            </Text>
          </Pressable>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text weight="Bold" style={styles.statNumber}>
              {slots.length}
            </Text>
            <Text style={styles.statLabel}>Available Slots</Text>
          </View>
          <View style={styles.statCard}>
            <Text weight="Bold" style={styles.statNumber}>
              {pendingBookings.length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text weight="Bold" style={styles.statNumber}>
              {upcomingBookings.length}
            </Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button
            primary
            label="Set Availability"
            onPress={() => router.push(`/baby/${slug}/availability` as Href)}
          />
          <Button
            outline
            label="Share Page"
            onPress={handleShare}
          />
        </View>

        {/* Quick Links */}
        <View style={styles.linksSection}>
          <Text weight="Bold" style={styles.sectionTitle}>
            Manage
          </Text>

          <Pressable
            style={styles.linkRow}
            onPress={() => router.push(`/baby/${slug}/bookings` as Href)}
          >
            <View style={styles.linkContent}>
              <Text weight="Medium" style={styles.linkTitle}>
                Bookings
              </Text>
              <Text style={styles.linkSubtitle}>
                {pendingBookings.length > 0
                  ? `${pendingBookings.length} pending approval`
                  : `${upcomingBookings.length} upcoming visits`}
              </Text>
            </View>
            <Text style={styles.linkArrow}>→</Text>
          </Pressable>

          <Pressable
            style={styles.linkRow}
            onPress={() => router.push(`/baby/${slug}/guests` as Href)}
          >
            <View style={styles.linkContent}>
              <Text weight="Medium" style={styles.linkTitle}>
                Guest List
              </Text>
              <Text style={styles.linkSubtitle}>
                {visitedGuests.length} visited, {notVisitedGuests.length} haven't
              </Text>
            </View>
            <Text style={styles.linkArrow}>→</Text>
          </Pressable>

          <Pressable
            style={styles.linkRow}
            onPress={() => router.push(`/baby/${slug}/edit` as Href)}
          >
            <View style={styles.linkContent}>
              <Text weight="Medium" style={styles.linkTitle}>
                Page Settings
              </Text>
              <Text style={styles.linkSubtitle}>
                Edit info, rules, and privacy
              </Text>
            </View>
            <Text style={styles.linkArrow}>→</Text>
          </Pressable>
        </View>

        {/* Guest Stats */}
        <View style={styles.guestStatsSection}>
          <Text weight="Bold" style={styles.sectionTitle}>
            Who's Seen {babyPage.babyName}?
          </Text>
          <View style={styles.guestStatsRow}>
            <View style={styles.guestStatCard}>
              <Text weight="Bold" style={styles.guestStatNumber}>
                {visitedGuests.length}
              </Text>
              <Text style={styles.guestStatLabel}>Have visited</Text>
            </View>
            <View style={styles.guestStatCard}>
              <Text weight="Bold" style={styles.guestStatNumber}>
                {notVisitedGuests.length}
              </Text>
              <Text style={styles.guestStatLabel}>Haven't visited yet</Text>
            </View>
          </View>
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
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 12,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: LIGHT_GRAY,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderText: {
    fontSize: 40,
  },
  babyName: {
    fontSize: 28,
    color: BLACK,
  },
  parentNames: {
    fontSize: 16,
    color: GRAY,
    marginTop: 4,
  },
  shareLink: {
    fontSize: 14,
    color: "#2563EB",
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    color: BLACK,
  },
  statLabel: {
    fontSize: 12,
    color: GRAY,
    marginTop: 4,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 32,
  },
  linksSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: BLACK,
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 12,
    marginBottom: 8,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    color: BLACK,
  },
  linkSubtitle: {
    fontSize: 14,
    color: GRAY,
    marginTop: 2,
  },
  linkArrow: {
    fontSize: 20,
    color: BLACK,
  },
  guestStatsSection: {
    marginBottom: 32,
  },
  guestStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  guestStatCard: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  guestStatNumber: {
    fontSize: 32,
    color: BLACK,
  },
  guestStatLabel: {
    fontSize: 14,
    color: GRAY,
    marginTop: 4,
    textAlign: "center",
  },
});
