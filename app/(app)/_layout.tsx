// WORKAROUND: This import HAS to be here or the iOS build will immediately crash. Do NOT remove.
// https://www.reddit.com/r/reactnative/comments/17pfxsk/comment/kwelpnb/
import "react-native-gesture-handler";

import * as Linking from "expo-linking";
import { Redirect, SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native";

import { FirebaseDataProvider, useFirebaseData } from "@/hooks/useFirebaseData";
import { useUserContext as useSession } from "@/lib/auth";
import { LocationProvider } from "@/lib/location";

export default function AppLayout() {
  const { session, loading, authUser, logOut } = useSession();
  const myId = authUser?.uid || "";
  const { isLoaded: isDataLoaded, ...data } = useFirebaseData(myId);
  const url = Linking.useLinkingURL();

  useEffect(() => {
    if (isDataLoaded) {
      SplashScreen.hideAsync();

      if (session && data.myUser?.id !== myId) {
        logOut();
      }
    }
  }, [isDataLoaded]);

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (loading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    if (url) {
    }

    return <Redirect href="/login" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <FirebaseDataProvider data={{ isLoaded: isDataLoaded, ...data }}>
      <LocationProvider>
        <Stack
          screenOptions={{
            headerTitle: "Stampede",
            headerBackVisible: true,
            headerBackButtonDisplayMode: "minimal",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="profile" options={{ presentation: "modal" }} />
        </Stack>
      </LocationProvider>
    </FirebaseDataProvider>
  );
}
