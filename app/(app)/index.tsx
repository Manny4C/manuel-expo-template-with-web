import * as WebBrowser from "expo-web-browser";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/Button";
import { Text } from "@/components/Text";

const WEBSITE_URL = "https://yougottaseethebaby.com";

export default function HomePage() {
  async function handleOpenWebsite() {
    await WebBrowser.openBrowserAsync(WEBSITE_URL);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.mainText} weight="Bold">
        You got to see the baby!
      </Text>
      <Button
        label="Visit yougottaseethebaby.com"
        onPress={handleOpenWebsite}
        primary
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 32,
  },
  mainText: {
    fontSize: 32,
    textAlign: "center",
    lineHeight: 40,
  },
  button: {
    minWidth: 200,
  },
});
