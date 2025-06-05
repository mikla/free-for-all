import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Predefined street locations in London
const streetLocations = [
  { lat: 51.5074, lng: -0.1278 }, // Trafalgar Square
  { lat: 51.5014, lng: -0.1419 }, // Westminster
  { lat: 51.5123, lng: -0.0909 }, // Liverpool Street
  { lat: 51.5154, lng: -0.0725 }, // Old Street
  { lat: 51.5200, lng: -0.1000 }, // Kings Cross
  { lat: 51.5080, lng: -0.1281 }, // Charing Cross
  { lat: 51.5079, lng: -0.1247 }, // Covent Garden
  { lat: 51.5113, lng: -0.1190 }, // Holborn
  { lat: 51.5139, lng: -0.0989 }, // Farringdon
  { lat: 51.5175, lng: -0.1400 }  // Euston
];

const players = new Map();

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  // Assign a random street location to the new player
  const randomLocation = streetLocations[Math.floor(Math.random() * streetLocations.length)];
  const player = {
    id: socket.id,
    position: randomLocation,
    health: 100
  };
  
  players.set(socket.id, player);
  console.log('Total players:', players.size);
  
  // Send existing players to the new player
  socket.emit('existingPlayers', Array.from(players.values()));
  
  // Broadcast the new player to all other players
  socket.broadcast.emit('playerJoined', player);
  
  socket.on('updatePosition', (position) => {
    const player = players.get(socket.id);
    if (player) {
      player.position = position;
      io.emit('playerMoved', { id: socket.id, position });
    }
  });
  
  socket.on('shoot', (data) => {
    const shooter = players.get(socket.id);
    const target = players.get(data.targetId);
    
    if (shooter && target && target.health > 0) {
      // Calculate distance between shooter and target
      const distance = calculateDistance(shooter.position, target.position);
      const maxRange = 50; // 50 meters max shooting range
      
      if (distance <= maxRange) {
        const damage = 25; // Each shot does 25 damage
        target.health = Math.max(0, target.health - damage);
        
        console.log(`Player ${socket.id} shot ${data.targetId} for ${damage} damage. Target health: ${target.health}`);
        
        // Broadcast the shot to all players
        io.emit('playerShot', {
          shooterId: socket.id,
          targetId: data.targetId,
          damage: damage
        });
        
        // Check if target died
        if (target.health <= 0) {
          console.log(`Player ${data.targetId} has been eliminated!`);
          io.emit('playerEliminated', { playerId: data.targetId });
        }
      } else {
        console.log(`Shot from ${socket.id} to ${data.targetId} failed: too far (${distance.toFixed(1)}m)`);
      }
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    players.delete(socket.id);
    console.log('Remaining players:', players.size);
    io.emit('playerLeft', socket.id);
  });
});

// Helper function to calculate distance
function calculateDistance(pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (pos1.lat * Math.PI) / 180;
  const φ2 = (pos2.lat * Math.PI) / 180;
  const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const Δλ = ((pos2.lng - pos1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 