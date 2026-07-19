import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request body parsing
  app.use(express.json());

  // Define database file path
  const DATA_DIR = path.join(process.cwd(), "data");
  const DB_FILE = path.join(DATA_DIR, "anggota.json");

  // Ensure data directory and file exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Initial template data matching INITIAL_ANGGOTA_DATA
  const INITIAL_DATA = [
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

  const getAnggotaData = (): any[] => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, "utf-8");
        return JSON.parse(content);
      }
    } catch (e) {
      console.error("Error reading db file, returning initial", e);
    }
    // Write initial data if file doesn't exist or is invalid
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), "utf-8");
    } catch (writeErr) {
      console.error("Failed to write initial db file", writeErr);
    }
    return INITIAL_DATA;
  };

  let clients: any[] = [];

  const notifyClients = () => {
    const data = getAnggotaData();
    const payload = JSON.stringify(data);
    clients.forEach((client) => {
      client.write(`data: ${payload}\n\n`);
    });
  };

  const saveAnggotaData = (data: any[]) => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
      notifyClients(); // broadcast changes to all clients in real-time
      return true;
    } catch (e) {
      console.error("Error writing db file", e);
      return false;
    }
  };

  // API Endpoints
  app.get("/api/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // send initial ping or data
    res.write("data: ping\n\n");

    // add client
    clients.push(res);

    req.on("close", () => {
      clients = clients.filter((client) => client !== res);
    });
  });

  app.get("/api/anggota", (req, res) => {
    const data = getAnggotaData();
    res.json(data);
  });

  app.post("/api/anggota", (req, res) => {
    const newMember = req.body;
    if (!newMember.nama) {
      return res.status(400).json({ error: "Nama is required" });
    }
    const currentData = getAnggotaData();
    const createdMember = {
      ...newMember,
      id: newMember.id || Date.now().toString(),
      createdAt: newMember.createdAt || new Date().toISOString()
    };
    currentData.unshift(createdMember); // add to front
    saveAnggotaData(currentData);
    res.status(201).json(createdMember);
  });

  app.put("/api/anggota/:id", (req, res) => {
    const id = req.params.id;
    const updatedFields = req.body;
    const currentData = getAnggotaData();
    let found = false;
    const updatedData = currentData.map((item) => {
      if (item.id === id) {
        found = true;
        return {
          ...item,
          ...updatedFields,
          id // keep original id
        };
      }
      return item;
    });

    if (!found) {
      return res.status(404).json({ error: "Member not found" });
    }

    saveAnggotaData(updatedData);
    res.json(updatedData.find((item) => item.id === id));
  });

  app.delete("/api/anggota/:id", (req, res) => {
    const id = req.params.id;
    const currentData = getAnggotaData();
    const filteredData = currentData.filter((item) => item.id !== id);
    if (filteredData.length === currentData.length) {
      return res.status(404).json({ error: "Member not found" });
    }
    saveAnggotaData(filteredData);
    res.json({ success: true });
  });

  // Vite middleware for development
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

startServer();
