import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load local environment variables if available
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request body parsing
  app.use(express.json());

  // Log Supabase configuration presence
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      "PERINGATAN: Environment variable SUPABASE_URL atau SUPABASE_ANON_KEY belum dikonfigurasi.\n" +
      "Silakan atur nilai ini di pengaturan Secrets atau di file .env agar Supabase dapat terhubung."
    );
  } else {
    console.log("Koneksi Supabase siap dikonfigurasi pada sisi klien.");
  }

  // API endpoint to retrieve Supabase client-side configuration
  app.get("/api/config", (req, res) => {
    res.json({
      supabaseUrl: process.env.SUPABASE_URL || "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    });
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
    console.log(`Server PUSBAYA HUB berjalan di http://localhost:${PORT}`);
  });
}

startServer();
