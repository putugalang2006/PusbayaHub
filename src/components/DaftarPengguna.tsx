/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Users
} from "lucide-react";
import { Anggota, Tempekan } from "../types";

interface DaftarPenggunaProps {
  anggotaList: Anggota[];
  onAddClick: () => void;
  onEditClick: (anggota: Anggota) => void;
  onDelete: (id: string) => void;
  isAdmin?: boolean;
  isOffline?: boolean;
}

export default function DaftarPengguna({
  anggotaList,
  onAddClick,
  onEditClick,
  onDelete,
  isAdmin = false,
  isOffline = false,
}: DaftarPenggunaProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Filter members based on search query (Nama, WhatsApp, Alamat Lengkap, Tempekan)
  const filteredList = anggotaList.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      item.nama.toLowerCase().includes(query) ||
      (item.whatsapp && item.whatsapp.toLowerCase().includes(query)) ||
      (item.alamatLengkap && item.alamatLengkap.toLowerCase().includes(query)) ||
      item.tempekan.toLowerCase().includes(query)
    );
  });

  // Handle action delete
  const handleDeleteConfirm = (id: string) => {
    setDeleteTarget(id);
  };

  const executeDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget);
      setDeleteTarget(null);
    }
  };

  // Helper to color-code Tempekan badges in luxury metallic gold/bronze shades
  const getTempekanBadgeStyle = (tempekan: Tempekan) => {
    switch (tempekan) {
      case Tempekan.KauhKelod:
        return "bg-amber-500/10 text-amber-300 border-amber-500/20";
      case Tempekan.KauhKaja:
        return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
      case Tempekan.DanginDaja:
        return "bg-orange-500/10 text-orange-300 border-orange-500/20";
      case Tempekan.DanginKelod:
        return "bg-gold-500/10 text-gold-400 border-gold-500/20";
      default:
        return "bg-slate-500/10 text-slate-300 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar - Luxury Dark Glassmorphism */}
      <div className="bg-dark-900/60 backdrop-blur-xs p-5 rounded-2xl shadow-lg border border-gold-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:max-w-lg">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gold-500/50 pointer-events-none">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan nama, nomor WhatsApp, alamat, atau tempekan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 min-h-[44px] bg-dark-850 border border-gold-500/15 rounded-xl text-white placeholder-slate-500 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/10 focus:border-gold-400 transition-all"
          />
        </div>
      </div>

      {/* Main Table Container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-900/60 backdrop-blur-xs rounded-2xl shadow-lg border border-gold-500/10 overflow-hidden"
      >
        <div className="p-6 border-b border-gold-500/10 flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2.5">
              <Users className="w-5 h-5 text-gold-400" />
              Daftar Anggota Aktif
            </h3>
            <p className="text-slate-400 text-xs font-semibold mt-0.5">
              Menampilkan {filteredList.length} dari total {anggotaList.length} anggota yang terdaftar.
            </p>
          </div>
        </div>

        {/* Desktop Table View (Hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-950/80 text-gold-400/80 font-bold text-xs uppercase tracking-widest border-b border-gold-500/10">
                <th className="py-4 px-6 text-center w-16">No</th>
                <th className="py-4 px-6">Nama Lengkap</th>
                <th className="py-4 px-6">Nomor WhatsApp</th>
                <th className="py-4 px-6">Alamat Lengkap</th>
                <th className="py-4 px-6">Tempekan</th>
                {isAdmin && <th className="py-4 px-6 text-center w-36">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-500/5 text-slate-300">
              <AnimatePresence>
                {filteredList.length > 0 ? (
                  filteredList.map((item, index) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={item.id}
                      className="hover:bg-dark-850/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-center font-bold text-slate-500 text-sm">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 font-black text-white text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center justify-center font-black text-xs">
                            {item.nama.substring(0, 2).toUpperCase()}
                          </div>
                          {item.nama}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-semibold text-sm">
                        {item.whatsapp}
                      </td>
                      <td className="py-4 px-6 text-slate-400 font-medium text-sm max-w-xs truncate" title={item.alamatLengkap}>
                        {item.alamatLengkap}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getTempekanBadgeStyle(
                            item.tempekan
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {item.tempekan}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => !isOffline && onEditClick(item)}
                              disabled={isOffline}
                              title={isOffline ? "Koneksi Offline" : "Edit"}
                              className={`p-1.5 rounded-lg text-slate-400 border border-transparent transition-all ${
                                isOffline
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:text-gold-400 hover:bg-gold-500/10 hover:border-gold-500/10 cursor-pointer"
                              }`}
                            >
                              <Edit3 className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => !isOffline && handleDeleteConfirm(item.id)}
                              disabled={isOffline}
                              title={isOffline ? "Koneksi Offline" : "Hapus"}
                              className={`p-1.5 rounded-lg text-slate-400 border border-transparent transition-all ${
                                isOffline
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/10 cursor-pointer"
                              }`}
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-500 font-bold text-sm">
                      Tidak ada data anggota yang ditemukan.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile List View (Hidden on desktop) */}
        <div className="block md:hidden divide-y divide-gold-500/5">
          {filteredList.length > 0 ? (
            filteredList.map((item, index) => (
              <div key={item.id} className="p-5 space-y-4">
                {/* Index badge */}
                <div className="flex items-center gap-2">
                  <span className="bg-gold-500/10 border border-gold-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-gold-400">
                    Anggota #{index + 1}
                  </span>
                </div>

                {/* Card Data Fields - Styled as vertical key-value lists with clean bottom borders */}
                <div className="space-y-2.5 text-xs py-3.5 px-4 bg-dark-950/40 rounded-xl border border-gold-500/5">
                  <div className="flex justify-between items-center py-1.5 border-b border-gold-500/5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Nama Lengkap</span>
                    <span className="text-white font-black text-sm">{item.nama}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gold-500/5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Nomor WhatsApp</span>
                    <span className="text-slate-300 font-bold">{item.whatsapp}</span>
                  </div>
                  <div className="flex flex-col gap-1 py-1.5 border-b border-gold-500/5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Alamat Lengkap</span>
                    <span className="text-slate-400 font-medium leading-relaxed">{item.alamatLengkap}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Tempekan</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getTempekanBadgeStyle(
                        item.tempekan
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item.tempekan}
                    </span>
                  </div>
                </div>

                {/* Actions (Only for Admin accounts) */}
                {isAdmin && (
                  <div className="flex items-center gap-2.5 w-full pt-1">
                    <button
                      onClick={() => !isOffline && onEditClick(item)}
                      disabled={isOffline}
                      className={`flex-1 flex items-center justify-center gap-1.5 min-h-[44px] py-3 rounded-xl border border-gold-500/10 bg-dark-850 font-bold text-xs transition-colors ${
                        isOffline
                          ? "opacity-40 cursor-not-allowed text-slate-500"
                          : "text-gold-400 hover:bg-gold-500/10 cursor-pointer"
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                      ✏ Edit
                    </button>
                    <button
                      onClick={() => !isOffline && handleDeleteConfirm(item.id)}
                      disabled={isOffline}
                      className={`flex-1 flex items-center justify-center gap-1.5 min-h-[44px] py-3 rounded-xl border border-red-500/20 bg-dark-850 font-bold text-xs transition-colors ${
                        isOffline
                          ? "opacity-40 cursor-not-allowed text-slate-500"
                          : "text-red-400 hover:bg-red-500/10 cursor-pointer"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      🗑 Hapus
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500 font-bold text-sm">
              Tidak ada data anggota yang ditemukan.
            </div>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-dark-900 rounded-2xl w-full max-w-md shadow-2xl border border-gold-500/20 p-6 relative z-10 space-y-5"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h4 className="font-display font-black text-lg text-white">
                  Konfirmasi Hapus Data
                </h4>
              </div>

              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Apakah Anda yakin ingin menghapus data anggota ini? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-3 sm:py-2 bg-dark-850 border border-gold-500/5 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center"
                >
                  Batal
                </button>
                <button
                  onClick={executeDelete}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-3 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
