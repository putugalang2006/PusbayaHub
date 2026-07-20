/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Anggota } from "../types";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

/**
 * Perform a real connection check to the database.
 * Returns true if connection succeeds, false otherwise.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("/api/anggota", { signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  } catch (error) {
    console.warn("Express API connection check failed:", error);
    return false;
  }
}

function setupSseFallback(
  callback: (data: Anggota[]) => void,
  onError: (err: any) => void
): () => void {
  console.log("Listening to real-time updates from Express SSE fallback...");
  
  // Connect to Server Sent Events for instant real-time pushes
  const eventSource = new EventSource("/api/events");
  
  eventSource.onmessage = (event) => {
    if (event.data === "ping") return;
    try {
      const data = JSON.parse(event.data);
      callback(data);
    } catch (e) {
      console.warn("Failed to parse SSE event data", e);
    }
  };

  eventSource.onerror = (err) => {
    // EventSource naturally auto-reconnects on connection drops.
    console.warn("Sinyal koneksi SSE terputus, mencoba menghubungkan kembali secara otomatis...");
    onError(err);
  };

  return () => {
    eventSource.close();
  };
}

/**
 * Listen to real-time updates for Anggota List.
 * Automatically selects Google Sheets real-time SSE Express proxy.
 */
export function onSnapshotAnggota(
  callback: (data: Anggota[]) => void,
  onError: (err: any) => void
): () => void {
  let isCancelled = false;
  let unsubscribeFn: (() => void) | null = null;

  if (isCancelled) return () => {};

  unsubscribeFn = setupSseFallback(callback, onError);

  return () => {
    isCancelled = true;
    if (unsubscribeFn) {
      unsubscribeFn();
    }
  };
}

/**
 * Add or Edit a member record.
 * Handles writing to Google Sheets via Express proxy.
 */
export async function saveAnggota(
  data: Omit<Anggota, "id" | "createdAt"> & { id?: string; createdAt?: string; dibuatOleh?: string }
): Promise<void> {
  const method = data.id ? "PUT" : "POST";
  const url = data.id ? `/api/anggota/${data.id}` : "/api/anggota";
  
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: data.id,
      nama: data.nama,
      whatsapp: data.whatsapp,
      alamatLengkap: data.alamatLengkap,
      tempekan: data.tempekan,
      dibuatOleh: data.dibuatOleh || "Admin",
      createdAt: data.createdAt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save anggota via REST API: ${response.statusText}`);
  }
}

/**
 * Delete a member record.
 * Handles deleting from Google Sheets via Express proxy.
 */
export async function deleteAnggota(id: string): Promise<void> {
  const response = await fetch(`/api/anggota/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete anggota via REST API: ${response.statusText}`);
  }
}
