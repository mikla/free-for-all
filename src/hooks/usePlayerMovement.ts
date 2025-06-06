import { useEffect, useCallback, useState } from 'react';
import { useMultiplayer } from './useMultiplayer';
import { validateMovement } from '../utils/streetUtils';

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
  const [lastBlockedTime, setLastBlockedTime] = useState<number>(0);
  const [showBlockedNotification, setShowBlockedNotification] = useState<boolean>(false);

  const movePlayer = useCallback(async (direction: { lat: number; lng: number }) => {
    if (!currentPlayer || !directionsService) return;

    const newPosition = {
      lat: currentPlayer.position.lat + direction.lat,
      lng: currentPlayer.position.lng + direction.lng
    };

    // Validate the movement using the enhanced street validation
    const validation = await validateMovement(
      currentPlayer.position,
      newPosition,
      directionsService
    );

    if (validation.isValid && validation.snappedPosition) {
      // Use the snapped position to ensure player stays on streets
      updatePosition(validation.snappedPosition);
      console.log('Valid movement to street position:', validation.snappedPosition);
      
      // Hide notification if movement is successful
      setShowBlockedNotification(false);
    } else {
      // Show visual feedback for blocked movement (but not too frequently)
      const now = Date.now();
      if (now - lastBlockedTime > 1000) { // Only show message once per second
        console.log('🚫 Movement blocked - not on a street! Try a different direction.');
        setLastBlockedTime(now);
        
        // Show visual notification
        setShowBlockedNotification(true);
        // Hide notification after 2 seconds
        setTimeout(() => setShowBlockedNotification(false), 2000);
      }
    }
  }, [currentPlayer, directionsService, updatePosition, lastBlockedTime]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const step = 0.00015; // Slightly larger step for better street navigation (~15 meters)
      let direction = null;

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = { lat: step, lng: 0 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = { lat: -step, lng: 0 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = { lat: 0, lng: -step };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = { lat: 0, lng: step };
          break;
      }

      if (direction) {
        setMovementState({ isMoving: true, direction });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
      if (movementKeys.includes(event.key)) {
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
      }, 150); // Slightly slower for better street validation
    }

    return () => {
      if (movementInterval) {
        clearInterval(movementInterval);
      }
    };
  }, [movementState, movePlayer]);

  return {
    isMoving: movementState.isMoving,
    currentDirection: movementState.direction,
    showBlockedNotification
  };
}; 