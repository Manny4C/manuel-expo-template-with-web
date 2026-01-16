import { View, StyleSheet } from "react-native";

import { Text } from "@/components/Text";
import { BookingStatus } from "@/models/booking";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; backgroundColor: string; textColor: string }
> = {
  pending: {
    label: "Pending",
    backgroundColor: "#FEF08A",
    textColor: "#854D0E",
  },
  confirmed: {
    label: "Confirmed",
    backgroundColor: "#BBF7D0",
    textColor: "#166534",
  },
  cancelled: {
    label: "Cancelled",
    backgroundColor: "#FEE2E2",
    textColor: "#991B1B",
  },
  completed: {
    label: "Completed",
    backgroundColor: "#E0E7FF",
    textColor: "#3730A3",
  },
  no_show: {
    label: "No Show",
    backgroundColor: "#F3F4F6",
    textColor: "#374151",
  },
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.text, { color: config.textColor }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
