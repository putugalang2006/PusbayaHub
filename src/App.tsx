/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Heart } from "lucide-react";
import { Anggota, UserSession, Role } from "./types";
import { INITIAL_ANGGOTA_DATA } from "./constants";
import { login, logout, canEdit, canDelete } from "./utils/auth";
import Login from "./components/Login";
import Navigation, { TabName } from "./components/Navigation";
import DashboardStats from "./components/DashboardStats";
import DaftarPengguna from "./components/DaftarPengguna";
import FormAnggota from "./components/FormAnggota";
import RekapData from "./components/RekapData";
import { onSnapshotAnggota, saveAnggota, deleteAnggota } from "./lib/db";

export default function App() {
  // Session State
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const stored = sessionStorage.getItem("pusbaya_net_session");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    // Fallback/Backward compatibility for existing local sessions
    const localStored = localStorage.getItem("pusbaya_net_session");
    if (localStored) {
      try {
        const parsed = JSON.parse(localStored);
        sessionStorage.setItem("pusbaya_net_session", localStored);
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Unauthorized Warning Dialog State
  const [unauthorizedError, setUnauthorizedError] = useState<string | null>(null);

  // Offline State Handler
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Anggota List State (Seed with authentic Balinese members, then fetch from database)
  const [anggotaList, setAnggotaList] = useState<Anggota[]>(INITIAL_ANGGOTA_DATA);

  // UI Navigation & Dialog States
  const [activeTab, setActiveTab] = useState<TabName>("dashboard");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnggota, setEditingAnggota] = useState<Anggota | null>(null);

  // Time & Clock state for admin aesthetics
  const [currentTime, setCurrentTime] = useState(new Date());

  // Toast Notification State
  const [toast, setToast] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  } | null>(null);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to real-time database updates
  useEffect(() => {
    const unsubscribe = onSnapshotAnggota(
      (data) => {
        setAnggotaList(data);
        setIsOffline(false);
      },
      (err) => {
        console.error("Connection error:", err);
        setIsOffline(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Show Toast helper
  const showToastNotification = (title: string, message: string) => {
    setToast({
      isOpen: true,
      title,
      message,
    });
    setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  // Handle Login
  const handleLogin = (nama: string, role: Role) => {
    const session = login(nama, role);
    setUserSession(session);
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    setUserSession(null);
    setActiveTab("dashboard");
  };

  // Add / Edit Action Handler
  const handleSaveAnggota = async (
    data: Omit<Anggota, "id" | "createdAt"> & { id?: string }
  ) => {
    if (data.id) {
      // Security role validation before edit
      if (!canEdit(userSession)) {
        setUnauthorizedError("Anda tidak memiliki izin untuk mengubah data anggota. Tindakan ini hanya diperbolehkan untuk akun Admin.");
        return;
      }
    }

    try {
      await saveAnggota(data);
      showToastNotification("Berhasil", "Data anggota berhasil disimpan.");
      setIsFormOpen(false);
      setEditingAnggota(null);
      if (!data.id) {
        // Redirect to Daftar Anggota tab after 1.5 seconds
        setTimeout(() => {
          setActiveTab("anggota");
        }, 1500);
      }
    } catch (e) {
      console.error(e);
      showToastNotification("Gagal", "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
      setIsOffline(true);
    }
  };

  const handleOpenAddForm = () => {
    setEditingAnggota(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (anggota: Anggota) => {
    // Check permission to open edit form
    if (!canEdit(userSession)) {
      setUnauthorizedError("Anda tidak memiliki izin untuk mengubah data anggota. Tindakan ini hanya diperbolehkan untuk akun Admin.");
      return;
    }
    setEditingAnggota(anggota);
    setIsFormOpen(true);
  };

  const handleDeleteAnggota = async (id: string) => {
    // Security role validation before delete
    if (!canDelete(userSession)) {
      setUnauthorizedError("Anda tidak memiliki izin untuk menghapus data anggota. Tindakan ini hanya diperbolehkan untuk akun Admin.");
      return;
    }

    try {
      await deleteAnggota(id);
      showToastNotification("Berhasil", "Data anggota berhasil dihapus.");
    } catch (e) {
      console.error(e);
      showToastNotification("Gagal", "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
      setIsOffline(true);
    }
  };

  // Dashboard Direct Addition Handler
  const handleAddAnggotaFromDashboard = async (data: Omit<Anggota, "id" | "createdAt">) => {
    try {
      await saveAnggota(data);
      showToastNotification("Berhasil", "Data anggota berhasil disimpan.");
      
      // Redirect to Daftar Anggota tab after 1.5 seconds
      setTimeout(() => {
        setActiveTab("anggota");
      }, 1500);
    } catch (e) {
      console.error(e);
      showToastNotification("Gagal", "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
      setIsOffline(true);
    }
  };

  // Formatted Date Indonesian Style
  const formatIndonesianDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // If not logged in, render Login Page
  if (!userSession) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div id="app-root-container" className="min-h-screen bg-dark-950 flex flex-col md:flex-row font-sans text-white">
      {/* Sidebar Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={userSession.nama}
        userRole={userSession.role}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col min-w-0 bg-[#06090c]">
        {/* Desktop Navbar (Top Bar - Luxury Semi-Transparent dark) */}
        <header id="desktop-top-navbar" className="hidden md:flex items-center justify-between px-8 py-5 bg-dark-950/80 border-b border-gold-500/10 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h1 id="page-title" className="font-display font-black text-xl text-white tracking-tight capitalize">
              {activeTab === "dashboard"
                ? "Dashboard Analitik"
                : activeTab === "anggota"
                ? "Kelola Anggota"
                : "Rekap Data Laporan"}
            </h1>
            <p id="page-subtitle" className="font-display text-gold-400/90 text-xs font-black uppercase tracking-widest mt-0.5">
              SISTEM PENDATAAN ANGGOTA ST PUSBAYA
            </p>
          </div>

          {/* Clock Widget */}
          <div id="header-clock-widget" className="flex items-center gap-3 bg-dark-900 border border-gold-500/10 px-4 py-2 rounded-xl text-slate-300 shadow-md">
            <Clock className="w-4 h-4 text-gold-400 animate-pulse" />
            <div className="text-right">
              <span id="clock-date" className="text-xs font-bold text-white block leading-none">
                {formatIndonesianDate(currentTime)}
              </span>
              <span id="clock-time" className="text-[10px] font-bold text-gold-400 block mt-0.5 tracking-widest font-mono">
                {currentTime.toLocaleTimeString("id-ID")} WITA
              </span>
            </div>
          </div>
        </header>

        {/* Inner Content Wrap */}
        <div id="content-inner-scroll" className="p-4 md:p-8 flex-1 overflow-y-auto space-y-6">
          {/* Global Offline Banner */}
          <AnimatePresence>
            {isOffline && (
              <motion.div
                id="global-offline-banner"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 p-4 bg-red-950/80 border border-red-500/30 rounded-2xl flex items-start gap-3.5 shadow-lg relative z-10"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
                    Koneksi Terputus
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  </h4>
                  <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
                    Tidak dapat terhubung ke server. Periksa koneksi internet Anda.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                id="dashboard-view-container"
                key="dashboard-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <DashboardStats
                  anggotaList={anggotaList}
                  onNavigateToMembers={() => setActiveTab("anggota")}
                  onAddAnggota={handleAddAnggotaFromDashboard}
                  userSession={userSession}
                  isOffline={isOffline}
                />
              </motion.div>
            )}
            {activeTab === "anggota" && (
              <motion.div
                id="anggota-view-container"
                key="anggota-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <DaftarPengguna
                  anggotaList={anggotaList}
                  onAddClick={handleOpenAddForm}
                  onEditClick={handleOpenEditForm}
                  onDelete={handleDeleteAnggota}
                  isAdmin={userSession.role === "admin"}
                  isOffline={isOffline}
                />
              </motion.div>
            )}
            {activeTab === "rekap" && (
              <motion.div
                id="rekap-view-container"
                key="rekap-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {userSession.role === "admin" ? (
                  <RekapData
                    anggotaList={anggotaList}
                    userSession={userSession}
                  />
                ) : (
                  <div className="bg-dark-900 border border-red-500/20 p-8 rounded-2xl text-center space-y-4 max-w-md mx-auto my-12 shadow-lg">
                    <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                      </svg>
                    </div>
                    <h3 className="font-display font-black text-white text-lg">Akses Ditolak</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      Anda tidak memiliki izin untuk mengakses fitur ini.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer id="app-footer" className="bg-dark-950/90 border-t border-gold-500/10 px-8 py-5 text-center md:text-left flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-widest gap-3">
          <span id="footer-copyright">
            © 2026 PUSBAYA HUB • Sistem Administrasi Anggota Organisasi
          </span>
          <span id="footer-signature" className="flex items-center gap-1.5">
            Dibuat untuk <Heart className="w-3.5 h-3.5 text-gold-500 fill-gold-500 animate-pulse" /> Harmoni Banjar Adat
          </span>
        </footer>
      </main>

      {/* Form Dialog for Add/Edit (Modal) */}
      <FormAnggota
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAnggota(null);
        }}
        onSave={handleSaveAnggota}
        editingAnggota={editingAnggota}
        isOffline={isOffline}
      />

      {/* Modern Toast Notification Overlay */}
      <AnimatePresence>
        {toast && toast.isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-dark-900 border border-gold-500/20 rounded-2xl shadow-2xl p-4 flex items-start gap-3.5"
          >
            {/* Green Check Icon */}
            <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>

            {/* Title & Message */}
            <div className="flex-1">
              <h5 className="font-display font-black text-sm text-white">
                {toast.title}
              </h5>
              <p className="text-slate-400 text-xs font-bold mt-0.5">
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setToast(null)}
              className="text-slate-500 hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unauthorized Access Modern Dialog Overlay */}
      <AnimatePresence>
        {unauthorizedError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUnauthorizedError(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-dark-900 rounded-2xl w-full max-w-md shadow-2xl border border-red-500/20 p-8 relative z-10 space-y-6 text-center"
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                </svg>
              </div>

              <div className="space-y-2">
                <h4 className="font-display font-black text-lg text-white">
                  Akses Ditolak
                </h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  {unauthorizedError}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setUnauthorizedError(null)}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer"
                >
                  Dimengerti
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
