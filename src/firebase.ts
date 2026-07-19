/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

let db: Firestore | null = null;
let isFirebaseConfigured = false;

// Check if Firebase is actually configured with credentials
if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== "") {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    isFirebaseConfigured = true;
    console.log("Firebase Firestore initialized successfully.");
  } catch (error) {
    console.error("Firebase failed to initialize:", error);
  }
} else {
  console.log("Firebase credentials not configured. Falling back to real-time Express backend.");
}

export { db, isFirebaseConfigured };
