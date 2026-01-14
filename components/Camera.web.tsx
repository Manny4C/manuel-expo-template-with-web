import { CameraCapturedPicture } from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { Button } from "@/components/Button";
import { useSquareSize } from "@/hooks/useSquareSize";
import {
  BLACK,
  BORDER_RADIUS,
  BORDER_STYLES,
  SECONDARY_TEXT_COLOR,
} from "@/lib/styles";
import { FontAwesome6 } from "@expo/vector-icons";

import { Text } from "./Text";

export function Camera({
  defaultFacing = "back",
  style,
  onCapture,
  header,
}: {
  defaultFacing?: "back" | "front";
  style?: StyleProp<ViewStyle>;
  onCapture?: (photo?: CameraCapturedPicture) => void;
  header?: React.ReactNode;
}) {
  const squareSize = useSquareSize(20);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleCancel() {
    router.back();
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const photo: CameraCapturedPicture = {
          uri: base64data,
          width: img.width,
          height: img.height,
          base64: base64data.split(",")[1],
        };
        onCapture?.(photo);
      };
      img.src = base64data;
    };
    reader.readAsDataURL(file);
  }

  function handleCapture() {
    // Trigger file input on web
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  return (
    <View style={[style, styles.container]}>
      <View>
        {header}
        <View
          style={[
            styles.camera,
            {
              justifyContent: "center",
              alignItems: "center",
              width: squareSize,
              height: squareSize,
            },
          ]}
        >
          <Text style={{ textAlign: "center" }}>
            Select a photo from your device
          </Text>
          {/* Hidden file input for web */}
          {/* @ts-ignore - HTML input element for web */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.cancelButton}>
          <TouchableOpacity onPress={handleCancel}>
            <FontAwesome6
              name="chevron-left"
              size={24}
              color={SECONDARY_TEXT_COLOR}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleCapture}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 120,
  },
  camera: {
    ...BORDER_STYLES,
    overflow: "hidden",
  },
  buttonContainer: {
    width: "100%",
    height: 80,
    paddingHorizontal: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cancelButton: {
    position: "absolute",
    left: 40 + 24 / 4,
  },
  flipButton: {
    position: "absolute",
    right: 40,
  },
  cameraButton: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS,
    borderColor: BLACK,
    borderWidth: 4,
    position: "absolute",
    left: "50%",
  },
  text: {
    fontSize: 24,
    color: "white",
  },
});
