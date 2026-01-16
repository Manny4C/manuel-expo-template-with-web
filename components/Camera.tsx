// This file serves as the TypeScript definition entry point.
// The actual implementation is in Camera.native.tsx (iOS/Android) and Camera.web.tsx (Web).
// Metro bundler will resolve to the correct platform-specific file at runtime.

import { StyleProp, ViewStyle } from "react-native";

export interface CameraProps {
  defaultFacing?: "front" | "back";
  style?: StyleProp<ViewStyle>;
  onCapture?: (uri: string) => void;
  onCancel?: () => void;
}

export function Camera(props: CameraProps): JSX.Element;
