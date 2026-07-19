/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  FileText
} from "lucide-react";
import AppLogo from "./AppLogo";

export type TabName = "dashboard" | "anggota" | "rekap";

interface NavigationProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  userName: string;
  userRole?: "admin" | "user";
  onLogout: () => void;
  connectionStatus?: "connecting" | "online" | "offline";
}

export default function Navigation({
  activeTab,
  onTabChange,
  userName,
  userRole = "user",
  onLogout,
  connectionStatus = "online",
}: NavigationProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    {
      id: "dashboard" as TabName,
      label: "Dashboard",
      icon: Home,
    },
    {
      id: "anggota" as TabName,
      label: "Daftar Pengguna",
      icon: Users,
    },
    ...(userRole === "admin"
      ? [
          {
            id: "rekap" as TabName,
            label: "Rekap Data",
            icon: FileText,
          },
        ]
      : []),
  ];

  const handleTabClick = (tabId: TabName) => {
    onTabChange(tabId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header (Sticky, Dark Glassmorphism) */}
      <header className="sticky top-0 z-40 bg-dark-950/95 backdrop-blur-md border-b border-gold-500/10 px-4 py-3 flex items-center justify-between md:hidden shadow-lg">
        <div className="flex items-center gap-2.5">
          <AppLogo className="w-9 h-9" />
          <div className="flex flex-col">
            <span className="font-display font-black text-md text-white tracking-tight leading-none animate-fade-in">
              PUSBAYA <span className="gold-shimmer-text">HUB</span>
            </span>
            <div className="mt-1 flex items-center gap-1 text-[8px] font-black uppercase tracking-wider">
              {connectionStatus === "connecting" && (
                <span className="text-yellow-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  Hubungkan...
                </span>
              )}
              {connectionStatus === "online" && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              )}
              {connectionStatus === "offline" && (
                <span className="text-red-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  Terputus
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* User badge */}
          <div className="flex flex-col items-end">
            <div className="bg-gold-500/10 border border-gold-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold text-gold-400 max-w-[120px] truncate uppercase tracking-widest leading-none">
              {userName}
            </div>
            <span className="text-[8px] mt-0.5 font-bold flex items-center">
              {userRole === "admin" ? (
                <span className="text-amber-400">🟡 Admin</span>
              ) : (
                <span className="text-blue-400">🔵 Pengguna</span>
              )}
            </span>
          </div>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 rounded-lg bg-dark-800 border border-gold-500/20 text-gold-400 hover:bg-dark-700 transition-colors cursor-pointer"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Overlay and Menu) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Menu container */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 bg-dark-950 flex flex-col justify-between shadow-2xl border-r border-gold-500/10"
            >
              <div className="p-6 space-y-8">
                {/* Brand header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <AppLogo className="w-10 h-10" />
                    <span className="font-display font-black text-lg text-white tracking-tight">
                      PUSBAYA <span className="gold-shimmer-text">HUB</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                 {/* Profile Widget */}
                <div className="bg-dark-900 p-4 rounded-xl border border-gold-500/15 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 text-dark-950 font-black flex items-center justify-center text-sm shadow-md">
                    {userName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gold-400/50 text-[9px] font-bold uppercase tracking-widest">
                      Selamat Datang,
                    </p>
                    <p className="font-black text-white text-sm truncate">{userName}</p>
                    <div className="mt-1 flex items-center">
                      {userRole === "admin" ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                          🟡 Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider">
                          🔵 Pengguna
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                          isActive
                            ? "bg-gold-500/10 text-gold-400 border border-gold-500/20 shadow-inner"
                            : "text-slate-400 hover:bg-dark-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${isActive ? "text-gold-400" : ""}`} />
                          {item.label}
                        </div>
                        {isActive && <ChevronRight className="w-4 h-4 text-gold-400" />}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Logout Area */}
              <div className="p-6 border-t border-gold-500/10 bg-dark-900/40">
                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 font-bold text-sm rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Persistent left panel, Elegant Dark Gold aesthetics) */}
      <aside className="hidden md:flex flex-col justify-between w-64 h-screen sticky top-0 bg-dark-950 border-r border-gold-500/10 flex-shrink-0 z-30">
        <div className="p-6 space-y-8">
          {/* Logo with interactive scaling on hover */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3.5"
          >
            <AppLogo className="w-12 h-12" />
            <div>
              <span className="font-display font-black text-lg text-white tracking-tight block">
                PUSBAYA <span className="gold-shimmer-text">HUB</span>
              </span>
              <span className="text-[9px] text-gold-400/60 font-bold block tracking-widest uppercase -mt-0.5">
                Sistem Pendataan
              </span>
            </div>
          </motion.div>

          {/* User Profile Widget */}
          <div className="bg-dark-900/60 p-4 rounded-xl border border-gold-500/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-600 via-gold-500 to-gold-400 text-dark-950 font-black text-xs flex items-center justify-center shrink-0 shadow-lg shadow-gold-500/5">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gold-400/40 text-[9px] font-bold uppercase tracking-widest leading-none">
                Selamat Datang,
              </p>
              <p className="font-black text-white text-sm mt-1 truncate" title={userName}>
                {userName}
              </p>
              <div className="mt-1.5 flex items-center">
                {userRole === "admin" ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                    🟡 Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider">
                    🔵 Pengguna
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    isActive
                      ? "bg-gold-500/10 text-gold-400 border border-gold-500/20 shadow-md shadow-gold-500/5"
                      : "text-slate-400 hover:bg-dark-900 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? "text-gold-400" : ""}`} />
                    {item.label}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="desktopActiveTab"
                      className="w-1.5 h-5 bg-gold-400 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area with Logout */}
        <div className="p-6 border-t border-gold-500/10 bg-dark-900/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 font-bold text-sm rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
