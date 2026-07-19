/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { User, ShieldCheck, KeyRound } from "lucide-react";
import AppLogo from "./AppLogo";
import { Role } from "../types";

interface LoginProps {
  onLogin: (nama: string, role: Role) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<Role>("user");
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRoleChange = (selectedRole: Role) => {
    setRole(selectedRole);
    setError("");
    if (selectedRole === "admin") {
      setNama("Admin");
    } else {
      setNama("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError("Nama wajib diisi untuk masuk.");
      return;
    }

    if (role === "admin") {
      if (nama.trim().toLowerCase() !== "admin") {
        setError("Username Admin salah! Silakan gunakan username 'Admin'.");
        return;
      }
      if (password !== "pusbaya123") {
        setError("Password Admin salah!");
        return;
      }
    }

    setError("");
    onLogin(nama.trim(), role);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-[#06090c] via-[#0f141c] to-[#06090c] p-4 font-sans relative overflow-hidden">
      {/* Premium background gold glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative luxury abstract lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#1a202c_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-dark-900/85 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-gold-500/20 relative z-10"
      >
        <div className="p-8 md:p-10 relative">
          {/* Subtle gold glow line on top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <motion.div
              initial={{ scale: 0.85, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
              className="mb-4"
            >
              <AppLogo className="w-20 h-20" />
            </motion.div>
            
            <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-white">
              PUSBAYA <span className="gold-shimmer-text">HUB</span>
            </h1>
            <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">
              Sistem Pendataan Organisasi
            </p>
            <p className="text-gold-400/70 text-xs font-semibold mt-1">
              Banjar Campuan • Putra Settu Bhakti Jaya
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Pilih Login Sebagai */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gold-400 uppercase tracking-widest">
                Pilih Login Sebagai
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Option: Pengguna */}
                <button
                  type="button"
                  onClick={() => handleRoleChange("user")}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    role === "user"
                      ? "bg-gold-500/10 border-gold-400 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                      : "bg-dark-800/50 border-gold-500/10 text-slate-400 hover:border-gold-500/20 hover:text-slate-300"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Pengguna
                </button>

                {/* Option: Admin */}
                <button
                  type="button"
                  onClick={() => handleRoleChange("admin")}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    role === "admin"
                      ? "bg-gold-500/10 border-gold-400 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                      : "bg-dark-800/50 border-gold-500/10 text-slate-400 hover:border-gold-500/20 hover:text-slate-300"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </button>
              </div>
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <label
                htmlFor="nama"
                className="block text-xs font-bold text-gold-400 uppercase tracking-widest"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gold-500/60 pointer-events-none">
                  <User className="w-5 h-5" />
                </span>
                <input
                  id="nama"
                  type="text"
                  placeholder={role === "admin" ? "Masukkan username Admin..." : "Masukkan nama lengkap..."}
                  value={nama}
                  onChange={(e) => {
                    setNama(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full pl-11 pr-4 py-2.5 bg-dark-800/80 border border-gold-500/20 rounded-xl text-white placeholder-slate-500 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password (hanya ditampilkan jika admin) */}
            {role === "admin" && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-1.5 overflow-hidden"
              >
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-gold-400 uppercase tracking-widest"
                >
                  Password Admin
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gold-500/60 pointer-events-none">
                    <KeyRound className="w-5 h-5" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    placeholder="Masukkan password..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className="w-full pl-11 pr-4 py-2.5 bg-dark-800/80 border border-gold-500/20 rounded-xl text-white placeholder-slate-500 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400 transition-all duration-200"
                  />
                </div>
              </motion.div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-red-400 text-xs font-bold mt-2 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.01, boxShadow: "0 0 20px rgba(212, 175, 55, 0.25)" }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-700 hover:from-gold-500 hover:to-gold-600 text-dark-950 font-black text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold-500/10 mt-2"
            >
              Masuk ke Dashboard
            </motion.button>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-dark-950/90 px-8 py-4 border-t border-gold-500/10 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <p>© 2026 PUSBAYA HUB • Banjar Campuan</p>
        </div>
      </motion.div>
    </div>
  );
}
