import { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Switch,
  ScrollView,
} from "react-native";
import { format } from "date-fns";

import { Text } from "@/components/Text";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { BookingMode, DEFAULT_SLOT_SETTINGS } from "@/models/availabilitySlot";
import {
  BLACK,
  WHITE,
  GRAY,
  LIGHT_GRAY,
  BORDER_WIDTH,
  BACKGROUND,
} from "@/lib/styles";

export interface SlotSettings {
  maxGuests: number;
  visitDuration: number;
  mealAvailable: boolean;
  mealPreferences?: string;
  bookingMode: BookingMode;
  minimumLeadTimeHours: number;
}

interface SlotSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: SlotSettings) => void;
  onDelete?: () => void;
  initialSettings?: Partial<SlotSettings>;
  startTime?: Date;
  endTime?: Date;
  isEditing?: boolean;
}

export function SlotSettingsModal({
  visible,
  onClose,
  onSave,
  onDelete,
  initialSettings,
  startTime,
  endTime,
  isEditing = false,
}: SlotSettingsModalProps) {
  const [maxGuests, setMaxGuests] = useState(
    initialSettings?.maxGuests?.toString() ||
      DEFAULT_SLOT_SETTINGS.maxGuests.toString()
  );
  const [visitDuration, setVisitDuration] = useState(
    initialSettings?.visitDuration?.toString() ||
      DEFAULT_SLOT_SETTINGS.visitDuration.toString()
  );
  const [mealAvailable, setMealAvailable] = useState(
    initialSettings?.mealAvailable ?? DEFAULT_SLOT_SETTINGS.mealAvailable
  );
  const [mealPreferences, setMealPreferences] = useState(
    initialSettings?.mealPreferences || ""
  );
  const [bookingMode, setBookingMode] = useState<BookingMode>(
    initialSettings?.bookingMode ?? DEFAULT_SLOT_SETTINGS.bookingMode
  );
  const [minimumLeadTimeHours, setMinimumLeadTimeHours] = useState(
    initialSettings?.minimumLeadTimeHours?.toString() ||
      DEFAULT_SLOT_SETTINGS.minimumLeadTimeHours.toString()
  );

  const handleSave = () => {
    onSave({
      maxGuests: parseInt(maxGuests, 10) || DEFAULT_SLOT_SETTINGS.maxGuests,
      visitDuration:
        parseInt(visitDuration, 10) || DEFAULT_SLOT_SETTINGS.visitDuration,
      mealAvailable,
      mealPreferences: mealAvailable ? mealPreferences : undefined,
      bookingMode,
      minimumLeadTimeHours:
        parseInt(minimumLeadTimeHours, 10) ||
        DEFAULT_SLOT_SETTINGS.minimumLeadTimeHours,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </Pressable>
          <Text weight="Bold" style={styles.headerTitle}>
            {isEditing ? "Edit Slot" : "Slot Settings"}
          </Text>
          <Pressable onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {startTime && endTime && (
            <View style={styles.timeDisplay}>
              <Text weight="Medium" style={styles.timeLabel}>
                Time Window
              </Text>
              <Text style={styles.timeValue}>
                {format(startTime, "EEE, MMM d")} ·{" "}
                {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text weight="Medium" style={styles.sectionTitle}>
              Capacity
            </Text>

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Max guests per slot</Text>
              <Input
                value={maxGuests}
                onChangeText={setMaxGuests}
                keyboardType="number-pad"
                style={styles.numberInput}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Visit duration (minutes)</Text>
              <Input
                value={visitDuration}
                onChangeText={setVisitDuration}
                keyboardType="number-pad"
                style={styles.numberInput}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Minimum lead time (hours)</Text>
              <Input
                value={minimumLeadTimeHours}
                onChangeText={setMinimumLeadTimeHours}
                keyboardType="number-pad"
                style={styles.numberInput}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text weight="Medium" style={styles.sectionTitle}>
              Booking Approval
            </Text>

            <Pressable
              style={[
                styles.optionCard,
                bookingMode === "auto_confirm" && styles.optionCardSelected,
              ]}
              onPress={() => setBookingMode("auto_confirm")}
            >
              <View style={styles.optionRadio}>
                {bookingMode === "auto_confirm" && (
                  <View style={styles.optionRadioFilled} />
                )}
              </View>
              <View style={styles.optionContent}>
                <Text weight="Medium" style={styles.optionTitle}>
                  Auto-confirm
                </Text>
                <Text style={styles.optionDescription}>
                  Bookings are automatically confirmed
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.optionCard,
                bookingMode === "manual_approval" && styles.optionCardSelected,
              ]}
              onPress={() => setBookingMode("manual_approval")}
            >
              <View style={styles.optionRadio}>
                {bookingMode === "manual_approval" && (
                  <View style={styles.optionRadioFilled} />
                )}
              </View>
              <View style={styles.optionContent}>
                <Text weight="Medium" style={styles.optionTitle}>
                  Manual approval
                </Text>
                <Text style={styles.optionDescription}>
                  You'll need to approve each booking
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text weight="Medium" style={styles.sectionTitle}>
              Meal Coordination
            </Text>

            <View style={styles.switchRow}>
              <View style={styles.switchContent}>
                <Text weight="Medium" style={styles.switchLabel}>
                  Meal available
                </Text>
                <Text style={styles.switchDescription}>
                  Let visitors offer to bring a meal
                </Text>
              </View>
              <Switch
                value={mealAvailable}
                onValueChange={setMealAvailable}
                trackColor={{ false: GRAY, true: BLACK }}
                thumbColor={WHITE}
              />
            </View>

            {mealAvailable && (
              <View style={styles.mealPreferencesContainer}>
                <Text style={styles.inputLabel}>
                  Dietary preferences or notes
                </Text>
                <Input
                  value={mealPreferences}
                  onChangeText={setMealPreferences}
                  placeholder="e.g., Vegetarian, no nuts, love pasta..."
                  multiline
                  numberOfLines={2}
                  style={styles.mealInput}
                  fullWidth
                />
              </View>
            )}
          </View>

          {isEditing && onDelete && (
            <View style={styles.deleteSection}>
              <Button
                label="Delete This Slot"
                onPress={onDelete}
                style={styles.deleteButton}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
  },
  headerTitle: {
    fontSize: 18,
    color: BLACK,
  },
  cancelButton: {
    fontSize: 16,
    color: GRAY,
  },
  saveButton: {
    fontSize: 16,
    color: "#2563EB",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  timeDisplay: {
    backgroundColor: LIGHT_GRAY,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  timeLabel: {
    fontSize: 12,
    color: GRAY,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    color: BLACK,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: BLACK,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: BLACK,
    flex: 1,
  },
  numberInput: {
    width: 80,
    textAlign: "center",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: BORDER_WIDTH,
    borderColor: "transparent",
  },
  optionCardSelected: {
    borderColor: BLACK,
    backgroundColor: WHITE,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GRAY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionRadioFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BLACK,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    color: BLACK,
  },
  optionDescription: {
    fontSize: 12,
    color: GRAY,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 12,
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: BLACK,
  },
  switchDescription: {
    fontSize: 12,
    color: GRAY,
    marginTop: 2,
  },
  mealPreferencesContainer: {
    marginTop: 12,
    gap: 8,
  },
  mealInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  deleteSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: LIGHT_GRAY,
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
  },
});
