import { Text as RNText, StyleProp, TextStyle } from "react-native";

export function Text({
  children,
  weight = "Regular",
  style,
  numberOfLines,
  onPress,
}: {
  children: React.ReactNode | undefined;
  weight?: "Bold" | "Medium" | "Regular";
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  onPress?: () => void;
}) {
  return (
    <RNText
      style={[{ fontFamily: `BricolageGrotesque-${weight}` }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </RNText>
  );
}
