import { useEffect, useState } from 'react';
import { socketService } from '../services/socket';

interface Player {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
}

export const useMultiplayer = () => {
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const socket = socketService.connect();

    if (!socket) return;

    // Handle initial connection
    socket.on('init', (data: Player) => {
      console.log('Player initialized:', data.id);
      setCurrentPlayer(data);
      setPlayers(prev => new Map(prev).set(data.id, data));
    });

    // Handle existing players
    socket.on('existingPlayers', (existingPlayers: Player[]) => {
      console.log('Received existing players:', existingPlayers.length);
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        existingPlayers.forEach(player => {
          newPlayers.set(player.id, player);
        });
        return newPlayers;
      });
    });

    // Handle new players joining
    socket.on('playerJoined', (player: Player) => {
      console.log('New player joined:', player.id);
      setPlayers(prev => new Map(prev).set(player.id, player));
    });

    // Handle player movement
    socket.on('playerMoved', (data: Player) => {
      setPlayers(prev => new Map(prev).set(data.id, data));
    });

    // Handle player disconnection
    socket.on('playerLeft', (playerId: string) => {
      console.log('Player disconnected:', playerId);
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        newPlayers.delete(playerId);
        console.log('Remaining players:', newPlayers.size);
        return newPlayers;
      });
    });

    return () => {
      socket.off('init');
      socket.off('existingPlayers');
      socket.off('playerJoined');
      socket.off('playerMoved');
      socket.off('playerLeft');
    };
  }, []);

  const updatePosition = (position: { lat: number; lng: number }) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('updatePosition', position);
    }
  };

  return {
    players,
    currentPlayer,
    updatePosition
  };
}; 