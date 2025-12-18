import { StyleSheet } from "react-native";

import { SECONDARY_TEXT_COLOR } from "@/lib/styles";

export const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    width: "100%",
    flexGrow: 0,
  },
  secondaryButton: {
    color: SECONDARY_TEXT_COLOR,
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  disabled: {
    opacity: 0.5,
  },
});
