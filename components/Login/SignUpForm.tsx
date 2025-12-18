import { CameraCapturedPicture } from "expo-camera";
import { AuthError } from "firebase/auth";
import React, { useRef } from "react";
import { TextInput, View } from "react-native";

import { Button } from "@/components/Button";
import { Text } from "@/components/Text";

import { Input } from "../Input";
import { styles } from "./styles";

export function SignUpForm({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  handleSignUp,
  handleSwitchToSignIn,
  loading,
  error,
}: {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleSignUp: (photo?: CameraCapturedPicture) => void;
  handleSwitchToSignIn: () => void;
  loading: boolean;
  error: AuthError | null;
}) {
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const canSignUp = name && email && password && password.length >= 6;

  return (
    <>
      <Text weight="Bold" style={styles.header}>
        sign up
      </Text>
      <Input
        value={name}
        onChangeText={setName}
        placeholder="name"
        autoComplete="given-name"
        inputMode="text"
        keyboardType="default"
        textContentType="givenName"
        fullWidth
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <Input
        innerRef={emailRef}
        value={email}
        onChangeText={setEmail}
        placeholder="email"
        autoComplete="email"
        inputMode="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoCapitalize="none"
        fullWidth
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <Input
        innerRef={passwordRef}
        value={password}
        onChangeText={setPassword}
        placeholder="password"
        autoComplete="password"
        inputMode="text"
        keyboardType="default"
        textContentType="password"
        secureTextEntry
        passwordRules="minlength:6"
        autoCapitalize="none"
        onSubmitEditing={() => handleSignUp()}
        fullWidth
      />
      {error && error.code === "auth/weak-password" && (
        <Text style={{ color: "red" }}>
          Password needs to be at least 6 characters.
        </Text>
      )}
      {error && error.code === "auth/email-already-in-use" && (
        <Text style={{ color: "red" }}>This email is already in use.</Text>
      )}
      {error && error.code === "auth/invalid-referral-code" && (
        <Text style={{ color: "red" }}>Referring friend code is invalid.</Text>
      )}

      <View style={{ flexGrow: 1 }} />

      <Button
        style={styles.button}
        onPress={handleSwitchToSignIn}
        content={
          <Text style={styles.secondaryButton}>i already have an account</Text>
        }
      />
      <Button
        style={[styles.button, !canSignUp && styles.disabled]}
        onPress={handleSignUp}
        label="Sign up"
        primary
        loading={loading}
      />
    </>
  );
}
