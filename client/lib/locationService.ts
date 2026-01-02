import * as Location from "expo-location";

type Coords = Location.LocationObjectCoords;

let watcher: Location.LocationSubscription | null = null;
let lastCoords: Coords | null = null;

export type LocationOptions = {
  timeInterval?: number;
  distanceInterval?: number;
  accuracy?: Location.LocationAccuracy;
};

export async function requestForegroundPermission(): Promise<boolean> {
  const { status, canAskAgain } =
    await Location.getForegroundPermissionsAsync();
  if (status === "granted") return true;

  if (!canAskAgain) return false;

  const result = await Location.requestForegroundPermissionsAsync();
  return result.status === "granted";
}

export async function startLocationUpdates(
  onUpdate: (coords: Coords) => void,
  options?: LocationOptions,
): Promise<boolean> {
  const granted = await requestForegroundPermission();
  if (!granted) return false;

  await stopLocationUpdates();

  try {
    watcher = await Location.watchPositionAsync(
      {
        accuracy: options?.accuracy ?? Location.Accuracy.Balanced,
        timeInterval: options?.timeInterval ?? 12000,
        distanceInterval: options?.distanceInterval ?? 30,
      },
      (location) => {
        lastCoords = location.coords;
        onUpdate(location.coords);
      },
    );
    return true;
  } catch (error) {
    await stopLocationUpdates();
    return false;
  }
}

export async function stopLocationUpdates() {
  if (watcher) {
    watcher.remove();
    watcher = null;
  }
}

export function getLastCoords(): Coords | null {
  return lastCoords;
}

export async function getLastKnownOrCurrent(): Promise<Coords | null> {
  const lastKnown = await Location.getLastKnownPositionAsync();
  if (lastKnown?.coords) return lastKnown.coords;

  try {
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return current.coords;
  } catch {
    return null;
  }
}
