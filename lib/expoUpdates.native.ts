import {
  checkForUpdateAsync,
  fetchUpdateAsync,
  reloadAsync,
} from "expo-updates";
import { useCallback, useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

const EXPO_UPDATE_KEY = "expoUpdateTime";
const LAST_UPDATE_NAME = "REACTS";

checkForAppUpdate();

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** expo-updates. */
export async function checkForAppUpdate() {
  if (__DEV__) {
    return;
  }

  try {
    // Prevent crash on Android after reload https://github.com/expo/expo/issues/21347
    await sleep(3000);
    const update = await checkForUpdateAsync();

    if (update.isAvailable) {
      await AsyncStorage.setItem(EXPO_UPDATE_KEY, LAST_UPDATE_NAME);
      await fetchUpdateAsync();
      await reloadAsync();
    }
  } catch (error) {
    console.error(`Error fetching Expo update: ${error}`);
  }
}

export function useLastUpdate(isUpdating: boolean) {
  const [lastUpdate, setLastUpdate] = useState<string>("UNKNOWN");

  useEffect(
    function () {
      AsyncStorage.getItem(EXPO_UPDATE_KEY).then((oldUpdate) => {
        if (!oldUpdate) {
          return;
        }
        setLastUpdate(LAST_UPDATE_NAME);
      });
    },
    [isUpdating],
  );

  return lastUpdate;
}

export function useRefresh() {
  const [isAppUpdating, setIsAppUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [forceRefresh, setRefreshKey] = useState(0);

  const refresh = useCallback(async (skipUpdateKey = false) => {
    setIsRefreshing(true);
    let isUpdating = false;

    if (!__DEV__) {
      try {
        // Prevent crash on Android after reload https://github.com/expo/expo/issues/21347
        await sleep(3000);
        const update = await checkForUpdateAsync();

        isUpdating = update.isAvailable;
        if (update.isAvailable) {
          setIsAppUpdating(true);
          await AsyncStorage.setItem(EXPO_UPDATE_KEY, LAST_UPDATE_NAME);
          await fetchUpdateAsync();
          await reloadAsync();
        }
      } catch (error) {
        console.error(`Error fetching Expo update: ${error}`);
      }
    }

    if (isUpdating) {
      setIsRefreshing(false);
      setIsAppUpdating(false);
    } else {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }

    if (!skipUpdateKey) {
      setRefreshKey((key) => key + 1);
    }
  }, []);

  useEffect(() => {
    refresh(true);
  }, []);

  return { refresh, isRefreshing, forceRefresh, isAppUpdating };
}
