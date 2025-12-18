import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

import { BLACK, BORDER_RADIUS, BORDER_WIDTH, WHITE } from "@/lib/styles";

import { Text } from "./Text";

export function Button({
  className,
  style,
  label,
  content,
  onPress,
  loading,
  primary,
  outline,
  flat,
  disabled,
}: {
  className?: string;
  style?: StyleProp<ViewStyle>;
  label?: string;
  content?: React.ReactNode;
  onPress: () => void | Promise<void>;
  loading?: boolean;
  primary?: boolean;
  outline?: boolean;
  flat?: boolean;
  disabled?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);

  function handlePress() {
    if (loading || isLoading) return;

    const result = onPress?.();
    if (result instanceof Promise) {
      setIsLoading(true);
      result.finally(() => setIsLoading(false));
    }
  }

  return (
    <Pressable
      style={[
        styles.button,
        primary && styles.primaryButton,
        outline && styles.outlineButton,
        flat && styles.flat,
        disabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
    >
      {loading || isLoading ? (
        <ActivityIndicator color={primary ? WHITE : BLACK} />
      ) : (
        content || (
          <Text
            weight="Medium"
            style={[styles.buttonLabel, primary && styles.primaryButtonLabel]}
          >
            {label}
          </Text>
        )
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: BLACK,
  },
  buttonLabel: {
    color: BLACK,
    fontSize: 16,
    textTransform: "uppercase",
  },
  primaryButtonLabel: {
    color: WHITE,
  },
  outlineButton: {
    borderWidth: BORDER_WIDTH,
    borderColor: BLACK,
    paddingVertical: 15 - BORDER_WIDTH,
    paddingHorizontal: 20 - BORDER_WIDTH,
  },
  flat: {
    borderRadius: 0,
  },
  disabled: {
    opacity: 0.5,
  },
});
