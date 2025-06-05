import { DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

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
    // Create a small offset to force the directions service to find a route
    const offset = 0.0001; // approximately 10 meters
    const destination = {
      lat: position.lat + offset,
      lng: position.lng + offset
    };

    const result = await directionsService.route({
      origin: position,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    });

    // Get the first point of the route
    const route = result.routes[0];
    if (route && route.legs[0] && route.legs[0].steps[0]) {
      const path = route.legs[0].steps[0].path;
      if (path && path.length > 0) {
        return {
          lat: path[0].lat(),
          lng: path[0].lng()
        };
      }
    }
  } catch (error) {
    console.error('Error snapping to street:', error);
  }
  
  // Return original position if snapping fails
  return position;
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
      travelMode: google.maps.TravelMode.DRIVING
    });

    return result.routes.length > 0;
  } catch (error) {
    return false;
  }
};

// Function to get valid movement positions
export const getValidMovementPositions = async (
  currentPosition: LatLng,
  directionsService: google.maps.DirectionsService
): Promise<LatLng[]> => {
  const directions = [
    { lat: 0.0001, lng: 0 },      // North
    { lat: 0.0001, lng: 0.0001 }, // Northeast
    { lat: 0, lng: 0.0001 },      // East
    { lat: -0.0001, lng: 0.0001 },// Southeast
    { lat: -0.0001, lng: 0 },     // South
    { lat: -0.0001, lng: -0.0001 },// Southwest
    { lat: 0, lng: -0.0001 },     // West
    { lat: 0.0001, lng: -0.0001 } // Northwest
  ];

  const validPositions: LatLng[] = [];

  for (const direction of directions) {
    const newPosition = {
      lat: currentPosition.lat + direction.lat,
      lng: currentPosition.lng + direction.lng
    };

    if (await isOnStreet(newPosition, directionsService)) {
      validPositions.push(newPosition);
    }
  }

  return validPositions;
}; 