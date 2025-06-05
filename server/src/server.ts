import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});

// Predefined street locations in London - clustered around Trafalgar Square for testing
const streetLocations = [
  { lat: 51.5084, lng: -0.1278 }, // Trafalgar Square (center)
  { lat: 51.5082, lng: -0.1275 }, // 30m northeast of Trafalgar Square
  { lat: 51.5086, lng: -0.1281 }, // 30m northwest of Trafalgar Square  
  { lat: 51.5081, lng: -0.1282 }, // 30m southwest of Trafalgar Square
  { lat: 51.5087, lng: -0.1275 }, // 30m southeast of Trafalgar Square
  { lat: 51.5083, lng: -0.1270 }, // 40m east of Trafalgar Square
  { lat: 51.5085, lng: -0.1285 }, // 40m west of Trafalgar Square
  { lat: 51.5079, lng: -0.1278 }, // 40m south of Trafalgar Square
  { lat: 51.5089, lng: -0.1278 }, // 40m north of Trafalgar Square
  { lat: 51.5080, lng: -0.1270 }  // 45m southeast of Trafalgar Square
];

// Doom-inspired characters
const characters = [
  {
    id: 'marine',
    name: 'Space Marine',
    emoji: '🪖',
    color: '#4CAF50',
    description: 'Tough as nails marine'
  },
  {
    id: 'scout',
    name: 'Scout',
    emoji: '🏃',
    color: '#2196F3',
    description: 'Fast and agile'
  },
  {
    id: 'heavy',
    name: 'Heavy Gunner',
    emoji: '💪',
    color: '#FF5722',
    description: 'Strong and powerful'
  },
  {
    id: 'sniper',
    name: 'Sniper',
    emoji: '🎯',
    color: '#9C27B0',
    description: 'Precise and deadly'
  },
  {
    id: 'medic',
    name: 'Combat Medic',
    emoji: '⚕️',
    color: '#4CAF50',
    description: 'Heals and fights'
  },
  {
    id: 'engineer',
    name: 'Engineer',
    emoji: '🔧',
    color: '#FF9800',
    description: 'Builds and repairs'
  },
  {
    id: 'assassin',
    name: 'Assassin',
    emoji: '🥷',
    color: '#424242',
    description: 'Silent but deadly'
  },
  {
    id: 'berserker',
    name: 'Berserker',
    emoji: '😤',
    color: '#F44336',
    description: 'Rage-fueled warrior'
  },
  {
    id: 'cyborg',
    name: 'Cyborg',
    emoji: '🤖',
    color: '#607D8B',
    description: 'Half machine, all deadly'
  },
  {
    id: 'demon_hunter',
    name: 'Demon Hunter',
    emoji: '😈',
    color: '#9C27B0',
    description: 'Specialized in demon slaying'
  }
];

// Get random character
function getRandomCharacter() {
  return characters[Math.floor(Math.random() * characters.length)];
}

const players = new Map();

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  // Assign a random street location to the new player
  const randomLocation = streetLocations[Math.floor(Math.random() * streetLocations.length)];
  const character = getRandomCharacter();
  const player = {
    id: socket.id,
    position: randomLocation,
    health: 100,
    kills: 0,
    isDead: false,
    character: character
  };
  
  console.log(`Player ${socket.id} assigned character: ${character.name} ${character.emoji}`);
  
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
    
    if (shooter && target && target.health > 0 && !shooter.isDead && !target.isDead) {
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
          target.isDead = true;
          shooter.kills += 1;
          
          console.log(`Player ${data.targetId} has been eliminated by ${socket.id}! Killer now has ${shooter.kills} kills.`);
          
          io.emit('playerEliminated', { 
            playerId: data.targetId, 
            killerId: socket.id 
          });
        }
      } else {
        console.log(`Shot from ${socket.id} to ${data.targetId} failed: too far (${distance.toFixed(1)}m)`);
      }
    }
  });
  
  socket.on('respawn', () => {
    const player = players.get(socket.id);
    if (player && player.isDead) {
      // Respawn at random location
      const randomLocation = streetLocations[Math.floor(Math.random() * streetLocations.length)];
      player.position = randomLocation;
      player.health = 100;
      player.isDead = false;
      
      console.log(`Player ${socket.id} respawned at`, randomLocation);
      
      io.emit('playerRespawned', {
        playerId: socket.id,
        position: randomLocation
      });
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