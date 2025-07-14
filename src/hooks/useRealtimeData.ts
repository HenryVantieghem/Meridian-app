'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

interface RealtimeUpdate {
  id: string;
  type: 'email' | 'slack' | 'ai_analysis';
  action: 'created' | 'updated' | 'deleted';
  data: unknown;
  timestamp: Date;
}

interface UseRealtimeDataOptions {
  enabled?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  subscriptions?: string[];
}

interface UseRealtimeDataReturn {
  connected: boolean;
  updates: RealtimeUpdate[];
  sendMessage: (message: unknown) => void;
  reconnect: () => void;
  clearUpdates: () => void;
  subscribe: (channels: string[]) => void;
  unsubscribe: (channels: string[]) => void;
  error: string | null;
}

export function useRealtimeData(options: UseRealtimeDataOptions = {}): UseRealtimeDataReturn {
  const { userId, getToken } = useAuth();
  const [connected, setConnected] = useState(false);
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    enabled = true, 
    reconnectInterval = 5000, 
    maxReconnectAttempts = 5,
    subscriptions = ['email', 'slack']
  } = options;

  const connect = useCallback(async () => {
    if (!userId || !enabled) return;

    try {
      // Get authentication token
      const token = await getToken();
      if (!token) {
        setError('No authentication token available');
        return;
      }

      // Create WebSocket connection to our real-time endpoint
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      const ws = new WebSocket(`${wsUrl}?token=${token}&userId=${userId}`);
      
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        setReconnectAttempts(0);
        console.log('WebSocket connected');
        
        // Subscribe to channels
        if (subscriptions.length > 0) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            channels: subscriptions
          }));
        }
      };

      ws.onmessage = (event: MessageEvent<unknown>) => {
        try {
          const message = JSON.parse(event.data as string);
          
          switch (message.type) {
            case 'connection_established':
              console.log('Connection established');
              break;
            case 'subscription_confirmed':
              console.log('Subscribed to channels:', message.channels);
              break;
            case 'update': {
              const update: RealtimeUpdate = message.data;
              setUpdates(prev => [update, ...prev.slice(0, 99)]); // Keep last 100 updates
              break;
            }
            case 'pong':
              // Handle ping/pong for connection health
              break;
            default:
              console.log('Received message:', message);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        setConnected(false);
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const timeout = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
          
          reconnectTimeoutRef.current = timeout;
        }
      };

      ws.onerror = (event) => {
        setError('WebSocket connection error');
        console.error('WebSocket error:', event);
      };

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to WebSocket');
    }
  }, [userId, enabled, reconnectInterval, maxReconnectAttempts, reconnectAttempts, getToken, subscriptions]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setConnected(false);
  }, []);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      setError('WebSocket not connected');
    }
  }, []);

  const subscribe = useCallback((channels: string[]) => {
    sendMessage({
      type: 'subscribe',
      channels
    });
  }, [sendMessage]);

  const unsubscribe = useCallback((channels: string[]) => {
    sendMessage({
      type: 'unsubscribe',
      channels
    });
  }, [sendMessage]);

  const reconnect = useCallback(() => {
    disconnect();
    setReconnectAttempts(0);
    connect();
  }, [disconnect, connect]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  // Connect on mount and when dependencies change
  useEffect(() => {
    if (userId && enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, enabled, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connected,
    updates,
    sendMessage,
    reconnect,
    clearUpdates,
    subscribe,
    unsubscribe,
    error,
  };
} 