import { useState } from "react";
import {
  BlurEvent,
  FocusEvent,
  StyleSheet,
  TextInput,
  TextInputProps,
} from "react-native";

import { BORDER_COLOR, BORDER_WIDTH, GRAY, TEXT_COLOR } from "@/lib/styles";

interface InputProps extends TextInputProps {
  innerRef?: React.RefObject<TextInput | null>;
  fullWidth?: boolean;
  isFocused?: boolean;
}

export function Input({
  onFocus,
  onBlur,
  fullWidth,
  innerRef,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  function handleFocus(e: FocusEvent) {
    setIsFocused(true);
    onFocus?.(e);
  }

  function handleBlur(e: BlurEvent) {
    setIsFocused(false);
    onBlur?.(e);
  }

  return (
    <TextInput
      ref={innerRef}
      style={[
        styles.input,
        isFocused && styles.focused,
        fullWidth ? { width: "100%" } : { flex: 1 },
      ]}
      {...props}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderColor: GRAY,
    borderRadius: 10,
    borderWidth: BORDER_WIDTH,
    color: TEXT_COLOR,
    fontSize: 16,
    padding: 10,
  },
  focused: {
    borderColor: BORDER_COLOR,
  },
});
