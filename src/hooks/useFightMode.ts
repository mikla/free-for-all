import { useEffect, useState, useCallback } from 'react';
import { useMultiplayer } from './useMultiplayer';
import { getPlayersInRange } from '../utils/gameUtils';

export const useFightMode = () => {
  const { players, currentPlayer, shoot } = useMultiplayer();
  const [nearbyPlayers, setNearbyPlayers] = useState<Array<{ id: string; position: { lat: number; lng: number }; health: number }>>([]);
  const [isInFightMode, setIsInFightMode] = useState(false);

  // Update nearby players when player positions change
  useEffect(() => {
    if (currentPlayer) {
      const allPlayers = Array.from(players.values()).filter(p => p.id !== currentPlayer.id);
      const playersInRange = getPlayersInRange(currentPlayer.position, allPlayers);
      setNearbyPlayers(playersInRange);
      setIsInFightMode(playersInRange.length > 0);
      
      if (playersInRange.length > 0) {
        console.log(`Fight mode: ${playersInRange.length} players in range`);
      }
    }
  }, [currentPlayer, players]);

  // Handle space key for shooting
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && isInFightMode && nearbyPlayers.length > 0) {
        event.preventDefault();
        // Shoot at the closest player
        const closestPlayer = nearbyPlayers[0]; // For now, just shoot the first one
        if (closestPlayer && closestPlayer.health > 0) {
          shoot(closestPlayer.id);
          console.log(`Shot fired at player ${closestPlayer.id}!`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isInFightMode, nearbyPlayers, shoot]);

  return {
    isInFightMode,
    nearbyPlayers,
    canShoot: isInFightMode && nearbyPlayers.some(p => p.health > 0)
  };
}; 