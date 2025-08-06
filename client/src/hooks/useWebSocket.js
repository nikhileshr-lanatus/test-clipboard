import { useRef, useCallback, useEffect } from "react";

export function useWebSocket({ onMessage, onConnectionChange }) {
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageQueueRef = useRef([]);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Add your prefix here - examples:
    // const wsUrl = `${protocol}//${window.location.host}/ws`;
    // const wsUrl = `${protocol}//${window.location.host}/socket`;
    // const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    const wsUrl = `${protocol}//${window.location.host}/clipboard`;

    try {
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log("WebSocket connected");
        onConnectionChange?.("connected");

        // Send any queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          socketRef.current.send(JSON.stringify(message));
        }
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket disconnected");
        onConnectionChange?.("disconnected");

        // Auto-reconnect after 3 seconds if not manually disconnected
        if (socketRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        onConnectionChange?.("error");
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      onConnectionChange?.("error");
    }
  }, [onMessage, onConnectionChange]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    messageQueueRef.current = [];
    onConnectionChange?.("disconnected");
  }, [onConnectionChange]);

  const sendMessage = useCallback((message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      // Queue message if not connected
      messageQueueRef.current.push(message);
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    sendMessage,
  };
}
