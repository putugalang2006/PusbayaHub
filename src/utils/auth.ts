/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Role, UserSession } from "../types";

// Key for session storage (active session)
const SESSION_KEY = "pusbaya_net_session";

// Key for local storage (user history list)
const USERS_HISTORY_KEY = "pusbaya_net_users_history";

/**
 * Saves a user session to sessionStorage
 */
export function saveUser(session: UserSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  
  // Also add to historical user list in localStorage to support loadUsers()
  const history = loadUsers();
  if (!history.some(u => u.nama.toLowerCase() === session.nama.toLowerCase())) {
    const updatedHistory = [...history, { nama: session.nama, role: session.role, lastLogin: session.loginAt }];
    localStorage.setItem(USERS_HISTORY_KEY, JSON.stringify(updatedHistory));
  }
}

/**
 * Performs login and saves session
 */
export function login(nama: string, role: Role): UserSession {
  const session: UserSession = {
    nama,
    role,
    loginAt: new Date().toISOString(),
  };
  saveUser(session);
  return session;
}

/**
 * Performs logout and clears active session
 */
export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
  // Remove from localStorage as well to be fully clean, but keep history list
  localStorage.removeItem("pusbaya_net_session"); 
}

/**
 * Checks the role of the current session
 */
export function checkRole(session: UserSession | null): Role | null {
  if (!session) return null;
  return session.role;
}

/**
 * Checks if the user is authorized to edit data
 */
export function canEdit(session: UserSession | null): boolean {
  return checkRole(session) === "admin";
}

/**
 * Checks if the user is authorized to delete data
 */
export function canDelete(session: UserSession | null): boolean {
  return checkRole(session) === "admin";
}

/**
 * Checks if the user is authorized to access administrative areas/features
 */
export function canAccessAdmin(session: UserSession | null): boolean {
  return checkRole(session) === "admin";
}

/**
 * Loads the list of users who have logged into this application (saved in localStorage)
 */
export interface HistoricalUser {
  nama: string;
  role: Role;
  lastLogin: string;
}

export function loadUsers(): HistoricalUser[] {
  const stored = localStorage.getItem(USERS_HISTORY_KEY);
  if (!stored) {
    // Default initial historical users for demonstration/beauty
    return [
      { nama: "Admin", role: "admin", lastLogin: new Date().toISOString() },
      { nama: "I Putu Gede Astawa", role: "user", lastLogin: new Date().toISOString() }
    ];
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}
