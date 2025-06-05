// Utility functions for street validation and snapping

export const snapToStreet = async (
  position: { lat: number; lng: number },
  _directionsService: google.maps.DirectionsService
): Promise<{ lat: number; lng: number }> => {
  // For now, just return the original position
  // In a real implementation, you might use the Roads API or similar
  return position;
};

export const isOnStreet = async (
  _position: { lat: number; lng: number },
  _directionsService: google.maps.DirectionsService
): Promise<boolean> => {
  // For now, always return true (allow movement anywhere)
  // In a real implementation, you might validate against street data
  return true;
};

// Function to get valid movement positions
export const getValidMovementPositions = async (
  currentPosition: { lat: number; lng: number },
  directionsService: google.maps.DirectionsService
): Promise<{ lat: number; lng: number }[]> => {
  try {
    // Create a small grid of potential positions around the current position
    const gridSize = 0.0001; // approximately 10 meters
    const positions: { lat: number; lng: number }[] = [];

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