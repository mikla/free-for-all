import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    if (!this.socket) {
      console.log('Initializing socket connection...');
      this.socket = io('http://localhost:3001');
      
      this.socket.on('connect', () => {
        console.log('Socket connected successfully, ID:', this.socket?.id);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    } else {
      console.log('Socket already exists, ID:', this.socket.id);
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected and cleared');
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = SocketService.getInstance(); 