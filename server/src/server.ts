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
    position: randomLocation
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
  
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    players.delete(socket.id);
    console.log('Remaining players:', players.size);
    io.emit('playerLeft', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 