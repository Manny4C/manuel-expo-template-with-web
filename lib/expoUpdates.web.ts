import { useCallback, useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

const EXPO_UPDATE_KEY = "expoUpdateTime";
const LAST_UPDATE_NAME = "REACTS";

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** expo-updates - web version (no-op) */
export async function checkForAppUpdate() {
  // Web apps don't use expo-updates in the same way
  // Updates are handled through normal web deployments
  console.log("Web: App updates are handled through normal web deployments");
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

    // On web, we don't check for expo-updates
    // Just simulate a refresh
    setTimeout(() => {
      setIsRefreshing(false);
      setIsAppUpdating(false);
    }, 1000);

    if (!skipUpdateKey) {
      setRefreshKey((key) => key + 1);
    }
  }, []);

  useEffect(() => {
    refresh(true);
  }, []);

  return { refresh, isRefreshing, forceRefresh, isAppUpdating };
}
