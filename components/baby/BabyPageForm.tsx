import { useState, useCallback } from "react";
import { View, StyleSheet, Image, Pressable, Alert } from "react-native";

import { Input } from "@/components/Input";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { SlugInput } from "./SlugInput";
import { HouseRulesCheckboxes } from "./HouseRulesCheckboxes";
import { Camera } from "@/components/Camera";
import { HouseRules, DEFAULT_HOUSE_RULES } from "@/models/babyPage";
import { BLACK, GRAY, LIGHT_GRAY, BORDER_WIDTH } from "@/lib/styles";

export interface BabyPageFormData {
  babyName: string;
  parentNames: string[];
  slug: string;
  normalizedSlug: string;
  photoUri?: string;
  houseRules: HouseRules;
}

interface BabyPageFormProps {
  initialData?: Partial<BabyPageFormData>;
  onSubmit: (data: BabyPageFormData) => Promise<void>;
  submitLabel?: string;
  isEdit?: boolean;
}

export function BabyPageForm({
  initialData,
  onSubmit,
  submitLabel = "Create Page",
  isEdit = false,
}: BabyPageFormProps) {
  const [babyName, setBabyName] = useState(initialData?.babyName || "");
  const [parentName1, setParentName1] = useState(
    initialData?.parentNames?.[0] || ""
  );
  const [parentName2, setParentName2] = useState(
    initialData?.parentNames?.[1] || ""
  );
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [normalizedSlug, setNormalizedSlug] = useState(
    initialData?.normalizedSlug || ""
  );
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [photoUri, setPhotoUri] = useState(initialData?.photoUri);
  const [houseRules, setHouseRules] = useState<HouseRules>(
    initialData?.houseRules || DEFAULT_HOUSE_RULES
  );
  const [showCamera, setShowCamera] = useState(false);

  const handleSlugAvailabilityChange = useCallback(
    (isAvailable: boolean, normalized: string) => {
      setSlugAvailable(isAvailable);
      setNormalizedSlug(normalized);
    },
    []
  );

  const handlePhotoCapture = (uri: string) => {
    setPhotoUri(uri);
    setShowCamera(false);
  };

  const handleSubmit = async () => {
    if (!babyName.trim()) {
      Alert.alert("Missing info", "Please enter baby's name");
      return;
    }
    if (!parentName1.trim()) {
      Alert.alert("Missing info", "Please enter at least one parent name");
      return;
    }
    if (!isEdit && !normalizedSlug) {
      Alert.alert("Missing info", "Please enter a URL for your page");
      return;
    }
    if (!isEdit && !slugAvailable) {
      Alert.alert("URL unavailable", "Please choose a different URL");
      return;
    }

    const parentNames = [parentName1.trim()];
    if (parentName2.trim()) {
      parentNames.push(parentName2.trim());
    }

    await onSubmit({
      babyName: babyName.trim(),
      parentNames,
      slug,
      normalizedSlug,
      photoUri,
      houseRules,
    });
  };

  const isValid =
    babyName.trim() &&
    parentName1.trim() &&
    (isEdit || (normalizedSlug && slugAvailable));

  if (showCamera) {
    return (
      <Camera
        onCapture={handlePhotoCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text weight="Bold" style={styles.sectionTitle}>
          Baby Info
        </Text>

        <Pressable
          style={styles.photoButton}
          onPress={() => setShowCamera(true)}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>📷</Text>
              <Text style={styles.photoPlaceholderLabel}>Add Photo</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.inputGroup}>
          <Text weight="Medium" style={styles.label}>
            Baby's Name
          </Text>
          <Input
            value={babyName}
            onChangeText={setBabyName}
            placeholder="Baby's name"
            fullWidth
          />
        </View>

        <View style={styles.inputGroup}>
          <Text weight="Medium" style={styles.label}>
            Parent Name(s)
          </Text>
          <Input
            value={parentName1}
            onChangeText={setParentName1}
            placeholder="First parent name"
            fullWidth
          />
          <Input
            value={parentName2}
            onChangeText={setParentName2}
            placeholder="Second parent name (optional)"
            fullWidth
          />
        </View>
      </View>

      {!isEdit && (
        <View style={styles.section}>
          <Text weight="Bold" style={styles.sectionTitle}>
            Your Page URL
          </Text>
          <SlugInput
            value={slug}
            onChangeText={setSlug}
            onAvailabilityChange={handleSlugAvailabilityChange}
          />
        </View>
      )}

      <View style={styles.section}>
        <HouseRulesCheckboxes value={houseRules} onChange={setHouseRules} />
      </View>

      <View style={styles.submitContainer}>
        <Button
          primary
          label={submitLabel}
          onPress={handleSubmit}
          disabled={!isValid}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: BLACK,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  photoButton: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: BORDER_WIDTH,
    borderColor: GRAY,
    borderStyle: "dashed",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: LIGHT_GRAY,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  photoPlaceholderText: {
    fontSize: 32,
  },
  photoPlaceholderLabel: {
    fontSize: 12,
    color: GRAY,
  },
  submitContainer: {
    marginTop: 16,
  },
});
