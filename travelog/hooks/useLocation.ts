import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export type LocationCoords = {
  latitude: number;
  longitude: number;
};

export function useLocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [loading, setLoading] = useState(false);

  const requestLocation = async (): Promise<LocationCoords | null> => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status === 'granted' ? 'granted' : 'denied');

    if (status !== 'granted') {
      setLoading(false);
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    setLocation(coords);
    setLoading(false);
    return coords;
  };

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      setPermissionStatus(status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined');
    });
  }, []);

  return { location, permissionStatus, loading, requestLocation };
}
