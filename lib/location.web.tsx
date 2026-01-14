import React, { useEffect, useState } from "react";

export interface ILocation {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
  address?: any[];
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

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<ILocation | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: ILocation = {
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy || 0,
              altitudeAccuracy: position.coords.altitudeAccuracy || null,
              heading: position.coords.heading || null,
              speed: position.coords.speed || null,
            },
            timestamp: position.timestamp,
          };

          // Only update if moved more than 20 meters
          if (getHaversineDistance(newLocation.coords, location?.coords) >= 20) {
            setLocation(newLocation);
          }
        },
        (error) => {
          console.log("Web: Location permission denied or error:", error);
        },
        {
          enableHighAccuracy: false,
          maximumAge: 10000,
          timeout: 5000,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [location]);

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
}
