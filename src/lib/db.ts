/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Anggota } from "../types";

let supabaseInstance: SupabaseClient | null = null;
let supabasePromise: Promise<SupabaseClient | null> | null = null;

/**
 * Lazily fetches configuration from Express backend and initializes Supabase client.
 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  if (supabaseInstance) return supabaseInstance;

  if (!supabasePromise) {
    supabasePromise = (async () => {
      try {
        const response = await fetch("/api/config");
        if (!response.ok) {
          throw new Error("Gagal mengambil konfigurasi database dari server");
        }
        const config = await response.json();
        
        const url = config.supabaseUrl;
        const key = config.supabaseAnonKey;

        if (!url || !key) {
          console.warn("Konfigurasi Supabase (SUPABASE_URL / SUPABASE_ANON_KEY) tidak ditemukan di server.");
          return null;
        }

        supabaseInstance = createClient(url, key);
        return supabaseInstance;
      } catch (err) {
        console.error("Gagal inisialisasi Supabase client:", err);
        return null;
      }
    })();
  }

  const client = await supabasePromise;
  if (!client) {
    throw new Error(
      "Supabase belum dikonfigurasi. Silakan tambahkan environment variable SUPABASE_URL dan SUPABASE_ANON_KEY di menu Secrets."
    );
  }
  return client;
}

/**
 * Perform a real connection check to the database.
 * Returns true if connection succeeds, false otherwise.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from("Anggota")
      .select("id")
      .limit(1);

    if (error) {
      console.warn("Supabase query test failed:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("Express / Supabase connection check failed:", error);
    return false;
  }
}

/**
 * Fetch all members from Supabase table 'Anggota'.
 */
export async function getAnggotaList(): Promise<Anggota[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("Anggota")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil data Anggota: ${error.message}`);
  }

  if (!data) return [];

  // Map backend columns back to frontend types
  return data.map((item: any) => ({
    id: item.id,
    nama: item.nama,
    whatsapp: item.whatsapp,
    alamatLengkap: item.alamat || "",
    tempekan: item.tempekan,
    createdAt: item.created_at,
    dibuatOleh: item.dibuat_oleh,
    updatedAt: item.updated_at,
  })) as Anggota[];
}

/**
 * Listen to real-time updates for Anggota List.
 * Employs Supabase Realtime subscription.
 */
export function onSnapshotAnggota(
  callback: (data: Anggota[]) => void,
  onError: (err: any) => void
): () => void {
  let isCancelled = false;
  let channel: any = null;

  const setupSubscription = async () => {
    try {
      // 1. Send initial data fetch
      const initialData = await getAnggotaList();
      if (isCancelled) return;
      callback(initialData);

      // 2. Setup real-time postgres changes subscription
      const supabase = await getSupabaseClient();
      if (isCancelled) return;

      channel = supabase
        .channel("public:Anggota")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "Anggota",
          },
          async (payload: any) => {
            console.log("Realtime event received from Supabase:", payload);
            if (isCancelled) return;
            try {
              const latestData = await getAnggotaList();
              if (!isCancelled) {
                callback(latestData);
              }
            } catch (err) {
              console.warn("Gagal memperbarui data real-time:", err);
            }
          }
        )
        .subscribe((status: string) => {
          if (status === "CHANNEL_ERROR") {
            console.warn("Saluran Realtime Supabase mengalami error. Pastikan tabel 'anggota' telah mengaktifkan Realtime Replication di dashboard Supabase.");
          }
        });
    } catch (err: any) {
      console.warn("Gagal inisialisasi langganan real-time:", err.message || err);
      onError(err);
    }
  };

  setupSubscription();

  return () => {
    isCancelled = true;
    if (channel) {
      channel.unsubscribe();
    }
  };
}

/**
 * Add or Edit a member record.
 * Handles saving to Supabase 'anggota' table.
 */
export async function saveAnggota(
  data: Omit<Anggota, "id" | "createdAt"> & { id?: string; createdAt?: string; dibuatOleh?: string }
): Promise<void> {
  const supabase = await getSupabaseClient();

  // Validate inputs
  if (!data.nama || !data.nama.trim()) {
    throw new Error("Nama Lengkap wajib diisi.");
  }
  if (!data.whatsapp || !data.whatsapp.trim()) {
    throw new Error("Nomor WhatsApp wajib diisi.");
  }
  if (!data.alamatLengkap || !data.alamatLengkap.trim()) {
    throw new Error("Alamat Lengkap wajib diisi.");
  }
  if (!data.tempekan) {
    throw new Error("Tempekan wajib dipilih.");
  }

  // Map frontend properties to backend snake_case table columns
  const record = {
    nama: data.nama.trim(),
    whatsapp: data.whatsapp.trim(),
    alamat: data.alamatLengkap.trim(),
    tempekan: data.tempekan,
    dibuat_oleh: data.dibuatOleh || "Admin",
    updated_at: new Date().toISOString(),
  };

  if (data.id) {
    // Update existing member record
    const { error } = await supabase
      .from("Anggota")
      .update(record)
      .eq("id", data.id);

    if (error) {
      throw new Error(`Gagal memperbarui data anggota: ${error.message}`);
    }
  } else {
    // Insert new member record (let Supabase generate UUID automatically if no ID is passed)
    const newRecord = {
      ...record,
      created_at: data.createdAt || new Date().toISOString(),
    };
    const { error } = await supabase
      .from("Anggota")
      .insert([newRecord]);

    if (error) {
      throw new Error(`Gagal menyimpan data anggota baru: ${error.message}`);
    }
  }
}

/**
 * Delete a member record.
 * Handles deleting from Supabase 'anggota' table.
 */
export async function deleteAnggota(id: string): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("Anggota")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Gagal menghapus data anggota: ${error.message}`);
  }
}
