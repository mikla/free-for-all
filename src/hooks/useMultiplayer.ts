import { useEffect, useState } from 'react';
import { socketService } from '../services/socket';

interface Player {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  health: number;
  kills: number;
  isDead: boolean;
  isBlocked?: boolean;
  character: {
    id: string;
    name: string;
    emoji: string;
    color: string;
    description: string;
  };
}

export const useMultiplayer = () => {
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const socket = socketService.connect();

    if (!socket) {
      console.error('Failed to connect socket');
      return;
    }

    console.log('Socket connected, ID:', socket.id);

    // Set current player when socket connects
    socket.on('connect', () => {
      console.log('Socket connected event received, ID:', socket.id);
    });

    // Handle existing players
    socket.on('existingPlayers', (existingPlayers: Player[]) => {
      console.log('Received existing players:', existingPlayers);
      const newPlayers = new Map();
      existingPlayers.forEach(player => {
        console.log('Processing player:', player);
        newPlayers.set(player.id, player);
        // If this is the current player, set it
        if (player.id === socket.id) {
          console.log('Found current player:', player);
          setCurrentPlayer(player);
        }
      });
      console.log('Setting players map:', Array.from(newPlayers.entries()));
      setPlayers(newPlayers);
    });

    // Handle new players joining
    socket.on('playerJoined', (player: Player) => {
      console.log('New player joined:', player);
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        newPlayers.set(player.id, player);
        console.log('Updated players after join:', Array.from(newPlayers.entries()));
        return newPlayers;
      });
    });

    // Handle player movement
    socket.on('playerMoved', (data: { id: string; position: { lat: number; lng: number } }) => {
      console.log('Player moved:', data);
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        const player = newPlayers.get(data.id);
        if (player) {
          newPlayers.set(data.id, { ...player, position: data.position });
          console.log('Updated players after move:', Array.from(newPlayers.entries()));
        }
        return newPlayers;
      });
      
      // Also update currentPlayer if this is the current player's movement
      setCurrentPlayer(prev => {
        if (prev && prev.id === data.id) {
          console.log('Updating currentPlayer position from server:', data.position);
          return { ...prev, position: data.position };
        }
        return prev;
      });
    });

    // Handle player disconnection
    socket.on('playerLeft', (playerId: string) => {
      console.log('Player disconnected:', playerId);
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        newPlayers.delete(playerId);
        console.log('Remaining players:', Array.from(newPlayers.entries()));
        return newPlayers;
      });
    });

    // Handle player being shot
    socket.on('playerShot', (data: { shooterId: string; targetId: string; damage: number }) => {
      console.log('Player shot event:', data);
      
      // Trigger attack animation
      const attackEvent = new CustomEvent('playerShotEvent', {
        detail: { shooterId: data.shooterId, targetId: data.targetId }
      });
      window.dispatchEvent(attackEvent);
      
      // Update target player's health
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        const targetPlayer = newPlayers.get(data.targetId);
        if (targetPlayer) {
          const updatedPlayer = { ...targetPlayer, health: Math.max(0, targetPlayer.health - data.damage) };
          newPlayers.set(data.targetId, updatedPlayer);
          console.log(`Player ${data.targetId} health: ${updatedPlayer.health}`);
        }
        return newPlayers;
      });

      // Update currentPlayer health if we're the target
      setCurrentPlayer(prev => {
        if (prev && prev.id === data.targetId) {
          const newHealth = Math.max(0, prev.health - data.damage);
          console.log(`Your health: ${newHealth}`);
          return { ...prev, health: newHealth };
        }
        return prev;
      });
    });

    // Handle player elimination/death
    socket.on('playerEliminated', (data: { playerId: string; killerId: string }) => {
      console.log('Player eliminated:', data);
      
      // Update killed player's state
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        const killedPlayer = newPlayers.get(data.playerId);
        const killer = newPlayers.get(data.killerId);
        
        if (killedPlayer) {
          newPlayers.set(data.playerId, { ...killedPlayer, isDead: true, health: 0 });
        }
        
        if (killer) {
          newPlayers.set(data.killerId, { ...killer, kills: killer.kills + 1 });
        }
        
        return newPlayers;
      });

      // Update currentPlayer if we're involved
      setCurrentPlayer(prev => {
        if (prev) {
          if (prev.id === data.playerId) {
            return { ...prev, isDead: true, health: 0 };
          } else if (prev.id === data.killerId) {
            return { ...prev, kills: prev.kills + 1 };
          }
        }
        return prev;
      });
    });

    // Handle player respawn
    socket.on('playerRespawned', (data: { playerId: string; position: { lat: number; lng: number } }) => {
      console.log('Player respawned:', data);
      
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        const respawnedPlayer = newPlayers.get(data.playerId);
        
        if (respawnedPlayer) {
          newPlayers.set(data.playerId, { 
            ...respawnedPlayer, 
            isDead: false, 
            health: 100, 
            position: data.position 
          });
        }
        
        return newPlayers;
      });

      // Update currentPlayer if we respawned
      setCurrentPlayer(prev => {
        if (prev && prev.id === data.playerId) {
          return { ...prev, isDead: false, health: 100, position: data.position };
        }
        return prev;
      });
    });

    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('connect');
      socket.off('existingPlayers');
      socket.off('playerJoined');
      socket.off('playerMoved');
      socket.off('playerLeft');
      socket.off('playerShot');
      socket.off('playerEliminated');
      socket.off('playerRespawned');
    };
  }, []);

  const updatePosition = (position: { lat: number; lng: number }) => {
    console.log('updatePosition called with:', position);
    setCurrentPlayer(prev => {
      const socket = socketService.getSocket();
      if (socket && prev) {
        socket.emit('updatePosition', position);
        // Update current player position immediately for better responsiveness
        const updated = { ...prev, position };
        // Also update the players map for the current player
        setPlayers(playersPrev => {
          const newPlayers = new Map(playersPrev);
          newPlayers.set(updated.id, updated);
          return newPlayers;
        });
        return updated;
      } else {
        console.log('Cannot update position - socket or currentPlayer missing:', { socket: !!socket, currentPlayer: !!prev });
        return prev;
      }
    });
  };

  const shoot = (targetId: string) => {
    const socket = socketService.getSocket();
    if (socket && currentPlayer) {
      console.log(`Shooting at player ${targetId}`);
      socket.emit('shoot', { targetId });
    }
  };

  const respawn = () => {
    const socket = socketService.getSocket();
    if (socket && currentPlayer && currentPlayer.isDead) {
      console.log('Requesting respawn');
      socket.emit('respawn');
    }
  };

  console.log('Current state:', { 
    currentPlayer, 
    playersCount: players.size,
    players: Array.from(players.entries())
  });

  return {
    players,
    currentPlayer,
    updatePosition,
    shoot,
    respawn
  };
}; 