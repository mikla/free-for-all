import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import geoip from 'geoip-lite';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store connected players
const players = new Map<string, {
  id: string;
  position: { lat: number; lng: number };
  lastUpdate: number;
}>();

// Function to get random position within a city
function getRandomPositionInCity(cityCoords: { lat: number; lng: number }): { lat: number; lng: number } {
  // Add some random offset (about 1km in each direction)
  const offset = 0.01; // approximately 1km
  return {
    lat: cityCoords.lat + (Math.random() - 0.5) * offset,
    lng: cityCoords.lng + (Math.random() - 0.5) * offset
  };
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Get player's IP and determine their city
  const ip = socket.handshake.address;
  const geo = geoip.lookup(ip);
  
  // Default to London if geolocation fails
  const cityCoords = geo ? { lat: geo.ll[0], lng: geo.ll[1] } : { lat: 51.5074, lng: -0.1278 };
  
  // Generate random position within the city
  const playerPosition = getRandomPositionInCity(cityCoords);

  // Store player data
  players.set(socket.id, {
    id: socket.id,
    position: playerPosition,
    lastUpdate: Date.now()
  });

  // Send initial position to the player
  socket.emit('init', {
    id: socket.id,
    position: playerPosition
  });

  // Send list of existing players to the new player
  const existingPlayers = Array.from(players.entries())
    .filter(([id]) => id !== socket.id)
    .map(([id, player]) => ({
      id,
      position: player.position
    }));

  if (existingPlayers.length > 0) {
    socket.emit('existingPlayers', existingPlayers);
  }

  // Broadcast new player to all other players
  socket.broadcast.emit('playerJoined', {
    id: socket.id,
    position: playerPosition
  });

  // Handle player movement
  socket.on('updatePosition', (position: { lat: number; lng: number }) => {
    const player = players.get(socket.id);
    if (player) {
      player.position = position;
      player.lastUpdate = Date.now();
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        position
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    players.delete(socket.id);
    io.emit('playerLeft', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 