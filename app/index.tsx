import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Dimensions, Platform, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { TypewriterText } from "@/components/TypewriterText";
import { BACKGROUND } from "@/lib/styles";
import { useUserContext } from "@/lib/auth";

const BALL_SIZE = 60;

// Hide header for splash screen
export const options = {
  headerShown: false,
};

export default function HomePage() {
  const { session, loading } = useUserContext();
  const router = useRouter();
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );
  const [ballPosition, setBallPosition] = useState({
    x: 0,
    y: 0,
  });

  // Update screen dimensions and ball position on mount and screen changes
  useEffect(() => {
    const { width, height } = Dimensions.get("window");
    setScreenDimensions({ width, height });
    setBallPosition({
      x: width / 2 - BALL_SIZE / 2,
      y: height / 2 - BALL_SIZE / 2,
    });

    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Redirect authenticated users on mobile to the app
  useEffect(() => {
    if (!loading && session && Platform.OS !== "web") {
      router.replace("/(app)/");
    }
  }, [session, loading, router]);

  function handleBallPress() {
    // Generate random position, ensuring ball stays within screen bounds
    const maxX = screenDimensions.width - BALL_SIZE;
    const maxY = screenDimensions.height - BALL_SIZE;

    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;

    setBallPosition({ x: newX, y: newY });
  }

  const splashIcon = require("@/assets/images/splash-icon.png");

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TypewriterText
          text="You Gotta See The Baby"
          speed={50}
          style={styles.typewriterText}
        />
        <Image
          source={splashIcon}
          style={styles.welcomeImage}
          contentFit="contain"
        />
      </View>

      <Pressable
        onPress={handleBallPress}
        style={[
          styles.ball,
          {
            left: ballPosition.x,
            top: ballPosition.y,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    gap: 40,
  },
  typewriterText: {
    fontSize: 28,
    textAlign: "center",
  },
  welcomeImage: {
    width: 200,
    height: 200,
  },
  ball: {
    position: "absolute",
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: "#FF6B6B",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
