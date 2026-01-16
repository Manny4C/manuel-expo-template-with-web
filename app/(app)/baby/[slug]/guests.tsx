import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";

import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { GuestCard } from "@/components/guest/GuestCard";
import { useBabyPage } from "@/hooks/useBabyPage";
import { useGuestList } from "@/hooks/useGuestList";
import { getBabyPageBySlug } from "@/utils/slug";
import { createGuest, deleteGuest } from "@/utils/guests";
import { useUserContext } from "@/lib/auth";
import { GuestListDocument } from "@/models/guestList";
import {
  BLACK,
  WHITE,
  GRAY,
  LIGHT_GRAY,
  BACKGROUND,
  BORDER_WIDTH,
} from "@/lib/styles";

export default function GuestsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { authUser } = useUserContext();
  const [pageId, setPageId] = useState<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestListDocument | null>(
    null
  );

  // Form state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestRelationship, setGuestRelationship] = useState("");

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
  const {
    guests,
    visitedGuests,
    notVisitedGuests,
    isLoading: isLoadingGuests,
  } = useGuestList(pageId || undefined);

  const isLoading = isLoadingPage || isLoadingBabyPage || isLoadingGuests;

  const resetForm = () => {
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setGuestRelationship("");
  };

  const handleAddGuest = async () => {
    if (!pageId || !authUser?.uid) return;

    if (!guestName.trim() || !guestEmail.trim()) {
      Alert.alert("Missing info", "Please enter name and email");
      return;
    }

    try {
      await createGuest({
        babyPageId: pageId,
        ownerId: authUser.uid,
        name: guestName.trim(),
        email: guestEmail.trim().toLowerCase(),
        phone: guestPhone.trim() || undefined,
        relationship: guestRelationship.trim() || undefined,
      });

      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Error adding guest:", error);
      Alert.alert("Error", "Failed to add guest");
    }
  };

  const handleDeleteGuest = async (guest: GuestListDocument) => {
    Alert.alert(
      "Remove Guest",
      `Are you sure you want to remove ${guest.name} from your guest list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGuest(guest.id);
              setSelectedGuest(null);
            } catch (error) {
              console.error("Error deleting guest:", error);
              Alert.alert("Error", "Failed to remove guest");
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
          headerTitle: "Guest List",
          headerRight: () => (
            <Pressable onPress={() => setShowAddModal(true)}>
              <Text style={styles.addButton}>+ Add</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text weight="Bold" style={styles.statNumber}>
              {visitedGuests.length}
            </Text>
            <Text style={styles.statLabel}>Have visited</Text>
          </View>
          <View style={styles.statCard}>
            <Text weight="Bold" style={styles.statNumber}>
              {notVisitedGuests.length}
            </Text>
            <Text style={styles.statLabel}>Haven't visited</Text>
          </View>
        </View>

        {/* Guest List */}
        {guests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No guests yet</Text>
            <Text style={styles.emptyStateText}>
              Add friends and family to your guest list so they can schedule
              visits
            </Text>
            <Button
              label="Add Your First Guest"
              onPress={() => setShowAddModal(true)}
              primary
              style={styles.emptyStateButton}
            />
          </View>
        ) : (
          <>
            {/* Haven't visited section */}
            {notVisitedGuests.length > 0 && (
              <View style={styles.section}>
                <Text weight="Bold" style={styles.sectionTitle}>
                  Haven't Visited Yet ({notVisitedGuests.length})
                </Text>
                <View style={styles.guestsList}>
                  {notVisitedGuests.map((guest) => (
                    <GuestCard
                      key={guest.id}
                      guest={guest}
                      onPress={() => setSelectedGuest(guest)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Have visited section */}
            {visitedGuests.length > 0 && (
              <View style={styles.section}>
                <Text weight="Bold" style={styles.sectionTitle}>
                  Have Visited ({visitedGuests.length})
                </Text>
                <View style={styles.guestsList}>
                  {visitedGuests.map((guest) => (
                    <GuestCard
                      key={guest.id}
                      guest={guest}
                      onPress={() => setSelectedGuest(guest)}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Guest Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text weight="Bold" style={styles.modalTitle}>
              Add Guest
            </Text>
            <Pressable onPress={handleAddGuest}>
              <Text style={styles.modalSave}>Add</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text weight="Medium" style={styles.formLabel}>
                Name *
              </Text>
              <Input
                value={guestName}
                onChangeText={setGuestName}
                placeholder="Guest's name"
                fullWidth
              />
            </View>

            <View style={styles.formGroup}>
              <Text weight="Medium" style={styles.formLabel}>
                Email *
              </Text>
              <Input
                value={guestEmail}
                onChangeText={setGuestEmail}
                placeholder="guest@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                fullWidth
              />
            </View>

            <View style={styles.formGroup}>
              <Text weight="Medium" style={styles.formLabel}>
                Phone (optional)
              </Text>
              <Input
                value={guestPhone}
                onChangeText={setGuestPhone}
                placeholder="(555) 123-4567"
                keyboardType="phone-pad"
                fullWidth
              />
            </View>

            <View style={styles.formGroup}>
              <Text weight="Medium" style={styles.formLabel}>
                Relationship (optional)
              </Text>
              <Input
                value={guestRelationship}
                onChangeText={setGuestRelationship}
                placeholder="e.g., Grandparent, Friend, Coworker"
                fullWidth
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Guest Detail Modal */}
      <Modal
        visible={!!selectedGuest}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedGuest(null)}
      >
        {selectedGuest && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setSelectedGuest(null)}>
                <Text style={styles.modalCancel}>Close</Text>
              </Pressable>
              <Text weight="Bold" style={styles.modalTitle}>
                {selectedGuest.name}
              </Text>
              <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <GuestCard guest={selectedGuest} />

              <View style={styles.modalActions}>
                <Button
                  label="Remove Guest"
                  onPress={() => handleDeleteGuest(selectedGuest)}
                  style={styles.deleteButton}
                />
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  contentContainer: {
    padding: 16,
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
  addButton: {
    fontSize: 16,
    color: "#2563EB",
    marginRight: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    color: BLACK,
  },
  statLabel: {
    fontSize: 14,
    color: GRAY,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    color: BLACK,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: GRAY,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyStateButton: {
    minWidth: 200,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: BLACK,
    marginBottom: 12,
  },
  guestsList: {
    gap: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
  },
  modalTitle: {
    fontSize: 18,
    color: BLACK,
  },
  modalCancel: {
    fontSize: 16,
    color: GRAY,
  },
  modalSave: {
    fontSize: 16,
    color: "#2563EB",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalActions: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: LIGHT_GRAY,
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
  },
});
