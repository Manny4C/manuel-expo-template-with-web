import { View, StyleSheet, Pressable } from "react-native";
import { format } from "date-fns";

import { Text } from "@/components/Text";
import { AvailabilitySlotDocument } from "@/models/availabilitySlot";
import { BLACK, GRAY, LIGHT_GRAY, BORDER_WIDTH } from "@/lib/styles";

interface TimeSlotCardProps {
  slot: AvailabilitySlotDocument;
  onPress?: () => void;
}

export function TimeSlotCard({ slot, onPress }: TimeSlotCardProps) {
  const startDate = slot.startTime.toDate();
  const endDate = slot.endTime.toDate();
  const remainingCapacity = slot.maxGuests - slot.currentBookings;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.timeColumn}>
        <Text weight="Bold" style={styles.date}>
          {format(startDate, "EEE, MMM d")}
        </Text>
        <Text style={styles.time}>
          {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
        </Text>
      </View>

      <View style={styles.detailsColumn}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Capacity:</Text>
          <Text style={styles.detailValue}>
            {remainingCapacity}/{slot.maxGuests} available
          </Text>
        </View>

        <View style={styles.tagsRow}>
          {slot.mealAvailable && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Meal OK</Text>
            </View>
          )}
          <View
            style={[
              styles.tag,
              slot.bookingMode === "auto_confirm"
                ? styles.autoTag
                : styles.manualTag,
            ]}
          >
            <Text style={styles.tagText}>
              {slot.bookingMode === "auto_confirm" ? "Auto" : "Manual"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 12,
    borderWidth: BORDER_WIDTH,
    borderColor: "transparent",
  },
  timeColumn: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    color: BLACK,
  },
  time: {
    fontSize: 14,
    color: GRAY,
    marginTop: 4,
  },
  detailsColumn: {
    alignItems: "flex-end",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: GRAY,
  },
  detailValue: {
    fontSize: 12,
    color: BLACK,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: GRAY,
  },
  autoTag: {
    backgroundColor: "#BBF7D0",
  },
  manualTag: {
    backgroundColor: "#FEF08A",
  },
  tagText: {
    fontSize: 10,
    color: BLACK,
  },
  arrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 24,
    color: GRAY,
  },
});
