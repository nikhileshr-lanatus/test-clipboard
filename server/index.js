const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "../client/build")));

// In-memory storage for clipboard sessions
const sessions = new Map();
const sessionCleanupTimers = new Map();

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// Generate 4-digit code
function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Clean up session data
function cleanupSession(code) {
  console.log(`Cleaning up session: ${code}`);
  sessions.delete(code);

  if (sessionCleanupTimers.has(code)) {
    clearTimeout(sessionCleanupTimers.get(code));
    sessionCleanupTimers.delete(code);
  }

  // Notify all clients in session that it's ended
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.sessionCode === code) {
      client.send(
        JSON.stringify({
          type: "session_ended",
          message: "Session expired due to inactivity",
        })
      );
      client.close();
    }
  });
}

// Reset cleanup timer for a session
function resetCleanupTimer(code) {
  if (sessionCleanupTimers.has(code)) {
    clearTimeout(sessionCleanupTimers.get(code));
  }

  const timer = setTimeout(() => cleanupSession(code), 10 * 60 * 1000); // 10 minutes
  sessionCleanupTimers.set(code, timer);
}

// Initialize or get session
function getOrCreateSession(code) {
  if (!sessions.has(code)) {
    sessions.set(code, {
      code: code,
      items: [],
      createdAt: new Date(),
      lastActivity: new Date(),
    });
  }

  const session = sessions.get(code);
  session.lastActivity = new Date();
  resetCleanupTimer(code);

  return session;
}

// Broadcast to all clients in a session
function broadcastToSession(code, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.sessionCode === code) {
      client.send(JSON.stringify(data));
    }
  });
}

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "join_session":
          const code = data.code;
          if (!/^\d{4}$/.test(code)) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Invalid code. Please enter a 4-digit number.",
              })
            );
            return;
          }

          ws.sessionCode = code;
          const session = getOrCreateSession(code);

          ws.send(
            JSON.stringify({
              type: "session_joined",
              code: code,
              items: session.items,
            })
          );

          // Notify other clients
          broadcastToSession(code, {
            type: "user_joined",
            message: "A user joined the session",
          });
          break;

        case "add_text":
          if (ws.sessionCode) {
            const session = getOrCreateSession(ws.sessionCode);
            const textItem = {
              id: uuidv4(),
              type: "text",
              content: data.content,
              timestamp: new Date(),
              author: "user",
            };
            session.items.push(textItem);

            broadcastToSession(ws.sessionCode, {
              type: "item_added",
              item: textItem,
            });
          }
          break;

        case "clear_clipboard":
          if (ws.sessionCode) {
            const session = getOrCreateSession(ws.sessionCode);
            session.items = [];

            broadcastToSession(ws.sessionCode, {
              type: "clipboard_cleared",
            });
          }
          break;
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

// REST API endpoints

// Join or create session
app.post("/api/session/join", (req, res) => {
  const { code } = req.body;

  if (!code || !/^\d{4}$/.test(code)) {
    return res
      .status(400)
      .json({ error: "Invalid code. Please enter a 4-digit number." });
  }

  const session = getOrCreateSession(code);
  res.json({
    code: session.code,
    items: session.items,
    message: "Session joined successfully",
  });
});

// Upload file
app.post("/api/upload/:code", upload.single("file"), (req, res) => {
  const { code } = req.params;

  if (!code || !/^\d{4}$/.test(code)) {
    return res.status(400).json({ error: "Invalid session code" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const session = getOrCreateSession(code);
  const fileItem = {
    id: uuidv4(),
    type: req.file.mimetype.startsWith("image/") ? "image" : "file",
    name: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
    data: req.file.buffer.toString("base64"),
    timestamp: new Date(),
    author: "user",
  };

  session.items.push(fileItem);

  // Broadcast to all clients in session
  broadcastToSession(code, {
    type: "item_added",
    item: {
      ...fileItem,
      data: undefined, // Don't send full data in broadcast, clients will fetch it
    },
  });

  res.json({
    message: "File uploaded successfully",
    fileId: fileItem.id,
  });
});

// Download file
app.get("/api/download/:code/:fileId", (req, res) => {
  const { code, fileId } = req.params;

  if (!sessions.has(code)) {
    return res.status(404).json({ error: "Session not found" });
  }

  const session = sessions.get(code);
  const file = session.items.find(
    (item) =>
      item.id === fileId && (item.type === "file" || item.type === "image")
  );

  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  const buffer = Buffer.from(file.data, "base64");

  res.set({
    "Content-Type": file.mimeType,
    "Content-Disposition": `attachment; filename="${file.name}"`,
    "Content-Length": buffer.length,
  });

  res.send(buffer);
});

// Get file data (for image preview)
app.get("/api/file/:code/:fileId", (req, res) => {
  const { code, fileId } = req.params;

  if (!sessions.has(code)) {
    return res.status(404).json({ error: "Session not found" });
  }

  const session = sessions.get(code);
  const file = session.items.find(
    (item) =>
      item.id === fileId && (item.type === "file" || item.type === "image")
  );

  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  res.json({
    id: file.id,
    type: file.type,
    name: file.name,
    size: file.size,
    mimeType: file.mimeType,
    data: file.data,
    timestamp: file.timestamp,
  });
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");

  // Clear all cleanup timers
  sessionCleanupTimers.forEach((timer) => clearTimeout(timer));

  // Close all WebSocket connections
  wss.clients.forEach((client) => {
    client.close();
  });

  server.close(() => {
    console.log("Server shut down");
    process.exit(0);
  });
});
