// Calculate distance between two lat/lng points in meters
export const calculateDistance = (
  pos1: { lat: number; lng: number },
  pos2: { lat: number; lng: number }
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (pos1.lat * Math.PI) / 180;
  const φ2 = (pos2.lat * Math.PI) / 180;
  const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const Δλ = ((pos2.lng - pos1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
};

// Check if two players are in fight range (50 meters)
export const arePlayersInFightRange = (
  player1: { lat: number; lng: number },
  player2: { lat: number; lng: number },
  range: number = 50
): boolean => {
  return calculateDistance(player1, player2) <= range;
};

// Get all players within fight range of current player
export const getPlayersInRange = (
  currentPlayer: { lat: number; lng: number },
  allPlayers: Array<{ id: string; position: { lat: number; lng: number }; health: number }>,
  range: number = 50
): Array<{ id: string; position: { lat: number; lng: number }; health: number }> => {
  return allPlayers.filter(player => 
    arePlayersInFightRange(currentPlayer, player.position, range)
  );
}; 