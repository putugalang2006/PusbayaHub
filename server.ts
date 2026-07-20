import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Read Environment variables with defaults for instant out-of-the-box operation
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbx_IasX1T1V-C74RkC9HbeTjL_M4O8KstKREKk3P7FhYre62g8PshgK-T4I5I_Ym1lB/exec";
const GOOGLE_SCRIPT_API_KEY = process.env.GOOGLE_SCRIPT_API_KEY || "pusbaya-secret-token-123";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request body parsing
  app.use(express.json());

  // Define local database cache file path
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
      dibuatOleh: "Sistem",
      createdAt: "2026-07-10T10:00:00.000Z",
      updatedAt: "2026-07-10T10:00:00.000Z"
    },
    {
      id: "2",
      nama: "Ni Kadek Windasari",
      whatsapp: "081987654321",
      alamatLengkap: "Jl. Mertanadi No. 12, Banjar Tegal Jaya, Kuta Utara, Badung",
      tempekan: "Tempek Dangin Daja",
      dibuatOleh: "Sistem",
      createdAt: "2026-07-12T14:30:00.000Z",
      updatedAt: "2026-07-12T14:30:00.000Z"
    },
    {
      id: "3",
      nama: "I Made Dwi Cahyadi",
      whatsapp: "081333444555",
      alamatLengkap: "Jl. Sunset Road No. 8, Banjar Kauh Mandara, Seminyak, Badung",
      tempekan: "Tempek Kauh Kaja",
      dibuatOleh: "Sistem",
      createdAt: "2026-07-15T09:15:00.000Z",
      updatedAt: "2026-07-15T09:15:00.000Z"
    },
    {
      id: "4",
      nama: "Ni Nyoman Sri Wahyuni",
      whatsapp: "081222333444",
      alamatLengkap: "Jl. Gajah Mada No. 1A, Banjar Dangin Puri, Denpasar",
      tempekan: "Tempek Dangin Kelod",
      dibuatOleh: "Sistem",
      createdAt: "2026-07-18T11:00:00.000Z",
      updatedAt: "2026-07-18T11:00:00.000Z"
    }
  ];

  // Read local file cache safely
  const getLocalAnggotaData = (): any[] => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error reading local DB file:", e);
    }
    
    // Write initial data if local file is missing or invalid
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), "utf-8");
    } catch (writeErr) {
      console.error("Failed to write initial DB file:", writeErr);
    }
    return INITIAL_DATA;
  };

  // SSE Connections storage
  let clients: any[] = [];

  // Notify SSE clients with a specific dataset
  const broadcastToClients = (data: any[]) => {
    const payload = JSON.stringify(data);
    clients.forEach((client) => {
      try {
        client.write(`data: ${payload}\n\n`);
      } catch (err) {
        console.warn("Failed broadcasting to client:", err);
      }
    });
  };

  // Safe Fetch JSON helper to handle non-JSON / HTML responses gracefully (e.g. Google auth login screen, redirection, or 404 pages)
  const safeFetchJson = async (url: string, options?: RequestInit): Promise<any> => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Google Apps Script API mengembalikan status HTTP ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const trimmed = text.trim();

    // Check if the response contains HTML (usually starting with <!DOCTYPE html or <html)
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
      throw new Error(
        "Google Apps Script mengembalikan halaman HTML, bukan JSON. " +
        "Ini biasanya menandakan Google Web App di-deploy dengan pengaturan akses terbatas " +
        "(memerlukan login Akun Google). Silakan ubah pengaturan 'Who has access' ke 'Anyone' saat mendeploy ulang Web App."
      );
    }

    try {
      return JSON.parse(text);
    } catch (parseErr) {
      throw new Error(`Respons dari Google Apps Script tidak valid atau kosong. Isi respons: ${trimmed.slice(0, 100)}...`);
    }
  };

  // Sync Google Sheets with the local DB cache file and broadcast updates
  const syncGoogleSheetsWithLocal = async (): Promise<any[]> => {
    try {
      const url = `${GOOGLE_SCRIPT_URL}?token=${encodeURIComponent(GOOGLE_SCRIPT_API_KEY)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const result = await safeFetchJson(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (result && result.status === "success" && Array.isArray(result.data)) {
        // Compare with existing cache to avoid unnecessary writes/broadcasts
        const currentLocal = getLocalAnggotaData();
        if (JSON.stringify(currentLocal) !== JSON.stringify(result.data)) {
          console.log(`Syncing Google Sheets with local cache. Found ${result.data.length} records.`);
          fs.writeFileSync(DB_FILE, JSON.stringify(result.data, null, 2), "utf-8");
          broadcastToClients(result.data);
        }
        return result.data;
      }
    } catch (e: any) {
      console.warn("Gagal mensinkronisasikan Google Sheets dengan cache lokal (menggunakan database cadangan):", e.message || e);
    }
    return getLocalAnggotaData();
  };

  // Run initial sync on startup
  console.log("Running initial Google Sheets database synchronization...");
  syncGoogleSheetsWithLocal().catch((e) => console.error("Initial startup sync failed:", e));

  // Periodically poll Google Sheets every 15 seconds to discover external edits and push them to SSE clients
  setInterval(async () => {
    if (clients.length > 0) {
      console.log("Active web sessions detected. Syncing Google Sheets...");
      await syncGoogleSheetsWithLocal();
    }
  }, 15000);

  // API Endpoints

  // Server-Sent Events for real-time state synchronization
  app.get("/api/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Send initial connection verification ping
    res.write("data: ping\n\n");

    // Immediately push the current cache to the newly connected user
    const currentData = getLocalAnggotaData();
    res.write(`data: ${JSON.stringify(currentData)}\n\n`);

    // Register active SSE client
    clients.push(res);

    // Keep connection alive with periodic pings every 15 seconds
    const pingInterval = setInterval(() => {
      try {
        res.write("data: ping\n\n");
      } catch (err) {
        // Safe to ignore, handled on close
      }
    }, 15000);

    req.on("close", () => {
      clearInterval(pingInterval);
      clients = clients.filter((client) => client !== res);
    });
  });

  // Get members list (trigger Google Sheets sync, return data)
  app.get("/api/anggota", async (req, res) => {
    const data = await syncGoogleSheetsWithLocal();
    res.json(data);
  });

  // Create new member in Google Sheets
  app.post("/api/anggota", async (req, res) => {
    const newMember = req.body;
    if (!newMember.nama) {
      return res.status(400).json({ error: "Nama Lengkap wajib diisi" });
    }

    const id = "MEM-" + Math.floor(Math.random() * 1000000000).toString();
    const createdAt = newMember.createdAt || new Date().toISOString();

    const payload = {
      action: "CREATE",
      id,
      nama: newMember.nama,
      whatsapp: newMember.whatsapp || "",
      alamatLengkap: newMember.alamatLengkap || "",
      tempekan: newMember.tempekan || "",
      dibuatOleh: newMember.dibuatOleh || "Admin",
      createdAt
    };

    try {
      console.log(`Saving new member "${newMember.nama}" to Google Sheets...`);
      const url = `${GOOGLE_SCRIPT_URL}?token=${encodeURIComponent(GOOGLE_SCRIPT_API_KEY)}`;
      const result = await safeFetchJson(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (result && result.status === "success") {
        console.log("Saved successfully! Syncing local cache...");
        const latestData = await syncGoogleSheetsWithLocal();
        const createdObj = latestData.find((d) => d.id === id) || result.data;
        return res.status(201).json(createdObj);
      } else {
        throw new Error(result.message || "Unknown error response from Apps Script");
      }
    } catch (e: any) {
      console.warn("Google Sheets write failed. Writing to local cache fallback...", e.message || e);
      // Fallback: Write locally so offline changes are preserved
      const currentData = getLocalAnggotaData();
      const createdObj = {
        id,
        nama: newMember.nama,
        whatsapp: newMember.whatsapp || "",
        alamatLengkap: newMember.alamatLengkap || "",
        tempekan: newMember.tempekan || "",
        dibuatOleh: newMember.dibuatOleh || "Admin",
        createdAt,
        updatedAt: createdAt
      };
      currentData.unshift(createdObj);
      fs.writeFileSync(DB_FILE, JSON.stringify(currentData, null, 2), "utf-8");
      broadcastToClients(currentData);
      return res.status(201).json(createdObj);
    }
  });

  // Update existing member in Google Sheets
  app.put("/api/anggota/:id", async (req, res) => {
    const id = req.params.id;
    const updatedFields = req.body;

    const payload = {
      action: "UPDATE",
      id,
      nama: updatedFields.nama,
      whatsapp: updatedFields.whatsapp,
      alamatLengkap: updatedFields.alamatLengkap,
      tempekan: updatedFields.tempekan,
      dibuatOleh: updatedFields.dibuatOleh
    };

    try {
      console.log(`Updating member ID "${id}" in Google Sheets...`);
      const url = `${GOOGLE_SCRIPT_URL}?token=${encodeURIComponent(GOOGLE_SCRIPT_API_KEY)}`;
      const result = await safeFetchJson(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (result && result.status === "success") {
        console.log("Updated successfully! Syncing local cache...");
        const latestData = await syncGoogleSheetsWithLocal();
        const updatedObj = latestData.find((d) => d.id === id) || result.data;
        return res.json(updatedObj);
      } else {
        throw new Error(result.message || "Unknown error response from Apps Script");
      }
    } catch (e: any) {
      console.warn("Google Sheets update failed. Updating local cache fallback...", e.message || e);
      // Fallback: Update locally so offline changes are preserved
      const currentData = getLocalAnggotaData();
      let found = false;
      const updatedData = currentData.map((item) => {
        if (item.id === id) {
          found = true;
          return {
            ...item,
            ...updatedFields,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });

      if (!found) {
        return res.status(404).json({ error: "Anggota tidak ditemukan" });
      }

      fs.writeFileSync(DB_FILE, JSON.stringify(updatedData, null, 2), "utf-8");
      broadcastToClients(updatedData);
      return res.json(updatedData.find((item) => item.id === id));
    }
  });

  // Delete member from Google Sheets
  app.delete("/api/anggota/:id", async (req, res) => {
    const id = req.params.id;

    const payload = {
      action: "DELETE",
      id
    };

    try {
      console.log(`Deleting member ID "${id}" from Google Sheets...`);
      const url = `${GOOGLE_SCRIPT_URL}?token=${encodeURIComponent(GOOGLE_SCRIPT_API_KEY)}`;
      const result = await safeFetchJson(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (result && result.status === "success") {
        console.log("Deleted successfully from Google Sheets! Syncing local cache...");
        await syncGoogleSheetsWithLocal();
        return res.json({ success: true });
      } else {
        throw new Error(result.message || "Unknown error response from Apps Script");
      }
    } catch (e: any) {
      console.warn("Google Sheets delete failed. Deleting from local cache fallback...", e.message || e);
      // Fallback: Delete locally so offline changes are preserved
      const currentData = getLocalAnggotaData();
      const filteredData = currentData.filter((item) => item.id !== id);
      if (filteredData.length === currentData.length) {
        return res.status(404).json({ error: "Anggota tidak ditemukan" });
      }

      fs.writeFileSync(DB_FILE, JSON.stringify(filteredData, null, 2), "utf-8");
      broadcastToClients(filteredData);
      return res.json({ success: true });
    }
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
