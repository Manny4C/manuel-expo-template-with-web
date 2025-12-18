import { SplashScreen } from "expo-router";
import React, { useEffect } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { LoginForm } from "@/components/Login/LoginForm";
import { OnboardingSection } from "@/components/Login/OnboardingSection";
import { SignUpForm } from "@/components/Login/SignUpForm";
import { useLoginOrSignUp } from "@/hooks/useLoginOrSignUp";
import { useUserContext } from "@/lib/auth";
import { WHITE } from "@/lib/styles";

export default function LoginPage() {
  const { error, loading } = useUserContext();

  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    handleSignIn,
    handleSignUp,
    handleSwitchToSignIn,
    handleSwitchToSignUp,
    handleOnboardingComplete,
    pageState,
  } = useLoginOrSignUp();

  useEffect(() => {
    if (!loading || error) {
      SplashScreen.hideAsync();
    }
  }, [loading, error]);

  if (pageState === "about") {
    return (
      <View style={{ flex: 1, backgroundColor: WHITE }}>
        <OnboardingSection onComplete={handleOnboardingComplete} />
      </View>
    );
  }

  if (pageState === "setup") {
    return (
      <View style={{ flex: 1, backgroundColor: WHITE }}>
        <SignUpForm
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleSignUp={handleSignUp}
          handleSwitchToSignIn={handleSwitchToSignIn}
          loading={loading}
          error={error}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleSignIn={handleSignIn}
            handleSwitchToSignUp={handleSwitchToSignUp}
            loading={loading}
            error={error}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

export const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingHorizontal: 30,
    paddingBottom: 30,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    backgroundColor: WHITE,
  },
});
