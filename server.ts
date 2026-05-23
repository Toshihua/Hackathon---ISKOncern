import express from "express";
import path from "path";
import { createServer as createHttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { Incident, ChatMessage, IncidentCategory, IncidentStatus } from "./src/types.js";

// Keep ES Modules compatibility for dirname
const __dirname = path.resolve();

const app = express();
const PORT = 3000;

// Set body limit larger for Base64 image uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// In-memory Database for demo (seeded with some initial records)
let incidents: Incident[] = [
  {
    id: "ISK-101",
    title: "Unresponsive CCTV Cameras in West Quad",
    description: "Two major outdoor security cameras overlooking the West parking lot and student quad are displaying blank black feeds on the central security console. This is a critical blind spot.",
    category: "Security",
    status: "PENDING",
    reporterName: "Officer Ramos",
    reporterEmail: "ramos.security@iskon.edu",
    media: [],
    createdAt: "2026-05-22T14:30:00Z",
    chatAccessCode: "CHAT-WEST-774"
  },
  {
    id: "ISK-102",
    title: "Leaking AC Unit in Laboratory 402",
    description: "The ceiling AC compressor in Computer Lab 402 is dripping water continuously directly onto the electrical panel below desk 14. We have temporarily cut power to that segment, but it requires urgent structural maintenance.",
    category: "Facilities",
    status: "INVESTIGATING",
    reporterName: "Prof. Cruz",
    reporterEmail: "m.cruz@iskon.edu",
    media: [],
    createdAt: "2026-05-21T09:15:00Z",
    chatAccessCode: "CHAT-AC402-991"
  },
  {
    id: "ISK-103",
    title: "Campus WiFi Downtime - Main Library",
    description: "Students are unable to authenticate to the 'ISKOn-SECURE' hotspot across all floors of the main library. The radius server keeps refusing client handshakes with timed-out requests.",
    category: "IT Systems",
    status: "RESOLVED",
    reporterName: "Karlo (Student Government)",
    reporterEmail: "karlo.sg@iskon.edu",
    media: [],
    createdAt: "2026-05-20T08:00:00Z",
    chatAccessCode: "CHAT-WIFI-442"
  }
];

let chatMessages: ChatMessage[] = [
  {
    id: "MSG-1",
    incidentId: "ISK-102",
    sender: "STAKEHOLDER",
    text: "Hi, has anyone checked Laboratory 402 yet? The water level is increasing.",
    timestamp: "2026-05-21T10:00:00Z"
  },
  {
    id: "MSG-2",
    incidentId: "ISK-102",
    sender: "ADMIN",
    text: "Yes, Prof. Cruz. The Facilities Response Team has been notified. We are dispatching a plumber and an AC technician. They should arrive within 30 minutes.",
    timestamp: "2026-05-21T10:15:00Z"
  },
  {
    id: "MSG-3",
    incidentId: "ISK-102",
    sender: "STAKEHOLDER",
    text: "Awesome, thank you for the swift response!",
    timestamp: "2026-05-21T10:20:00Z"
  },
  {
    id: "MSG-4",
    incidentId: "ISK-103",
    sender: "STAKEHOLDER",
    text: "The authentication is working now! Thanks for resetting the server.",
    timestamp: "2026-05-20T11:45:00Z"
  },
  {
    id: "MSG-5",
    incidentId: "ISK-103",
    sender: "ADMIN",
    text: "Excellent. We updated the certificate on the Radius backup clusters. Let us know if you experience further latency.",
    timestamp: "2026-05-20T12:00:00Z"
  }
];

// --- HTTP API Endpoints ---

// Get all incidents (for admin dashboard with optional category and status filtering)
app.get("/api/incidents", (req, res) => {
  const { category, status, search } = req.query;
  let filtered = [...incidents];

  if (category && category !== "All") {
    filtered = filtered.filter(i => i.category === category);
  }

  if (status && status !== "All") {
    filtered = filtered.filter(i => i.status === status);
  }

  if (search) {
    const query = String(search).toLowerCase();
    filtered = filtered.filter(i => 
      i.title.toLowerCase().includes(query) || 
      i.description.toLowerCase().includes(query) ||
      i.id.toLowerCase().includes(query)
    );
  }

  // Sort by recent first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(filtered);
});

// Submit a new Incident
app.post("/api/incidents", (req, res) => {
  const { title, description, category, reporterName, reporterEmail, media } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Generate random id
  const nextNum = 100 + incidents.length + 1;
  const newId = `ISK-${nextNum}`;

  // Generate unique Chat Access Code for the submitter
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  const nextAccessCode = `CHAT-${category.substring(0, 3).toUpperCase()}-${randomStr}`;

  const newIncident: Incident = {
    id: newId,
    title,
    description,
    category: category as IncidentCategory,
    status: "PENDING",
    reporterName: reporterName || "Anonymous Reporter",
    reporterEmail: reporterEmail || undefined,
    media: media || [],
    createdAt: new Date().toISOString(),
    chatAccessCode: nextAccessCode
  };

  incidents.push(newIncident);
  res.status(201).json(newIncident);
});

// Get a single incident by ID or Access Code
app.get("/api/incidents/:idOrCode", (req, res) => {
  const param = req.params.idOrCode;
  
  // Find by direct ID or Access Code
  const incident = incidents.find(i => i.id === param || i.chatAccessCode === param);
  if (!incident) {
    return res.status(404).json({ error: "Concern record not found." });
  }
  res.json(incident);
});

// Update status of an incident
app.patch("/api/incidents/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const index = incidents.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Incident not found" });
  }

  incidents[index].status = status as IncidentStatus;
  res.json(incidents[index]);
});

