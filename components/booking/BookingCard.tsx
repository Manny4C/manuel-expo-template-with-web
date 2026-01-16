import { View, StyleSheet, Pressable } from "react-native";
import { format } from "date-fns";

import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { BookingDocument } from "@/models/booking";
import { BLACK, GRAY, LIGHT_GRAY, BORDER_WIDTH } from "@/lib/styles";

interface BookingCardProps {
  booking: BookingDocument;
  onApprove?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
  onPress?: () => void;
  showActions?: boolean;
}

export function BookingCard({
  booking,
  onApprove,
  onReject,
  onComplete,
  onPress,
  showActions = true,
}: BookingCardProps) {
  const arrivalDate = booking.arrivalTime.toDate();
  const isPending = booking.status === "pending";
  const isConfirmed = booking.status === "confirmed";
  const isPast = arrivalDate < new Date();

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text weight="Bold" style={styles.visitorName}>
            {booking.visitorName}
          </Text>
          <BookingStatusBadge status={booking.status} />
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>When:</Text>
          <Text style={styles.detailValue}>
            {format(arrivalDate, "EEE, MMM d 'at' h:mm a")}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Guests:</Text>
          <Text style={styles.detailValue}>
            {booking.totalGuestCount}{" "}
            {booking.totalGuestCount === 1 ? "person" : "people"}
            {booking.tagAlongs.length > 0 && (
              <Text style={styles.tagAlongText}>
                {" "}
                (+ {booking.tagAlongs.map((t) => t.name).join(", ")})
              </Text>
            )}
          </Text>
        </View>

        {booking.bringingMeal && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bringing meal:</Text>
            <Text style={styles.detailValue}>
              {booking.mealDescription || "Yes"}
            </Text>
          </View>
        )}

        {booking.visitorNotes && (
          <View style={styles.notesRow}>
            <Text style={styles.detailLabel}>Note:</Text>
            <Text style={styles.notesText}>{booking.visitorNotes}</Text>
          </View>
        )}
      </View>

      {showActions && (
        <View style={styles.actions}>
          {isPending && (
            <>
              <Button
                label="Approve"
                onPress={onApprove || (() => {})}
                primary
                style={styles.actionButton}
              />
              <Button
                label="Decline"
                onPress={onReject || (() => {})}
                outline
                style={styles.actionButton}
              />
            </>
          )}
          {isConfirmed && isPast && (
            <Button
              label="Mark Complete"
              onPress={onComplete || (() => {})}
              primary
              style={styles.actionButton}
            />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 12,
    padding: 16,
    borderWidth: BORDER_WIDTH,
    borderColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  visitorName: {
    fontSize: 18,
    color: BLACK,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: GRAY,
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: BLACK,
    flex: 1,
  },
  tagAlongText: {
    color: GRAY,
  },
  notesRow: {
    marginTop: 4,
  },
  notesText: {
    fontSize: 14,
    color: BLACK,
    fontStyle: "italic",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: GRAY,
  },
  actionButton: {
    flex: 1,
  },
});
