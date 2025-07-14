import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { parse } from 'url';
import { verifyToken } from '@/lib/auth/clerk-config';

interface RealtimeUpdate {
  id: string;
  type: 'email' | 'slack' | 'ai_analysis';
  action: 'created' | 'updated' | 'deleted';
  data: unknown;
  timestamp: Date;
  userId: string;
}

interface ConnectedClient {
  userId: string;
  ws: WebSocket;
  subscriptions: string[];
}

class RealtimeServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private updateQueue: RealtimeUpdate[] = [];
  private isInitialized = false;

  constructor(port: number = 3001) {
    // Only initialize if not in build mode
    if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV) {
      this.initialize(port);
    }
  }

  private initialize(port: number) {
    if (this.isInitialized) return;
    
    const server = createServer();
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', this.handleConnection.bind(this));
    
    server.listen(port, () => {
      console.log(`WebSocket server running on port ${port}`);
    });

    // Process update queue every 100ms
    setInterval(() => {
      this.processUpdateQueue();
    }, 100);

    this.isInitialized = true;
  }

  private async handleConnection(ws: WebSocket, request: unknown) {
    try {
      const { query } = parse(request.url || '', true);
      const token = query.token as string;
      const userId = query.userId as string;

      if (!token || !userId) {
        ws.close(1008, 'Missing authentication');
        return;
      }

      // Verify the token with Clerk
      const isValid = await verifyToken(token);
      if (!isValid) {
        ws.close(1008, 'Invalid authentication');
        return;
      }

      // Store client connection
      this.clients.set(userId, {
        userId,
        ws,
        subscriptions: []
      });

      console.log(`Client connected: ${userId}`);

      // Send initial connection confirmation
      ws.send(JSON.stringify({
        type: 'connection_established',
        userId,
        timestamp: new Date()
      }));

      ws.on('message', (data) => {
        this.handleMessage(userId, data.toString());
      });

      ws.on('close', () => {
        this.clients.delete(userId);
        console.log(`Client disconnected: ${userId}`);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
        this.clients.delete(userId);
      });

    } catch (error) {
      console.error('Connection error:', error);
      ws.close(1011, 'Internal server error');
    }
  }

  private handleMessage(userId: string, message: string) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'subscribe':
          this.handleSubscribe(userId, data.channels);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(userId, data.channels);
          break;
        case 'ping':
          this.sendToUser(userId, { type: 'pong', timestamp: new Date() });
          break;
        default:
          console.warn(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private handleSubscribe(userId: string, channels: string[]) {
    const client = this.clients.get(userId);
    if (client) {
      client.subscriptions = [...new Set([...client.subscriptions, ...channels])];
      this.sendToUser(userId, {
        type: 'subscription_confirmed',
        channels: client.subscriptions,
        timestamp: new Date()
      });
    }
  }

  private handleUnsubscribe(userId: string, channels: string[]) {
    const client = this.clients.get(userId);
    if (client) {
      client.subscriptions = client.subscriptions.filter(
        sub => !channels.includes(sub)
      );
      this.sendToUser(userId, {
        type: 'unsubscription_confirmed',
        channels: client.subscriptions,
        timestamp: new Date()
      });
    }
  }

  private sendToUser(userId: string, data: unknown) {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error(`Error sending to user ${userId}:`, error);
        this.clients.delete(userId);
      }
    }
  }

  private processUpdateQueue() {
    if (this.updateQueue.length === 0) return;

    const updates = [...this.updateQueue];
    this.updateQueue = [];

    updates.forEach(update => {
      this.clients.forEach((client, userId) => {
        if (userId === update.userId && client.subscriptions.includes(update.type)) {
          this.sendToUser(userId, {
            type: 'update',
            data: update
          });
        }
      });
    });
  }

  // Public API for broadcasting updates
  public broadcastUpdate(update: Omit<RealtimeUpdate, 'id' | 'timestamp'>) {
    const fullUpdate: RealtimeUpdate = {
      ...update,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };

    this.updateQueue.push(fullUpdate);
  }

  // Broadcast to specific user
  public sendUpdateToUser(userId: string, update: Omit<RealtimeUpdate, 'id' | 'timestamp'>) {
    const fullUpdate: RealtimeUpdate = {
      ...update,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      userId
    };

    this.sendToUser(userId, {
      type: 'update',
      data: fullUpdate
    });
  }

  // Get connected clients count
  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  // Get user subscriptions
  public getUserSubscriptions(userId: string): string[] {
    const client = this.clients.get(userId);
    return client ? client.subscriptions : [];
  }
}

// Create singleton instance
let realtimeServer: RealtimeServer | null = null;

export function getRealtimeServer(): RealtimeServer {
  if (!realtimeServer) {
    const port = parseInt(process.env.REALTIME_PORT || '3001');
    realtimeServer = new RealtimeServer(port);
  }
  return realtimeServer;
}

export function broadcastUpdate(update: Omit<RealtimeUpdate, 'id' | 'timestamp'>) {
  const server = getRealtimeServer();
  server.broadcastUpdate(update);
}

export function sendUpdateToUser(userId: string, update: Omit<RealtimeUpdate, 'id' | 'timestamp'>) {
  const server = getRealtimeServer();
  server.sendUpdateToUser(userId, update);
} 