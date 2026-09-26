import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { initDb } from "./db/database.js";
import { setupSockets } from "./sockets/socketHandler.js";
import authRoutes from "./routes/authRoutes.js";
import createRequestRouter from "./routes/requestRoutes.js";
import createTechnicianRouter from "./routes/technicianRoutes.js";
import createAdminRouter from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import userDataRoutes from "./routes/userDataRoutes.js";
import professionalAuthRoutes from "./routes/professionalAuthRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach socket handlers
setupSockets(io);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Argent Your",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/professional/auth", professionalAuthRoutes);
app.use("/api/requests", createRequestRouter(io));
app.use("/api/technicians", createTechnicianRouter(io));
app.use("/api/admin", createAdminRouter(io));
app.use("/api/analytics", analyticsRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/user", userDataRoutes);

// Serve static files from client build in production
const clientDistPath = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDistPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
    if (err) next();
  });
});

// Database initialization and server startup
async function startServer() {
  try {
    await initDb();
    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`✨ Argent Your Platform Server running on port ${PORT}`);
      console.log(`📡 WebSocket server active and listening for telemetry`);
      console.log(`🌐 REST API available at http://localhost:${PORT}/api`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
