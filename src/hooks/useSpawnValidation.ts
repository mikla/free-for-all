import { useEffect, useState } from 'react';
import { validateSpawnLocation } from '../utils/streetUtils';

export const useSpawnValidation = (
  directionsService: google.maps.DirectionsService | null,
  currentPlayer: any,
  updatePosition: (position: { lat: number; lng: number }) => void
) => {
  const [isValidatingSpawn, setIsValidatingSpawn] = useState(false);
  const [hasValidatedSpawn, setHasValidatedSpawn] = useState(false);

  useEffect(() => {
    const validateCurrentPlayerSpawn = async () => {
      if (!currentPlayer || !directionsService || hasValidatedSpawn || isValidatingSpawn) {
        return;
      }

      console.log('Validating spawn location for current player...');
      setIsValidatingSpawn(true);

      try {
        const validatedPosition = await validateSpawnLocation(
          currentPlayer.position,
          directionsService
        );

        // If position was corrected, update it
        if (
          validatedPosition.lat !== currentPlayer.position.lat ||
          validatedPosition.lng !== currentPlayer.position.lng
        ) {
          console.log('Correcting spawn position from', currentPlayer.position, 'to', validatedPosition);
          updatePosition(validatedPosition);
        } else {
          console.log('Spawn position is valid');
        }

        setHasValidatedSpawn(true);
      } catch (error) {
        console.error('Error validating spawn location:', error);
      } finally {
        setIsValidatingSpawn(false);
      }
    };

    // Add a small delay to ensure Google Maps is fully loaded
    const timeout = setTimeout(validateCurrentPlayerSpawn, 2000);

    return () => clearTimeout(timeout);
  }, [currentPlayer, directionsService, hasValidatedSpawn, isValidatingSpawn, updatePosition]);

  // Reset validation when player changes (e.g., respawn)
  useEffect(() => {
    setHasValidatedSpawn(false);
  }, [currentPlayer?.id]);

  return {
    isValidatingSpawn,
    hasValidatedSpawn
  };
}; 