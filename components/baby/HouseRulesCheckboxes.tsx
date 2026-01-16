import { View, StyleSheet, Pressable } from "react-native";

import { Text } from "@/components/Text";
import { Input } from "@/components/Input";
import { HouseRules } from "@/models/babyPage";
import { BLACK, GRAY, LIGHT_GRAY, BORDER_WIDTH } from "@/lib/styles";

interface HouseRulesCheckboxesProps {
  value: HouseRules;
  onChange: (rules: HouseRules) => void;
}

interface CheckboxOption {
  key: keyof Omit<HouseRules, "customRules">;
  label: string;
  description: string;
}

const CHECKBOX_OPTIONS: CheckboxOption[] = [
  {
    key: "noSickVisitors",
    label: "No sick visitors",
    description: "Do not visit if feeling unwell or recently exposed to illness",
  },
  {
    key: "washHands",
    label: "Wash hands",
    description: "Please wash or sanitize hands before holding baby",
  },
  {
    key: "requireMask",
    label: "Wear a mask",
    description: "Please wear a mask during your visit",
  },
  {
    key: "noKissing",
    label: "No kissing",
    description: "Please don't kiss the baby",
  },
  {
    key: "removeShoes",
    label: "Remove shoes",
    description: "Please remove shoes at the door",
  },
];

function Checkbox({
  checked,
  onPress,
  label,
  description,
}: {
  checked: boolean;
  onPress: () => void;
  label: string;
  description: string;
}) {
  return (
    <Pressable style={styles.checkboxRow} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.checkboxContent}>
        <Text weight="Medium" style={styles.checkboxLabel}>
          {label}
        </Text>
        <Text style={styles.checkboxDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

export function HouseRulesCheckboxes({
  value,
  onChange,
}: HouseRulesCheckboxesProps) {
  const toggleRule = (key: keyof Omit<HouseRules, "customRules">) => {
    onChange({
      ...value,
      [key]: !value[key],
    });
  };

  const updateCustomRules = (text: string) => {
    onChange({
      ...value,
      customRules: text,
    });
  };

  return (
    <View style={styles.container}>
      <Text weight="Medium" style={styles.sectionLabel}>
        House Rules
      </Text>
      <Text style={styles.sectionDescription}>
        These will be displayed to visitors before they book
      </Text>

      <View style={styles.checkboxList}>
        {CHECKBOX_OPTIONS.map((option) => (
          <Checkbox
            key={option.key}
            checked={value[option.key]}
            onPress={() => toggleRule(option.key)}
            label={option.label}
            description={option.description}
          />
        ))}
      </View>

      <View style={styles.customRulesContainer}>
        <Text weight="Medium" style={styles.customRulesLabel}>
          Additional rules or notes
        </Text>
        <Input
          value={value.customRules}
          onChangeText={updateCustomRules}
          placeholder="e.g., Please text when you arrive, No perfume/cologne..."
          multiline
          numberOfLines={3}
          style={styles.customRulesInput}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: GRAY,
    marginBottom: 8,
  },
  checkboxList: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: BORDER_WIDTH,
    borderColor: GRAY,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GRAY,
  },
  checkboxChecked: {
    backgroundColor: BLACK,
    borderColor: BLACK,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  checkboxDescription: {
    fontSize: 12,
    color: GRAY,
    marginTop: 2,
  },
  customRulesContainer: {
    marginTop: 16,
    gap: 8,
  },
  customRulesLabel: {
    fontSize: 14,
  },
  customRulesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});
