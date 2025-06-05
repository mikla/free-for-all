import { useEffect, useCallback, useState } from 'react';
import { useMultiplayer } from './useMultiplayer';
import { snapToStreet, isOnStreet } from '../utils/streetUtils';

interface MovementState {
  isMoving: boolean;
  direction: {
    lat: number;
    lng: number;
  } | null;
}

export const usePlayerMovement = (directionsService: google.maps.DirectionsService | null) => {
  const { currentPlayer, updatePosition } = useMultiplayer();
  const [movementState, setMovementState] = useState<MovementState>({
    isMoving: false,
    direction: null
  });

  const movePlayer = useCallback(async (direction: { lat: number; lng: number }) => {
    if (!currentPlayer || !directionsService) return;

    const newPosition = {
      lat: currentPlayer.position.lat + direction.lat,
      lng: currentPlayer.position.lng + direction.lng
    };

    // Check if the new position is on a street
    if (await isOnStreet(newPosition, directionsService)) {
      // Snap to the nearest street point
      const snappedPosition = await snapToStreet(newPosition, directionsService);
      updatePosition(snappedPosition);
    }
  }, [currentPlayer, directionsService, updatePosition]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const step = 0.0001; // approximately 10 meters
      let direction = null;

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          direction = { lat: step, lng: 0 };
          break;
        case 'ArrowDown':
        case 's':
          direction = { lat: -step, lng: 0 };
          break;
        case 'ArrowLeft':
        case 'a':
          direction = { lat: 0, lng: -step };
          break;
        case 'ArrowRight':
        case 'd':
          direction = { lat: 0, lng: step };
          break;
      }

      if (direction) {
        setMovementState({ isMoving: true, direction });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(event.key)) {
        setMovementState({ isMoving: false, direction: null });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle continuous movement
  useEffect(() => {
    let movementInterval: ReturnType<typeof setInterval>;

    if (movementState.isMoving && movementState.direction) {
      movementInterval = setInterval(() => {
        movePlayer(movementState.direction!);
      }, 100); // Update position every 100ms
    }

    return () => {
      if (movementInterval) {
        clearInterval(movementInterval);
      }
    };
  }, [movementState, movePlayer]);

  return {
    isMoving: movementState.isMoving,
    currentDirection: movementState.direction
  };
}; 