import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  format,
  addDays,
  startOfDay,
  setHours,
  setMinutes,
  isSameDay,
} from "date-fns";

import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { TimeSlotCard } from "@/components/calendar/TimeSlotCard";
import {
  SlotSettingsModal,
  SlotSettings,
} from "@/components/calendar/SlotSettingsModal";
import { useBabyPage } from "@/hooks/useBabyPage";
import { useAvailabilitySlots } from "@/hooks/useAvailabilitySlots";
import { getBabyPageBySlug } from "@/utils/slug";
import {
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
} from "@/utils/availability";
import { AvailabilitySlotDocument } from "@/models/availabilitySlot";
import { useUserContext } from "@/lib/auth";
import {
  BLACK,
  WHITE,
  GRAY,
  LIGHT_GRAY,
  BACKGROUND,
  BORDER_WIDTH,
} from "@/lib/styles";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

export default function AvailabilityScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { authUser } = useUserContext();
  const [pageId, setPageId] = useState<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  // Date selection state
  const [selectedDate, setSelectedDate] = useState<Date>(
    startOfDay(new Date())
  );
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(
    null
  );
  const [selectedEndHour, setSelectedEndHour] = useState<number | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlotDocument | null>(
    null
  );

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
  const { slots, isLoading: isLoadingSlots } = useAvailabilitySlots(
    pageId || undefined,
    { includeExpired: false }
  );

  const isLoading = isLoadingPage || isLoadingBabyPage || isLoadingSlots;

  // Generate days for the date picker (next 14 days)
  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  // Get slots for selected date
  const slotsForSelectedDate = slots.filter((slot) =>
    isSameDay(slot.startTime.toDate(), selectedDate)
  );

  const handleHourPress = (hour: number) => {
    if (selectedStartHour === null) {
      setSelectedStartHour(hour);
      setSelectedEndHour(null);
    } else if (selectedEndHour === null) {
      if (hour > selectedStartHour) {
        setSelectedEndHour(hour);
        setShowModal(true);
      } else {
        // Start over with new start hour
        setSelectedStartHour(hour);
        setSelectedEndHour(null);
      }
    } else {
      // Reset and start new selection
      setSelectedStartHour(hour);
      setSelectedEndHour(null);
    }
  };

  const handleSlotPress = (slot: AvailabilitySlotDocument) => {
    setEditingSlot(slot);
    setShowModal(true);
  };

  const handleSaveSlot = async (settings: SlotSettings) => {
    if (!pageId || !authUser?.uid) return;

    try {
      if (editingSlot) {
        // Update existing slot
        await updateAvailabilitySlot(editingSlot.id, {
          ...settings,
        });
      } else if (selectedStartHour !== null && selectedEndHour !== null) {
        // Create new slot
        const startTime = setMinutes(
          setHours(selectedDate, selectedStartHour),
          0
        );
        const endTime = setMinutes(setHours(selectedDate, selectedEndHour), 0);

        await createAvailabilitySlot({
          babyPageId: pageId,
          ownerId: authUser.uid,
          startTime,
          endTime,
          ...settings,
        });
      }

      // Reset state
      setShowModal(false);
      setEditingSlot(null);
      setSelectedStartHour(null);
      setSelectedEndHour(null);
    } catch (error) {
      console.error("Error saving slot:", error);
      Alert.alert("Error", "Failed to save availability slot");
    }
  };

  const handleDeleteSlot = async () => {
    if (!editingSlot) return;

    Alert.alert(
      "Delete Slot",
      "Are you sure you want to delete this availability slot?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAvailabilitySlot(editingSlot.id);
              setShowModal(false);
              setEditingSlot(null);
            } catch (error) {
              console.error("Error deleting slot:", error);
              Alert.alert("Error", "Failed to delete slot");
            }
          },
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSlot(null);
    setSelectedStartHour(null);
    setSelectedEndHour(null);
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
          headerTitle: `${babyPage.babyName}'s Availability`,
        }}
      />
      <View style={styles.container}>
        {/* Date Picker */}
        <View style={styles.datePickerContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datePicker}
          >
            {days.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              return (
                <Pressable
                  key={day.toISOString()}
                  style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                  onPress={() => setSelectedDate(startOfDay(day))}
                >
                  <Text
                    style={[
                      styles.dateDayName,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {format(day, "EEE")}
                  </Text>
                  <Text
                    weight="Bold"
                    style={[
                      styles.dateNumber,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {format(day, "d")}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView style={styles.content}>
          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>
              Tap a start time, then tap an end time to create an availability
              window
            </Text>
          </View>

          {/* Hour Grid */}
          <View style={styles.hourGrid}>
            {HOURS.map((hour) => {
              const isStartSelected = selectedStartHour === hour;
              const isEndSelected = selectedEndHour === hour;
              const isInRange =
                selectedStartHour !== null &&
                selectedEndHour !== null &&
                hour > selectedStartHour &&
                hour < selectedEndHour;
              const isSelecting =
                selectedStartHour !== null && selectedEndHour === null;

              return (
                <Pressable
                  key={hour}
                  style={[
                    styles.hourRow,
                    (isStartSelected || isEndSelected) && styles.hourRowSelected,
                    isInRange && styles.hourRowInRange,
                  ]}
                  onPress={() => handleHourPress(hour)}
                >
                  <Text
                    style={[
                      styles.hourLabel,
                      (isStartSelected || isEndSelected) &&
                        styles.hourLabelSelected,
                    ]}
                  >
                    {format(setHours(new Date(), hour), "h:mm a")}
                  </Text>
                  {isStartSelected && (
                    <Text style={styles.hourHint}>
                      {isSelecting ? "Start" : "Start"}
                    </Text>
                  )}
                  {isEndSelected && <Text style={styles.hourHint}>End</Text>}
                </Pressable>
              );
            })}
          </View>

          {/* Existing Slots for Selected Date */}
          {slotsForSelectedDate.length > 0 && (
            <View style={styles.existingSlotsSection}>
              <Text weight="Bold" style={styles.sectionTitle}>
                Existing Slots for {format(selectedDate, "MMM d")}
              </Text>
              <View style={styles.slotsList}>
                {slotsForSelectedDate.map((slot) => (
                  <TimeSlotCard
                    key={slot.id}
                    slot={slot}
                    onPress={() => handleSlotPress(slot)}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Slot Settings Modal */}
        <SlotSettingsModal
          visible={showModal}
          onClose={handleCloseModal}
          onSave={handleSaveSlot}
          onDelete={editingSlot ? handleDeleteSlot : undefined}
          initialSettings={
            editingSlot
              ? {
                  maxGuests: editingSlot.maxGuests,
                  visitDuration: editingSlot.visitDuration,
                  mealAvailable: editingSlot.mealAvailable,
                  mealPreferences: editingSlot.mealPreferences,
                  bookingMode: editingSlot.bookingMode,
                  minimumLeadTimeHours: editingSlot.minimumLeadTimeHours,
                }
              : undefined
          }
          startTime={
            editingSlot
              ? editingSlot.startTime.toDate()
              : selectedStartHour !== null
              ? setHours(selectedDate, selectedStartHour)
              : undefined
          }
          endTime={
            editingSlot
              ? editingSlot.endTime.toDate()
              : selectedEndHour !== null
              ? setHours(selectedDate, selectedEndHour)
              : undefined
          }
          isEditing={!!editingSlot}
        />
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
  datePickerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
  },
  datePicker: {
    padding: 12,
    gap: 8,
  },
  dateItem: {
    width: 56,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: LIGHT_GRAY,
  },
  dateItemSelected: {
    backgroundColor: BLACK,
  },
  dateDayName: {
    fontSize: 12,
    color: GRAY,
  },
  dateNumber: {
    fontSize: 20,
    color: BLACK,
    marginTop: 4,
  },
  dateTextSelected: {
    color: WHITE,
  },
  content: {
    flex: 1,
  },
  instructions: {
    padding: 16,
    backgroundColor: LIGHT_GRAY,
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: GRAY,
    textAlign: "center",
  },
  hourGrid: {
    paddingHorizontal: 16,
  },
  hourRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
  },
  hourRowSelected: {
    backgroundColor: BLACK,
  },
  hourRowInRange: {
    backgroundColor: LIGHT_GRAY,
  },
  hourLabel: {
    fontSize: 16,
    color: BLACK,
  },
  hourLabelSelected: {
    color: WHITE,
  },
  hourHint: {
    fontSize: 12,
    color: WHITE,
    backgroundColor: "#2563EB",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  existingSlotsSection: {
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: BLACK,
    marginBottom: 12,
  },
  slotsList: {
    gap: 8,
  },
});
