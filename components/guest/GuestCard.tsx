import { View, StyleSheet, Pressable } from "react-native";
import { format } from "date-fns";

import { Text } from "@/components/Text";
import { GuestListDocument, VisitStatus } from "@/models/guestList";
import { BLACK, GRAY, LIGHT_GRAY, BORDER_WIDTH } from "@/lib/styles";

interface GuestCardProps {
  guest: GuestListDocument;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<
  VisitStatus,
  { label: string; backgroundColor: string; textColor: string }
> = {
  not_booked: {
    label: "Not booked",
    backgroundColor: "#F3F4F6",
    textColor: "#374151",
  },
  booked: {
    label: "Booked",
    backgroundColor: "#FEF08A",
    textColor: "#854D0E",
  },
  visited: {
    label: "Visited",
    backgroundColor: "#BBF7D0",
    textColor: "#166534",
  },
};

export function GuestCard({ guest, onPress }: GuestCardProps) {
  const statusConfig = STATUS_CONFIG[guest.visitStatus];

  return (
    <Pressable style={styles.card} onPress={onPress} disabled={!onPress}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {guest.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerContent}>
          <Text weight="Bold" style={styles.name}>
            {guest.name}
          </Text>
          {guest.relationship && (
            <Text style={styles.relationship}>{guest.relationship}</Text>
          )}
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.email}>{guest.email}</Text>
        {guest.phone && <Text style={styles.phone}>{guest.phone}</Text>}
      </View>

      {guest.visitStatus === "visited" && guest.lastVisitDate && (
        <View style={styles.visitInfo}>
          <Text style={styles.visitInfoText}>
            Last visited: {format(guest.lastVisitDate.toDate(), "MMM d, yyyy")}
          </Text>
          <Text style={styles.visitInfoText}>
            Total visits: {guest.totalVisits}
          </Text>
        </View>
      )}

      {guest.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesText}>{guest.notes}</Text>
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
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GRAY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    color: BLACK,
    fontWeight: "600",
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: BLACK,
  },
  relationship: {
    fontSize: 12,
    color: GRAY,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  details: {
    marginLeft: 52,
  },
  email: {
    fontSize: 14,
    color: GRAY,
  },
  phone: {
    fontSize: 14,
    color: GRAY,
    marginTop: 2,
  },
  visitInfo: {
    marginTop: 12,
    marginLeft: 52,
    flexDirection: "row",
    gap: 16,
  },
  visitInfoText: {
    fontSize: 12,
    color: GRAY,
  },
  notes: {
    marginTop: 8,
    marginLeft: 52,
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
  },
  notesText: {
    fontSize: 12,
    color: GRAY,
    fontStyle: "italic",
  },
});
