/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Phone, Layers, Clock, TrendingUp, UserPlus, Map } from "lucide-react";
import { Anggota, Tempekan, UserSession } from "../types";
import { TEMPEKAN_OPTIONS } from "../constants";

interface DashboardStatsProps {
  anggotaList: Anggota[];
  onNavigateToMembers: () => void;
  onAddAnggota?: (data: Omit<Anggota, "id" | "createdAt">) => void;
  userSession?: UserSession | null;
}

export default function DashboardStats({ anggotaList, onNavigateToMembers, onAddAnggota, userSession }: DashboardStatsProps) {
  const [nama, setNama] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [alamatLengkap, setAlamatLengkap] = useState("");
  const [tempekan, setTempekan] = useState<Tempekan | "">("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const namaInputRef = useRef<HTMLInputElement>(null);

  // Clear notification automatically after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleReset = () => {
    setNama("");
    setWhatsapp("");
    setAlamatLengkap("");
    setTempekan("");
    setNotification(null);
    namaInputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi seluruh field
    if (!nama.trim() || !whatsapp.trim() || !alamatLengkap.trim() || !tempekan) {
      setNotification({
        message: "Mohon lengkapi seluruh data terlebih dahulu.",
        type: "error",
      });
      return;
    }

    const cleanWhatsapp = whatsapp.replace(/\s+/g, "");

    // WhatsApp validations
    if (/[^0-9]/.test(cleanWhatsapp)) {
      setNotification({
        message: "Nomor WhatsApp hanya boleh berisi angka.",
        type: "error",
      });
      return;
    }

    if (!cleanWhatsapp.startsWith("08")) {
      setNotification({
        message: "Nomor WhatsApp harus diawali dengan 08.",
        type: "error",
      });
      return;
    }

    if (cleanWhatsapp.length < 10) {
      setNotification({
        message: "Nomor WhatsApp terlalu pendek.",
        type: "error",
      });
      return;
    }

    if (cleanWhatsapp.length > 15) {
      setNotification({
        message: "Nomor WhatsApp terlalu panjang.",
        type: "error",
      });
      return;
    }

    if (onAddAnggota) {
      onAddAnggota({
        nama: nama.trim(),
        whatsapp: cleanWhatsapp,
        alamatLengkap: alamatLengkap.trim(),
        tempekan: tempekan as Tempekan,
      });
    }

    setNotification({
      message: "Data anggota berhasil didaftarkan.",
      type: "success",
    });

    // Form otomatis dikosongkan
    setNama("");
    setWhatsapp("");
    setAlamatLengkap("");
    setTempekan("");

    // Cursor kembali ke field Nama Lengkap
    setTimeout(() => {
      namaInputRef.current?.focus();
    }, 50);
  };

  const totalAnggota = anggotaList.length;

  // Calculate members with WhatsApp numbers (which should be all, but safely filtered)
  const totalWithWhatsapp = anggotaList.filter((a) => a.whatsapp).length;

  // Count by Tempekan
  const countsByTempekan = {
    [Tempekan.KauhKelod]: anggotaList.filter((a) => a.tempekan === Tempekan.KauhKelod).length,
    [Tempekan.KauhKaja]: anggotaList.filter((a) => a.tempekan === Tempekan.KauhKaja).length,
    [Tempekan.DanginDaja]: anggotaList.filter((a) => a.tempekan === Tempekan.DanginDaja).length,
    [Tempekan.DanginKelod]: anggotaList.filter((a) => a.tempekan === Tempekan.DanginKelod).length,
  };

  // Get the most active tempekan
  const maxTempekan = Object.entries(countsByTempekan).reduce(
    (max, item) => (item[1] > max[1] ? item : max),
    [Tempekan.KauhKelod, 0]
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner - Dark/Gold Gradient Premium */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-dark-950 via-[#101620] to-dark-950 rounded-2xl p-6 md:p-8 text-white border border-gold-500/20 shadow-xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-extrabold text-[10px] uppercase tracking-widest shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              Sistem Informasi Banjar
            </span>
            <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight leading-none">
              Selamat Datang di <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-yellow-300 to-gold-500 font-black">PUSBAYA HUB</span>
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-medium max-w-2xl leading-relaxed">
              Pusat Pendataan Terpadu Anggota ST Putra Settu Bhakti Jaya, Banjar Campuan, Desa Adat Kerobokan
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2.5 text-[11px] text-slate-400 font-bold border-t border-gold-500/10">
              <span className="flex items-center gap-1.5">
                <span className="text-gold-400 font-extrabold">User:</span>
                <span className="text-white font-black">{userSession?.nama || "Tamu"}</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5">
                {userSession?.role === "admin" ? (
                  <span className="text-amber-400 font-black flex items-center gap-1">🟡 Admin</span>
                ) : (
                  <span className="text-slate-300 font-black flex items-center gap-1">⚪ Pengguna</span>
                )}
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(212, 175, 55, 0.2)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onNavigateToMembers}
            className="w-full md:w-auto text-center justify-center min-h-[44px] py-3 md:py-2.5 flex items-center self-stretch md:self-center bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-600 text-dark-950 px-5 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-gold-500/10"
          >
            Lihat Semua Anggota
          </motion.button>
        </div>
      </motion.div>

      {/* Card Registrasi Anggota Baru - Dark Gold Luxury Theme */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="bg-gradient-to-r from-dark-950 via-[#101620] to-dark-950 rounded-[18px] md:rounded-[20px] p-6 md:p-8 text-white border border-gold-500/20 shadow-xl relative overflow-hidden"
      >
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start gap-4 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center shrink-0 shadow-inner">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg md:text-xl text-white tracking-tight flex items-center gap-2">
              Registrasi Anggota Baru
            </h3>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl font-medium leading-relaxed">
              Silakan daftar dengan mengisi data di bawah ini. Pastikan seluruh data telah diisi dengan benar sebelum disimpan.
            </p>
          </div>
        </div>

        {/* Notification Area */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 border relative z-10 overflow-hidden ${
                notification.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                  : "bg-red-950/40 border-red-500/30 text-red-300"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {notification.type === "success" ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400 rotate-90" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-red-500 flex items-center justify-center text-xs font-black text-red-400 bg-red-950/50">!</div>
                )}
              </div>
              <div>
                <h5 className={`font-black text-sm ${notification.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                  {notification.type === "success" ? "Pendaftaran Berhasil" : "Validasi Gagal"}
                </h5>
                <p className="text-xs mt-0.5 font-bold leading-relaxed">{notification.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Column 1: Nama Lengkap & Nomor WhatsApp */}
            <div className="space-y-4">
              {/* Field: Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gold-400 uppercase tracking-widest">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={namaInputRef}
                    type="text"
                    placeholder="Contoh: I Putu Gede Astawa"
                    value={nama}
                    onChange={(e) => {
                      setNama(e.target.value);
                      if (notification) setNotification(null);
                    }}
                    className="w-full px-3.5 py-2.5 min-h-[44px] bg-dark-850/60 border border-gold-500/20 rounded-xl text-white placeholder-slate-500 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/10 focus:border-gold-400 transition-all"
                  />
                </div>
              </div>

              {/* Field: Nomor WhatsApp */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gold-400 uppercase tracking-widest">
                  Nomor WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={whatsapp}
                    onChange={(e) => {
                      // automatically strip spaces
                      const cleanVal = e.target.value.replace(/\s+/g, "");
                      setWhatsapp(cleanVal);
                      if (notification) setNotification(null);
                    }}
                    className="w-full px-3.5 py-2.5 min-h-[44px] bg-dark-850/60 border border-gold-500/20 rounded-xl text-white placeholder-slate-500 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/10 focus:border-gold-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Alamat Lengkap & Tempekan */}
            <div className="space-y-4">
              {/* Field: Alamat Lengkap */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gold-400 uppercase tracking-widest">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Contoh: Jl. Raya Kerobokan No. 25, Desa Kerobokan, Kecamatan Kuta Utara, Kabupaten Badung."
                    value={alamatLengkap}
                    onChange={(e) => {
                      setAlamatLengkap(e.target.value);
                      if (notification) setNotification(null);
                    }}
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-dark-850/60 border border-gold-500/20 rounded-xl text-white placeholder-slate-500 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/10 focus:border-gold-400 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Field: Tempekan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gold-400 uppercase tracking-widest">
                  Tempekan <span className="text-red-500">*</span>
                </label>
                <select
                  value={tempekan}
                  onChange={(e) => {
                    setTempekan(e.target.value as Tempekan);
                    if (notification) setNotification(null);
                  }}
                  className="w-full px-3.5 min-h-[44px] bg-dark-850/60 border border-gold-500/20 rounded-xl text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/10 focus:border-gold-400 transition-all cursor-pointer"
                >
                  <option value="" disabled className="text-slate-500 bg-dark-900">
                    -- Pilih Tempekan --
                  </option>
                  {TEMPEKAN_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-dark-900 text-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gold-500/10">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto min-h-[44px] px-5 py-3 sm:py-2.5 bg-dark-850 border border-gold-500/5 hover:bg-dark-800 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto min-h-[44px] px-5 py-3 sm:py-2.5 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-700 hover:from-gold-500 hover:to-gold-600 text-dark-950 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-gold-500/10 hover:shadow-lg transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Simpan Data
            </button>
          </div>
        </form>
      </motion.div>

      {/* Stats Grid - Luxury Black Glassmorphism & Gold border hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Total Anggota */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-900/60 backdrop-blur-xs p-6 rounded-2xl shadow-lg border border-gold-500/10 hover:border-gold-400/30 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1.5">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block">
              Total Anggota
            </span>
            <span className="text-3xl font-display font-black text-white block tracking-tight">
              {totalAnggota} <span className="text-sm font-sans font-semibold text-gold-400/60">orang</span>
            </span>
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Anggota Aktif
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gold-500/5 border border-gold-500/10 text-gold-400 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-gold-600 group-hover:to-gold-400 group-hover:text-dark-950 transition-all duration-300 shadow-inner">
            <Users className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Card 2: Kontak WhatsApp */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-900/60 backdrop-blur-xs p-6 rounded-2xl shadow-lg border border-gold-500/10 hover:border-gold-400/30 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1.5">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block">
              Kontak Terdaftar
            </span>
            <span className="text-3xl font-display font-black text-white block tracking-tight">
              {totalWithWhatsapp} <span className="text-sm font-sans font-semibold text-gold-400/60">kontak</span>
            </span>
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              Terhubung WhatsApp
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gold-500/5 border border-gold-500/10 text-gold-400 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-gold-600 group-hover:to-gold-400 group-hover:text-dark-950 transition-all duration-300 shadow-inner">
            <Phone className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Card 3: Tempekan Terbanyak */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-900/60 backdrop-blur-xs p-6 rounded-2xl shadow-lg border border-gold-500/10 hover:border-gold-400/30 transition-all flex items-center justify-between group md:col-span-2 lg:col-span-1"
        >
          <div className="space-y-1.5">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block">
              Tempekan Terpadat
            </span>
            <span className="text-lg font-display font-extrabold text-white block tracking-tight leading-snug line-clamp-1" title={maxTempekan[0]}>
              {totalAnggota > 0 ? maxTempekan[0] : "-"}
            </span>
            <span className="text-gold-400 text-xs font-bold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {totalAnggota > 0 ? `${maxTempekan[1]} Anggota` : "0 Anggota"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gold-500/5 border border-gold-500/10 text-gold-400 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-gold-600 group-hover:to-gold-400 group-hover:text-dark-950 transition-all duration-300 shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* Tempekan Distribution Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-dark-900/60 backdrop-blur-xs p-6 rounded-2xl shadow-lg border border-gold-500/10"
      >
        <div className="mb-4">
          <h3 className="font-display font-black text-lg text-white">
            Distribusi Anggota Per Tempekan
          </h3>
          <p className="text-slate-400 text-sm font-medium">
            Rincian jumlah statistik anggota berdasarkan pengelompokan wilayah Tempekan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {Object.entries(countsByTempekan).map(([tempekan, count], index) => {
            const percentage = totalAnggota > 0 ? Math.round((count / totalAnggota) * 100) : 0;
            return (
              <div
                key={tempekan}
                className="p-4 rounded-xl bg-dark-950/50 border border-gold-500/5 hover:border-gold-500/20 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <h4 className="text-slate-300 font-bold text-xs uppercase tracking-wider line-clamp-1">{tempekan}</h4>
                  <span className="text-2xl font-display font-black text-gold-400 mt-1.5 block">
                    {count} <span className="text-xs font-sans font-semibold text-slate-500">orang</span>
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="w-full bg-dark-800 h-2 rounded-full overflow-hidden border border-gold-500/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                      className="bg-gradient-to-r from-gold-600 to-gold-400 h-full rounded-full"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gold-400/50 block text-right">
                    {percentage}% dari total
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
