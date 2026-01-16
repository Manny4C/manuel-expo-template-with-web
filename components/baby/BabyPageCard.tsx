import { View, StyleSheet, Pressable, Image } from "react-native";
import { useRouter, Href } from "expo-router";

import { Text } from "@/components/Text";
import { BabyPageDocument } from "@/models/babyPage";
import {
  BLACK,
  LIGHT_GRAY,
  GRAY,
  BORDER_WIDTH,
  BORDER_RADIUS,
} from "@/lib/styles";
import { getBabyPageUrl } from "@/utils/slug";

interface BabyPageCardProps {
  page: BabyPageDocument;
}

export function BabyPageCard({ page }: BabyPageCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/baby/${page.slug}` as Href);
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.photoContainer}>
        {page.photoUri ? (
          <Image source={{ uri: page.photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>👶</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text weight="Bold" style={styles.babyName}>
          {page.babyName}
        </Text>
        <Text style={styles.parentNames}>{page.parentNames.join(" & ")}</Text>
        <Text style={styles.url}>{getBabyPageUrl(page.slug)}</Text>
      </View>

      <View style={styles.arrow}>
        <Text style={styles.arrowText}>→</Text>
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
    borderRadius: BORDER_RADIUS / 2,
    borderWidth: BORDER_WIDTH,
    borderColor: GRAY,
    gap: 16,
  },
  photoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: GRAY,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderText: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  babyName: {
    fontSize: 18,
    color: BLACK,
  },
  parentNames: {
    fontSize: 14,
    color: GRAY,
  },
  url: {
    fontSize: 12,
    color: GRAY,
  },
  arrow: {
    padding: 8,
  },
  arrowText: {
    fontSize: 20,
    color: BLACK,
  },
});