// Get chat history for an incident
app.get("/api/messages/:incidentId", (req, res) => {
  const { incidentId } = req.params;
  const { accessCode } = req.query;

  const incident = incidents.find(i => i.id === incidentId);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  // Validate Access (either Admin, or provided correct accessCode)
  if (accessCode !== "ADMIN_ROLE" && incident.chatAccessCode !== accessCode) {
    return res.status(403).json({ error: "Unauthorized chat access" });
  }

  const messages = chatMessages.filter(m => m.incidentId === incidentId);
  res.json(messages);
});

// Add a raw HTTP fallback for messaging
app.post("/api/messages", (req, res) => {
  const { incidentId, sender, text, accessCode } = req.body;

  if (!incidentId || !sender || !text) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const incident = incidents.find(i => i.id === incidentId);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  // Verify access code match unless this is sent by admin
  if (sender !== "ADMIN" && incident.chatAccessCode !== accessCode) {
    return res.status(403).json({ error: "Unauthorized message log" });
  }

  const message: ChatMessage = {
    id: `MSG-${Date.now()}`,
    incidentId,
    sender: sender as "STAKEHOLDER" | "ADMIN",
    text,
    timestamp: new Date().toISOString()
  };

  chatMessages.push(message);

  // Broadcast to all active websockets in this room
  broadcastToRoom(incidentId, message);

  res.status(201).json(message);
});


// Create HTTP server
const server = createHttpServer(app);

// Create WebSocket Server
const wss = new WebSocketServer({ noServer: true });

// Maintain mapping of client connection -> joined incident room
interface ClientSession {
  ws: WebSocket;
  incidentId?: string;
  role?: string;
}

const activeConnections = new Set<ClientSession>();

// Register ws upgrade handler
server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;

  if (pathname === "/api/chat-ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (ws) => {
  const session: ClientSession = { ws };
  activeConnections.add(session);

  ws.on("message", (messageStr) => {
    try {
      const data = JSON.parse(messageStr.toString());

      if (data.type === "join") {
        const { incidentId, accessCode, role } = data;
        const incident = incidents.find(i => i.id === incidentId);

        if (!incident) {
          ws.send(JSON.stringify({ type: "error", message: "Target concern report not found." }));
          return;
        }

        // Validate access
        if (role !== "ADMIN" && incident.chatAccessCode !== accessCode) {
          ws.send(JSON.stringify({ type: "error", message: "Invalid chat access credentials." }));
          return;
        }

        session.incidentId = incidentId;
        session.role = role;
        
        ws.send(JSON.stringify({ 
          type: "joined", 
          incidentId,
          messages: chatMessages.filter(m => m.incidentId === incidentId)
        }));
      } 
      
      else if (data.type === "message") {
        const { incidentId, sender, text, accessCode } = data;
        
        const incident = incidents.find(i => i.id === incidentId);
        if (!incident) return;

        if (sender !== "ADMIN" && incident.chatAccessCode !== accessCode) {
          ws.send(JSON.stringify({ type: "error", message: "Unauthorized send token." }));
          return;
        }

        const newMessage: ChatMessage = {
          id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          incidentId,
          sender: sender as "STAKEHOLDER" | "ADMIN",
          text,
          timestamp: new Date().toISOString()
        };

        chatMessages.push(newMessage);

        // Broadcast to everyone connected to this incident
        broadcastToRoom(incidentId, newMessage);
      }
    } catch (e) {
      console.error("WS error parsing message:", e);
    }
  });

  ws.on("close", () => {
    activeConnections.delete(session);
  });
});

// Helper to broadcast WS packets to all clients in a specfied incident room
function broadcastToRoom(incidentId: string, message: ChatMessage) {
  const packet = JSON.stringify({
    type: "message",
    message
  });

  for (const session of activeConnections) {
    if (session.incidentId === incidentId && session.ws.readyState === WebSocket.OPEN) {
      session.ws.send(packet);
    }
  }
}

// Vite integration
async function integrateVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start listening
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[ISKOncern Server] Running on http://localhost:${PORT}`);
  });
}

integrateVite();
