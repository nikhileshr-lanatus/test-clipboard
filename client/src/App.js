import React, { useState, useEffect, useRef } from "react";
import ClipboardInterface from "./components/ClipboardInterface";
import ConnectionForm from "./components/ConnectionForm";
import { useWebSocket } from "./hooks/useWebSocket";

function App() {
  const [sessionCode, setSessionCode] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [clipboardItems, setClipboardItems] = useState([]);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const { socket, connect, disconnect, sendMessage } = useWebSocket({
    onMessage: handleWebSocketMessage,
    onConnectionChange: setConnectionStatus,
  });

  function handleWebSocketMessage(data) {
    switch (data.type) {
      case "session_joined":
        setIsConnected(true);
        setClipboardItems(data.items || []);
        setError("");
        break;

      case "item_added":
        setClipboardItems((prev) => [...prev, data.item]);
        break;

      case "clipboard_cleared":
        setClipboardItems([]);
        break;

      case "session_ended":
        setIsConnected(false);
        setSessionCode("");
        setClipboardItems([]);
        setError(data.message || "Session ended");
        break;

      case "user_joined":
        // Optional: show notification that someone joined
        break;

      case "error":
        setError(data.message);
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  }

  const handleConnect = async (code) => {
    setError("");
    setSessionCode(code);

    try {
      // First try to join via REST API
      const response = await fetch("/api/session/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to join session");
      }

      // Now connect WebSocket
      connect();

      // Send join message via WebSocket
      sendMessage({
        type: "join_session",
        code: code,
      });
    } catch (err) {
      setError(err.message);
      setSessionCode("");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsConnected(false);
    setSessionCode("");
    setClipboardItems([]);
    setError("");
  };

  const handleAddText = (text) => {
    if (socket && text.trim()) {
      sendMessage({
        type: "add_text",
        content: text.trim(),
      });
    }
  };

  const handleClearClipboard = () => {
    if (socket) {
      sendMessage({
        type: "clear_clipboard",
      });
    }
  };

  const handleFileUpload = async (file) => {
    if (!sessionCode || !file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/upload/${sessionCode}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload file");
      }

      // File will be broadcasted via WebSocket automatically
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 desktop:block hidden">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🖥️ Desktop Clipboard
          </h1>
          <p className="text-gray-600">
            Share text, files, and images in real-time with a 4-digit code
          </p>
        </header>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {!isConnected ? (
          <ConnectionForm
            onConnect={handleConnect}
            connectionStatus={connectionStatus}
          />
        ) : (
          <ClipboardInterface
            sessionCode={sessionCode}
            clipboardItems={clipboardItems}
            onAddText={handleAddText}
            onFileUpload={handleFileUpload}
            onClearClipboard={handleClearClipboard}
            onDisconnect={handleDisconnect}
            connectionStatus={connectionStatus}
          />
        )}
      </div>
    </div>
  );
}

export default App;
