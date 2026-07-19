import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

const DATA_FILE = path.join(process.cwd(), "data", "members.json");

// Ensure directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Initial seed data
const INITIAL_ANGGOTA_DATA = [
  {
    id: "1",
    nama: "I Putu Gede Astawa",
    whatsapp: "081234567890",
    alamatLengkap: "Jl. Raya Kerobokan No. 4, Banjar Tegal Jaya, Kuta Utara, Badung",
    tempekan: "Tempek Kauh Kelod",
    createdAt: "2026-07-10T10:00:00.000Z"
  },
  {
    id: "2",
    nama: "Ni Kadek Windasari",
    whatsapp: "081987654321",
    alamatLengkap: "Jl. Mertanadi No. 12, Banjar Tegal Jaya, Kuta Utara, Badung",
    tempekan: "Tempek Dangin Daja",
    createdAt: "2026-07-12T14:30:00.000Z"
  },
  {
    id: "3",
    nama: "I Made Dwi Cahyadi",
    whatsapp: "081333444555",
    alamatLengkap: "Jl. Sunset Road No. 8, Banjar Kauh Mandara, Seminyak, Badung",
    tempekan: "Tempek Kauh Kaja",
    createdAt: "2026-07-15T09:15:00.000Z"
  },
  {
    id: "4",
    nama: "Ni Nyoman Sri Wahyuni",
    whatsapp: "081222333444",
    alamatLengkap: "Jl. Gajah Mada No. 1A, Banjar Dangin Puri, Denpasar",
    tempekan: "Tempek Dangin Kelod",
    createdAt: "2026-07-18T11:00:00.000Z"
  }
];

// Helper to read database
function readMembers(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading members:", error);
  }
  return INITIAL_ANGGOTA_DATA;
}

// Helper to write database
function writeMembers(members: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing members:", error);
  }
}

// SSE clients storage
let clients: { id: number; res: any }[] = [];

// Broadcast updates to all clients
function broadcastUpdate() {
  const currentMembers = readMembers();
  const payload = JSON.stringify({ type: "update", data: currentMembers });
  clients.forEach((client) => {
    client.res.write(`data: ${payload}\n\n`);
  });
}

// REST API Routes

// Get all members
app.get("/api/anggota", (req, res) => {
  res.json(readMembers());
});

// Real-time SSE stream
app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const client = { id: Date.now(), res };
  clients.push(client);

  // Send initial data immediately
  const initialData = readMembers();
  res.write(`data: ${JSON.stringify({ type: "initial", data: initialData })}\n\n`);

  req.on("close", () => {
    clients = clients.filter((c) => c.id !== client.id);
  });
});

// Save or Update member
app.post("/api/anggota", (req, res) => {
  const { id, nama, whatsapp, alamatLengkap, tempekan, userRole } = req.body;

  if (!nama || !whatsapp || !alamatLengkap || !tempekan) {
    return res.status(400).json({ error: "Data tidak lengkap" });
  }

  let members = readMembers();

  if (id) {
    // Edit existing member - requires admin role
    if (userRole !== "admin") {
      return res.status(403).json({ error: "Anda tidak memiliki izin untuk mengubah data anggota. Tindakan ini hanya diperbolehkan untuk akun Admin." });
    }

    const index = members.findIndex((m) => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Anggota tidak ditemukan" });
    }

    members[index] = {
      ...members[index],
      nama,
      whatsapp,
      alamatLengkap,
      tempekan,
    };
  } else {
    // Create new member - allowed for any role
    const newAnggota = {
      id: Date.now().toString(),
      nama,
      whatsapp,
      alamatLengkap,
      tempekan,
      createdAt: new Date().toISOString(),
    };
    members = [newAnggota, ...members];
  }

  writeMembers(members);
  broadcastUpdate();

  res.json({ success: true });
});

// Delete member
app.delete("/api/anggota/:id", (req, res) => {
  const { id } = req.params;
  const userRole = req.headers["x-user-role"];

  if (userRole !== "admin") {
    return res.status(403).json({ error: "Anda tidak memiliki izin untuk menghapus data anggota. Tindakan ini hanya diperbolehkan untuk akun Admin." });
  }

  let members = readMembers();
  const index = members.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Anggota tidak ditemukan" });
  }

  members = members.filter((m) => m.id !== id);
  writeMembers(members);
  broadcastUpdate();

  res.json({ success: true });
});

// Keep-alive timer for SSE to prevent timeouts
const keepAliveInterval = setInterval(() => {
  clients.forEach((client) => {
    client.res.write(": keep-alive\n\n");
  });
}, 15000);

// Graceful cleanup
process.on("SIGTERM", () => {
  clearInterval(keepAliveInterval);
});

async function setupAndStart() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupAndStart();
