import { AuthError } from "firebase/auth";
import React from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Text } from "@/components/Text";

import { Input } from "../Input";
import { styles } from "./styles";

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  handleSignIn,
  handleSwitchToSignUp,
  loading,
  error,
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleSignIn: () => void;
  handleSwitchToSignUp: () => void;
  loading: boolean;
  error: AuthError | null;
}) {
  const canSignIn = email && password;

  return (
    <>
      <Text weight="Bold" style={styles.header}>
        sign in
      </Text>
      <Input
        value={email}
        onChangeText={setEmail}
        placeholder="email"
        autoComplete="email"
        inputMode="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoCapitalize="none"
        fullWidth
      />
      <Input
        value={password}
        onChangeText={setPassword}
        placeholder="password"
        autoComplete="current-password"
        inputMode="text"
        keyboardType="default"
        textContentType="password"
        autoCapitalize="none"
        secureTextEntry
        onSubmitEditing={handleSignIn}
        fullWidth
      />
      {error && error.code == "auth/invalid-credential" && (
        <Text style={{ color: "red" }}>Password is invalid.</Text>
      )}
      <View style={{ flexGrow: 1 }} />

      <Button
        style={styles.button}
        onPress={handleSwitchToSignUp}
        content={
          <Text style={styles.secondaryButton}>
            don&apos;t have an account? sign up
          </Text>
        }
      />
      <Button
        style={[styles.button, !canSignIn && styles.disabled]}
        onPress={handleSignIn}
        label="Sign in"
        primary
        loading={loading}
      />
    </>
  );
}
