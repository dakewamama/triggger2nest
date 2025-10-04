import { useEffect, useState, useCallback } from 'react';
import { websocketService } from './websocket/websocketService';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const handleConnected = (data: any) => setIsConnected(data.connected);
    const handleMessage = (data: any) => setLastMessage(data);

    websocketService.on('connected', handleConnected);
    websocketService.on('message', handleMessage);
    websocketService.connect();

    return () => {
      websocketService.off('connected', handleConnected);
      websocketService.off('message', handleMessage);
    };
  }, []);

  const sendMessage = useCallback((message: any) => {
    websocketService.send(message);
  }, []);

  return { isConnected, lastMessage, sendMessage };
}