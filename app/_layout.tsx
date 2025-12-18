import { SplashScreen, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { UpdateLoadingModal } from "@/components/UpdateLoadingModal";
import { SessionProvider } from "@/lib/auth";
import { useRefresh } from "@/lib/expoUpdates";
import { usePushNotifications } from "@/lib/notifications";

// Initialize SplashScreen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { pushToken } = usePushNotifications();
  const { isAppUpdating } = useRefresh();

  return (
    <SessionProvider pushToken={pushToken}>
      <GestureHandlerRootView>
        <Stack
          screenOptions={{
            headerTitle: "APP_NAME",
            // headerShown: false,
          }}
        />
        <UpdateLoadingModal show={isAppUpdating} />
      </GestureHandlerRootView>
    </SessionProvider>
  );
}
