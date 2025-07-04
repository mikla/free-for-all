// Utility functions for street validation and snapping

// Snap a position to the nearest street using Google Maps Roads API
export const snapToStreet = async (
  position: { lat: number; lng: number },
  directionsService: google.maps.DirectionsService
): Promise<{ lat: number; lng: number }> => {
  try {
    // Use Directions API to snap to nearest road
    const result = await directionsService.route({
      origin: position,
      destination: {
        lat: position.lat + 0.00001, // Very small offset to create a route
        lng: position.lng + 0.00001
      },
      travelMode: google.maps.TravelMode.DRIVING,
      avoidHighways: false,
      avoidTolls: false
    });

    if (result.routes.length > 0 && result.routes[0].legs.length > 0) {
      const snappedPoint = result.routes[0].legs[0].start_location;
      return {
        lat: snappedPoint.lat(),
        lng: snappedPoint.lng()
      };
    }
  } catch (error) {
    console.log('Could not snap to street, using original position:', error);
  }
  
  // If snapping fails, return original position
  return position;
};

// Check if a position is on or very close to a street
export const isOnStreet = async (
  position: { lat: number; lng: number },
  directionsService: google.maps.DirectionsService
): Promise<boolean> => {
  try {
    // Try to create a route from this position
    const result = await directionsService.route({
      origin: position,
      destination: {
        lat: position.lat + 0.0001, // Small offset to create a minimal route
        lng: position.lng + 0.0001
      },
      travelMode: google.maps.TravelMode.DRIVING,
      avoidHighways: false,
      avoidTolls: false
    });

    if (result.routes.length > 0 && result.routes[0].legs.length > 0) {
      const snappedPoint = result.routes[0].legs[0].start_location;
      const distance = calculateDistance(
        position,
        { lat: snappedPoint.lat(), lng: snappedPoint.lng() }
      );
      
      // If the snapped point is within 25 meters of the original position,
      // consider it on a street
      return distance <= 25;
    }
    
    return false;
  } catch (error) {
    console.log('Street validation failed, allowing movement:', error);
    // If validation fails (e.g., API error), allow movement to avoid blocking player
    return true;
  }
};

