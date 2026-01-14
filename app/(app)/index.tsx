import { StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to Manuel's Template!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    textAlign: "center",
  },
});
