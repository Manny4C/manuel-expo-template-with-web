import {
  CameraCapturedPicture,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { Button } from "@/components/Button";
import { useSquareSize } from "@/hooks/useSquareSize";
import { useLocationContext } from "@/lib/location";
import {
  BLACK,
  BORDER_RADIUS,
  BORDER_STYLES,
  SECONDARY_TEXT_COLOR,
} from "@/lib/styles";
import { FontAwesome6 } from "@expo/vector-icons";

import { Text } from "./Text";

enum PermissionInfoStatus {
  NOT_ASKED = "NOT_ASKED",
  ASKED = "ASKED",
  ACKNOWLEDGED = "ACKNOWLEDGED",
}

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
  const location = useLocationContext();
  const { permission } = usePermissions();
  const squareSize = useSquareSize(20);

  const [facing, setFacing] = useState<"back" | "front">(defaultFacing);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
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
              we need camera permissions to take a photo
            </Text>
          </View>
        </View>

        <Button
          style={{ flexGrow: 0 }}
          primary
          onPress={() => handleCapture(true)}
          label="skip"
        />
      </View>
    );
  }

  function handleCancel() {
    router.back();
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function handleCapture(fakeCapture?: boolean) {
    // Allow us to pass this step when testing on ios simulator
    if ((!isCameraReady && __DEV__) || fakeCapture) {
      onCapture?.({} as CameraCapturedPicture);
    }

    if (!isCameraReady) return;

    const photo = await cameraRef.current?.takePictureAsync({
      exif: true,
      base64: false,
      additionalExif: {
        GPSLatitude: location?.coords.latitude,
        GPSLongitude: location?.coords.longitude,
      },
    });

    // Save to library on ios
    if (photo?.uri && Platform.OS !== "web") {
      try {
        MediaLibrary.saveToLibraryAsync(photo.uri);
      } catch (e) {
        console.log(e);
      }
    }

    onCapture?.(photo);
  }

  return (
    <View style={[style, styles.container]}>
      <View>
        {header}
        <View style={styles.camera}>
          <CameraView
            ref={cameraRef}
            style={[{ width: squareSize, height: squareSize }]}
            facing={facing}
            onCameraReady={() => setIsCameraReady(true)}
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
          onPress={() => handleCapture()}
        />

        <TouchableOpacity
          style={styles.flipButton}
          onPress={toggleCameraFacing}
        >
          <FontAwesome6
            name="arrows-rotate"
            size={24}
            color={SECONDARY_TEXT_COLOR}
          />
        </TouchableOpacity>
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

function usePermissions() {
  const [permission, requestPermission] = useCameraPermissions();
  const [infoStatus, setInfoStatus] = useState<PermissionInfoStatus>(
    PermissionInfoStatus.NOT_ASKED,
  );

  useEffect(() => {
    (async () => {
      // While permissions are loading, don't show anything
      if (!permission) return;

      // If the user has already granted permission, don't show anything
      if (permission.granted || permission.status !== "undetermined") {
        setInfoStatus(PermissionInfoStatus.ACKNOWLEDGED);
        return;
      }

      // If the user has already been asked for permission, don't show another alert
      if (infoStatus !== PermissionInfoStatus.NOT_ASKED) return;

      setInfoStatus(PermissionInfoStatus.ASKED);
      Alert.alert(
        "chillin will ask for camera access",
        "camera access is necessary to share photos of your chills",
        [
          {
            text: "Continue",
            onPress: () => {
              setInfoStatus(PermissionInfoStatus.ASKED);
              requestPermission();
            },
          },
        ],
      );
    })();
  }, [permission]);

  return { permission, requestPermission };
}
