import { DirectionsService } from '@react-google-maps/api';

interface LatLng {
  lat: number;
  lng: number;
}

// Function to snap a position to the nearest street
export const snapToStreet = async (
  position: LatLng,
  directionsService: google.maps.DirectionsService
): Promise<LatLng> => {
  try {
    const result = await directionsService.route({
      origin: position,
      destination: position,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    if (result.routes.length > 0 && result.routes[0].legs.length > 0) {
      const snappedPoint = result.routes[0].legs[0].start_location;
      return {
        lat: snappedPoint.lat(),
        lng: snappedPoint.lng()
      };
    }
    return position;
  } catch (error) {
    console.error('Error snapping to street:', error);
    return position;
  }
};

// Function to check if a position is on a street
export const isOnStreet = async (
  position: LatLng,
  directionsService: google.maps.DirectionsService
): Promise<boolean> => {
  try {
    const result = await directionsService.route({
      origin: position,
      destination: position,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    return result.routes.length > 0;
  } catch (error) {
    console.error('Error checking if on street:', error);
    return false;
  }
};

// Function to get valid movement positions
export const getValidMovementPositions = async (
  currentPosition: LatLng,
  directionsService: google.maps.DirectionsService
): Promise<LatLng[]> => {
  try {
    // Create a small grid of potential positions around the current position
    const gridSize = 0.0001; // approximately 10 meters
    const positions: LatLng[] = [];

    // Check positions in all 8 directions
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue; // Skip current position

        const testPosition = {
          lat: currentPosition.lat + i * gridSize,
          lng: currentPosition.lng + j * gridSize
        };

        // Check if this position is on a street
        const result = await directionsService.route({
          origin: testPosition,
          destination: testPosition,
          travelMode: google.maps.TravelMode.DRIVING,
        });

        if (result.routes.length > 0) {
          const snappedPoint = result.routes[0].legs[0].start_location;
          positions.push({
            lat: snappedPoint.lat(),
            lng: snappedPoint.lng()
          });
        }
      }
    }

    return positions;
  } catch (error) {
    console.error('Error getting valid movement positions:', error);
    return [];
  }
}; 