// Calculate distance between two coordinates (in meters)
function calculateDistance(
  pos1: { lat: number; lng: number },
  pos2: { lat: number; lng: number }
): number {
  const R = 6371000; // Earth's radius in meters
  const lat1Rad = pos1.lat * Math.PI / 180;
  const lat2Rad = pos2.lat * Math.PI / 180;
  const deltaLatRad = (pos2.lat - pos1.lat) * Math.PI / 180;
  const deltaLngRad = (pos2.lng - pos1.lng) * Math.PI / 180;

  const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Function to get valid movement positions - enhanced version
export const getValidMovementPositions = async (
  currentPosition: { lat: number; lng: number },
  directionsService: google.maps.DirectionsService,
  searchRadius: number = 0.0001 // approximately 10 meters
): Promise<{ lat: number; lng: number }[]> => {
  try {
    const validPositions: { lat: number; lng: number }[] = [];
    
    // Check 8 directions around current position
    const directions = [
      { lat: searchRadius, lng: 0 },     // North
      { lat: searchRadius, lng: searchRadius },  // Northeast
      { lat: 0, lng: searchRadius },     // East
      { lat: -searchRadius, lng: searchRadius }, // Southeast
      { lat: -searchRadius, lng: 0 },    // South
      { lat: -searchRadius, lng: -searchRadius }, // Southwest
      { lat: 0, lng: -searchRadius },    // West
      { lat: searchRadius, lng: -searchRadius }   // Northwest
    ];

    // Test each direction
    for (const direction of directions) {
      const testPosition = {
        lat: currentPosition.lat + direction.lat,
        lng: currentPosition.lng + direction.lng
      };

      // Check if this position is on a street
      if (await isOnStreet(testPosition, directionsService)) {
        // Snap to the actual street position
        const snappedPosition = await snapToStreet(testPosition, directionsService);
        validPositions.push(snappedPosition);
      }
    }

    return validPositions;
  } catch (error) {
    console.error('Error getting valid movement positions:', error);
    return [];
  }
};

// Enhanced movement validation function
export const validateMovement = async (
  _fromPosition: { lat: number; lng: number },
  toPosition: { lat: number; lng: number },
  directionsService: google.maps.DirectionsService
): Promise<{ isValid: boolean; snappedPosition?: { lat: number; lng: number } }> => {
  try {
    // Check if the destination is on a street
    const isValidDestination = await isOnStreet(toPosition, directionsService);
    
    if (!isValidDestination) {
      return { isValid: false };
    }

    // Snap to the nearest street point
    const snappedPosition = await snapToStreet(toPosition, directionsService);
    
    return { isValid: true, snappedPosition };
  } catch (error) {
    console.error('Movement validation error:', error);
    // On error, allow movement to avoid blocking the player
    return { isValid: true, snappedPosition: toPosition };
  }
};

// Find the nearest street location for spawn points
export const findNearestStreet = async (
  position: { lat: number; lng: number },
  directionsService: google.maps.DirectionsService,
  maxRadius: number = 1000 // Search within 1km radius
): Promise<{ lat: number; lng: number }> => {
  console.log('Finding nearest street for position:', position);
  
  // First try the position itself
  if (await isOnStreet(position, directionsService)) {
    console.log('Position is already on street');
    return position;
  }

  // Try expanding circle search
  const radiusSteps = [50, 100, 200, 500, 1000].filter(r => r <= maxRadius); // Search radiuses in meters
  
  for (const radius of radiusSteps) {
    console.log(`Searching for street within ${radius}m radius`);
    
    // Try 8 directions around the position
    const directions = [
      { lat: 1, lng: 0 },     // North
      { lat: 1, lng: 1 },     // Northeast  
      { lat: 0, lng: 1 },     // East
      { lat: -1, lng: 1 },    // Southeast
      { lat: -1, lng: 0 },    // South
      { lat: -1, lng: -1 },   // Southwest
      { lat: 0, lng: -1 },    // West
      { lat: 1, lng: -1 }     // Northwest
    ];

    for (const direction of directions) {
      // Convert radius in meters to lat/lng offset (rough approximation)
      const latOffset = (radius / 111000) * direction.lat; // ~111km per degree
      const lngOffset = (radius / (111000 * Math.cos(position.lat * Math.PI / 180))) * direction.lng;
      
      const testPosition = {
        lat: position.lat + latOffset,
        lng: position.lng + lngOffset
      };

      try {
        if (await isOnStreet(testPosition, directionsService)) {
          const snappedPosition = await snapToStreet(testPosition, directionsService);
          console.log(`Found street at ${radius}m radius:`, snappedPosition);
          return snappedPosition;
        }
      } catch (error) {
        // Continue searching if this position fails
        continue;
      }
    }
  }

  console.warn('Could not find nearby street, using original position');
  return position;
};

// Validate and fix spawn location to ensure it's on a street
export const validateSpawnLocation = async (
  position: { lat: number; lng: number },
  directionsService?: google.maps.DirectionsService
): Promise<{ lat: number; lng: number }> => {
  // If no directions service available, return original position
  if (!directionsService) {
    console.warn('No directions service available for spawn validation');
    return position;
  }

  try {
    console.log('Validating spawn location:', position);
    const streetPosition = await findNearestStreet(position, directionsService);
    
    if (streetPosition.lat !== position.lat || streetPosition.lng !== position.lng) {
      const distance = calculateDistance(position, streetPosition);
      console.log(`Moved spawn point ${distance.toFixed(0)}m to nearest street`);
    }
    
    return streetPosition;
  } catch (error) {
    console.error('Error validating spawn location:', error);
    return position; // Return original position if validation fails
  }
}; 