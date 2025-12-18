import { Image } from "expo-image";
import { useEffect } from "react";
import { Modal, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { BLACK, WHITE } from "@/lib/styles";

import { Text } from "./Text";

export function UpdateLoadingModal({ show }: { show: boolean }) {
  const squiggleFill = require("@/assets/squiggle-fill.svg");

  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360 * 1000, {
        // Large value ensures no reset
        duration: 15000 * 1000, // Keep duration proportional
        easing: Easing.linear,
      }),
      -1, // Infinite loop
      false,
    );
  }, []);
  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (!show) return null;

  return (
    <Modal animationType="fade" visible={show} transparent={true}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: WHITE,
          zIndex: 9999,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View
          style={[
            { position: "absolute", width: 160, height: 160 },
            rotationStyle,
          ]}
        >
          <Image
            style={{ position: "absolute", width: 160, height: 160 }}
            source={squiggleFill}
          />
        </Animated.View>
        <Text
          style={{
            color: BLACK,
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          updating...
        </Text>
      </View>
    </Modal>
  );
}
