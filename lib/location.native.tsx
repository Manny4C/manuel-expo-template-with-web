import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";

export interface ILocation extends Location.LocationObject {
  address?: Location.LocationGeocodedAddress[];
}

export const LocationContext = React.createContext<ILocation | null>(null);

export function useLocationContext() {
  const location = React.useContext(LocationContext);
  return location;
}

/**
 * Get the distance between two coordinates in meters
 * @param coords1
 * @param coords2
 * @returns distance in meters
 */
export function getHaversineDistance(
  coords1?: { latitude: number; longitude: number },
  coords2?: { latitude: number; longitude: number },
) {
  if (!coords1 || !coords2) return 99;

  const toRad = (x: number) => (x * Math.PI) / 180;

  const lat1 = coords1.latitude;
  const lon1 = coords1.longitude;
  const lat2 = coords2.latitude;
  const lon2 = coords2.longitude;

  const R = 6371000; // Radius of the Earth in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

enum PermissionInfoStatus {
  NOT_ASKED = "NOT_ASKED",
  ASKED = "ASKED",
  ACKNOWLEDGED = "ACKNOWLEDGED",
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [infoStatus, setInfoStatus] = useState<PermissionInfoStatus>(
    PermissionInfoStatus.NOT_ASKED,
  );
  const [location, setLocation] = useState<ILocation | null>(null);

  async function handleLocationChange(newLocation: Location.LocationObject) {
    const coords = newLocation.coords;
    if (getHaversineDistance(coords, location?.coords) < 20) return;

    // const address = await Location.reverseGeocodeAsync(coords);
    setLocation({ ...newLocation });
  }

  async function requestLocationPermission() {
    // Wait for use to tell the user what info will be used for
    if (infoStatus === PermissionInfoStatus.ACKNOWLEDGED) return;

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }

    // Set up location watching with accuracy and distance filter
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 20, // Only update if moved 20 meters
      },
      handleLocationChange,
    );
  }

  useEffect(() => {
    (async () => {
      const permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.UNDETERMINED) {
        setInfoStatus(PermissionInfoStatus.ACKNOWLEDGED);
        return;
      }

      if (infoStatus !== PermissionInfoStatus.NOT_ASKED) return;

      setInfoStatus(PermissionInfoStatus.ASKED);
      Alert.alert(
        // TODO: Update the text
        "chillin will ask to access your location",
        "this helps us place your chills on a map and sort them by distance. this is not necessary.",
        [
          {
            text: "Continue",
            onPress: () => {
              setInfoStatus(PermissionInfoStatus.ASKED);
              requestLocationPermission();
            },
          },
        ],
      );
    })();
  }, []);

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
}
