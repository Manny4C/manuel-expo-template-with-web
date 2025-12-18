import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body?: string,
) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    badge: 1,
  };

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  return response.json();
}

export function handleRegistrationError(errorMessage: string) {
  // alert(errorMessage);
  console.error(errorMessage);
  throw new Error(errorMessage);
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      handleRegistrationError("Permission not granted!");
      return;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found!");
    }

    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      return pushTokenString;
    } catch (error) {
      handleRegistrationError(`Error getting push token: ${error}`);
    }
  }
}

export function usePushNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setPushToken(token ?? null);
    });

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // Increment the badge count when receiving a notification
  useEffect(() => {
    if (notification) {
      incrementBadgeCount();
    }
  }, [notification]);

  // Clear the badge count if app is active
  useEffect(() => {
    if (AppState.currentState === "active") {
      clearBadgeCount();
    }
  }, []);

  return { pushToken, notification };
}

export async function setBadgeCount(count: number) {
  try {
    // Set the badge count both locally and on the device
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error("Error setting badge count:", error);
  }
}

// Helper to increment badge count
export async function incrementBadgeCount() {
  // Only increment badge if app is not active (in background or inactive)
  if (AppState.currentState !== "active") {
    try {
      const currentBadgeCount = await Notifications.getBadgeCountAsync();
      await setBadgeCount(currentBadgeCount + 1);
    } catch (error) {
      console.error("Error incrementing badge count:", error);
    }
  } else {
    // Clear badge count if app is active
    await setBadgeCount(0);
  }
}

// Helper to clear badge count
export async function clearBadgeCount() {
  await setBadgeCount(0);
}
