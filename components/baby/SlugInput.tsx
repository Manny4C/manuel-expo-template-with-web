import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { Input } from "@/components/Input";
import { Text } from "@/components/Text";
import { useSlugAvailability } from "@/hooks/useSlugAvailability";
import { BLACK, GRAY, LIGHT_GRAY } from "@/lib/styles";

interface SlugInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onAvailabilityChange?: (isAvailable: boolean, normalizedSlug: string) => void;
}

export function SlugInput({
  value,
  onChangeText,
  onAvailabilityChange,
}: SlugInputProps) {
  const {
    isChecking,
    isAvailable,
    error,
    normalizedSlug,
    checkAvailability,
  } = useSlugAvailability();

  const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (value.trim()) {
      const timeout = setTimeout(() => {
        checkAvailability(value);
      }, 500);
      setDebounceTimeout(timeout);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (isAvailable !== null && normalizedSlug) {
      onAvailabilityChange?.(isAvailable, normalizedSlug);
    }
  }, [isAvailable, normalizedSlug, onAvailabilityChange]);

  return (
    <View style={styles.container}>
      <Text weight="Medium" style={styles.label}>
        Your Page URL
      </Text>
      <View style={styles.inputContainer}>
        <View style={styles.prefixContainer}>
          <Text style={styles.prefix}>yougottaseethebaby.com/</Text>
        </View>
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder="smithfamily"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        {isChecking && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color={BLACK} />
          </View>
        )}
        {!isChecking && isAvailable === true && (
          <View style={styles.statusContainer}>
            <Text style={styles.available}>Available!</Text>
          </View>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {normalizedSlug && !error && (
        <Text style={styles.preview}>
          yougottaseethebaby.com/{normalizedSlug}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  prefixContainer: {
    backgroundColor: LIGHT_GRAY,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 2,
    borderRightWidth: 0,
    borderColor: GRAY,
  },
  prefix: {
    fontSize: 14,
    color: BLACK,
  },
  input: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  statusContainer: {
    position: "absolute",
    right: 12,
  },
  available: {
    color: "#22C55E",
    fontSize: 14,
  },
  error: {
    color: "#EF4444",
    fontSize: 12,
  },
  preview: {
    color: GRAY,
    fontSize: 12,
  },
});
