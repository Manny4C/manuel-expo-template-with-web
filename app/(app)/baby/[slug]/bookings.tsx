import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { BookingCard } from "@/components/booking/BookingCard";
import { useBabyPage } from "@/hooks/useBabyPage";
import { useBookingsForPage } from "@/hooks/useBookings";
import { getBabyPageBySlug } from "@/utils/slug";
import { confirmBooking, cancelBooking, completeBooking } from "@/utils/booking";
import { BookingDocument, BookingStatus } from "@/models/booking";
import { BLACK, GRAY, LIGHT_GRAY, BACKGROUND, WHITE } from "@/lib/styles";

type TabType = "pending" | "upcoming" | "past";

export default function BookingsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [pageId, setPageId] = useState<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("pending");

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
  const { bookings, isLoading: isLoadingBookings } = useBookingsForPage(
    pageId || undefined
  );

  const isLoading = isLoadingPage || isLoadingBabyPage || isLoadingBookings;

  // Filter bookings by tab
  const now = new Date();
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const upcomingBookings = bookings.filter(
    (b) =>
      b.status === "confirmed" && b.arrivalTime.toDate() >= now
  );
  const pastBookings = bookings.filter(
    (b) =>
      b.status === "completed" ||
      b.status === "no_show" ||
      b.status === "cancelled" ||
      (b.status === "confirmed" && b.arrivalTime.toDate() < now)
  );

  const getBookingsForTab = () => {
    switch (activeTab) {
      case "pending":
        return pendingBookings;
      case "upcoming":
        return upcomingBookings;
      case "past":
        return pastBookings;
    }
  };

  const handleApprove = async (booking: BookingDocument) => {
    try {
      await confirmBooking(booking.id);
    } catch (error) {
      console.error("Error approving booking:", error);
      Alert.alert("Error", "Failed to approve booking");
    }
  };

  const handleReject = async (booking: BookingDocument) => {
    Alert.alert(
      "Decline Booking",
      `Are you sure you want to decline ${booking.visitorName}'s visit?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelBooking(booking.id, false);
            } catch (error) {
              console.error("Error declining booking:", error);
              Alert.alert("Error", "Failed to decline booking");
            }
          },
        },
      ]
    );
  };

  const handleComplete = async (booking: BookingDocument) => {
    try {
      await completeBooking(booking.id);
    } catch (error) {
      console.error("Error completing booking:", error);
      Alert.alert("Error", "Failed to mark booking as complete");
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

  const currentBookings = getBookingsForTab();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Bookings",
        }}
      />
      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, activeTab === "pending" && styles.tabActive]}
            onPress={() => setActiveTab("pending")}
          >
            <Text
              weight={activeTab === "pending" ? "Bold" : "Regular"}
              style={[
                styles.tabText,
                activeTab === "pending" && styles.tabTextActive,
              ]}
            >
              Pending
            </Text>
            {pendingBookings.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingBookings.length}</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text
              weight={activeTab === "upcoming" ? "Bold" : "Regular"}
              style={[
                styles.tabText,
                activeTab === "upcoming" && styles.tabTextActive,
              ]}
            >
              Upcoming
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === "past" && styles.tabActive]}
            onPress={() => setActiveTab("past")}
          >
            <Text
              weight={activeTab === "past" ? "Bold" : "Regular"}
              style={[
                styles.tabText,
                activeTab === "past" && styles.tabTextActive,
              ]}
            >
              Past
            </Text>
          </Pressable>
        </View>

        {/* Bookings List */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {currentBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {activeTab === "pending"
                  ? "No pending booking requests"
                  : activeTab === "upcoming"
                  ? "No upcoming visits scheduled"
                  : "No past visits yet"}
              </Text>
            </View>
          ) : (
            <View style={styles.bookingsList}>
              {currentBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onApprove={() => handleApprove(booking)}
                  onReject={() => handleReject(booking)}
                  onComplete={() => handleComplete(booking)}
                  showActions={
                    activeTab === "pending" ||
                    (activeTab === "upcoming" &&
                      booking.arrivalTime.toDate() < now)
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
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
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: BLACK,
  },
  tabText: {
    fontSize: 16,
    color: GRAY,
  },
  tabTextActive: {
    color: BLACK,
  },
  badge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: GRAY,
    textAlign: "center",
  },
  bookingsList: {
    gap: 12,
  },
});
