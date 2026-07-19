/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs,
  limit
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { Anggota } from "../types";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
}

/**
 * Perform a real connection check to the database.
 * Returns true if connection succeeds, false otherwise.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "anggota"), limit(1));
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 4000)
      );
      await Promise.race([getDocs(q), timeoutPromise]);
      return true;
    } catch (error) {
      console.warn("Firestore connection check failed:", error);
      return false;
    }
  } else {
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
}

/**
 * Listen to real-time updates for Anggota List.
 * Automatically selects Firebase Firestore or real-time SSE Express fallback.
 */
export function onSnapshotAnggota(
  callback: (data: Anggota[]) => void,
  onError: (err: any) => void
): () => void {
  if (isFirebaseConfigured && db) {
    console.log("Listening to real-time updates from Firebase Firestore...");
    const q = query(collection(db, "anggota"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Anggota[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as Anggota);
        });
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "anggota");
        onError(error);
      }
    );
  } else {
    console.log("Listening to real-time updates from Express SSE fallback...");
    
    // Connect to Server Sent Events for instant real-time pushes
    const eventSource = new EventSource("/api/events");
    
    eventSource.onmessage = (event) => {
      if (event.data === "ping") return;
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (e) {
        console.error("Failed to parse SSE event data", e);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection lost. EventSource will auto-reconnect.", err);
      onError(err);
    };

    return () => {
      eventSource.close();
    };
  }
}

/**
 * Add or Edit a member record.
 * Handles both Firestore write and Express fallback.
 */
export async function saveAnggota(
  data: Omit<Anggota, "id" | "createdAt"> & { id?: string; createdAt?: string }
): Promise<void> {
  if (isFirebaseConfigured && db) {
    const id = data.id || doc(collection(db, "anggota")).id;
    const pathRef = `anggota/${id}`;
    try {
      const docRef = doc(db, "anggota", id);
      const payload = {
        nama: data.nama,
        whatsapp: data.whatsapp,
        alamatLengkap: data.alamatLengkap,
        tempekan: data.tempekan,
        createdAt: data.createdAt || new Date().toISOString(),
      };
      await setDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, pathRef);
      throw error;
    }
  } else {
    const method = data.id ? "PUT" : "POST";
    const url = data.id ? `/api/anggota/${data.id}` : "/api/anggota";
    
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: data.nama,
        whatsapp: data.whatsapp,
        alamatLengkap: data.alamatLengkap,
        tempekan: data.tempekan,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save anggota via REST API: ${response.statusText}`);
    }
  }
}

/**
 * Delete a member record.
 * Handles both Firestore delete and Express fallback.
 */
export async function deleteAnggota(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    const pathRef = `anggota/${id}`;
    try {
      await deleteDoc(doc(db, "anggota", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, pathRef);
      throw error;
    }
  } else {
    const response = await fetch(`/api/anggota/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete anggota via REST API: ${response.statusText}`);
    }
  }
}
