import { useCallback } from 'react';
import { useMultiplayer } from './useMultiplayer';
import { validateMovement } from '../utils/streetUtils';

interface MobileControlsProps {
  directionsService: google.maps.DirectionsService | null;
  showBlockedNotification: (show: boolean) => void;
}

export const useMobileControls = ({ directionsService, showBlockedNotification }: MobileControlsProps) => {
  const { currentPlayer, updatePosition, shoot } = useMultiplayer();

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
      showBlockedNotification(false);
    } else {
      // Show visual feedback for blocked movement
      console.log('🚫 Movement blocked - not on a street! Try a different direction.');
      
      // Show visual notification
      showBlockedNotification(true);
      // Hide notification after 2 seconds
      setTimeout(() => showBlockedNotification(false), 2000);
    }
  }, [currentPlayer, directionsService, updatePosition, showBlockedNotification]);

  const handleMobileMovement = useCallback((directionKey: string) => {
    const step = 0.00015; // Same step size as keyboard movement (~15 meters)
    let direction = null;

    switch (directionKey) {
      case 'up':
        direction = { lat: step, lng: 0 };
        break;
      case 'down':
        direction = { lat: -step, lng: 0 };
        break;
      case 'left':
        direction = { lat: 0, lng: -step };
        break;
      case 'right':
        direction = { lat: 0, lng: step };
        break;
    }

    if (direction) {
      movePlayer(direction);
    }
  }, [movePlayer]);

  const handleMobileAction = useCallback((actionKey: string) => {
    switch (actionKey) {
      case 'attack':
        // For now, we'll need to implement target selection for mobile
        // This could be enhanced later to auto-target nearest enemy
        console.log('Attack button pressed - need target selection for mobile');
        break;
      // Could add more actions here in the future (e.g., special abilities)
      default:
        break;
    }
  }, [shoot]);

  return {
    handleMobileMovement,
    handleMobileAction
  };
}; 