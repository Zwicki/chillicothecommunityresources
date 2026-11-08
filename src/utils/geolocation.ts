/**
 * Geolocation and Haversine distance utilities
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Default downtown Chillicothe, Ohio coordinates
export const CHILLICOTHE_COORDINATES: Coordinates = {
  latitude: 39.3331,
  longitude: -82.9824
};

/**
 * Calculates great-circle distance between two points on a sphere using the Haversine formula.
 * @returns Distance in statute miles
 */
export function calculateDistanceInMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Formats distance in miles nicely (e.g., "0.4 mi", "2.1 mi", "14 mi")
 */
export function formatDistance(miles: number | undefined | null): string {
  if (miles === undefined || miles === null || isNaN(miles)) return '';
  if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  }
  return `${Math.round(miles)} mi`;
}

/**
 * Requests the user's current GPS position using browser navigator.geolocation
 */
export function getUserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}
