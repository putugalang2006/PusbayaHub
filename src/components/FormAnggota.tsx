/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Map, AlertTriangle, Save, Phone } from "lucide-react";
import { Anggota, Tempekan } from "../types";
import { TEMPEKAN_OPTIONS } from "../constants";

interface FormAnggotaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Anggota, "id" | "createdAt"> & { id?: string }) => void;
  editingAnggota: Anggota | null;
  isOffline?: boolean;
}

export default function FormAnggota({ isOpen, onClose, onSave, editingAnggota, isOffline = false }: FormAnggotaProps) {
  const [nama, setNama] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [alamatLengkap, setAlamatLengkap] = useState("");
  const [tempekan, setTempekan] = useState<Tempekan | "">("");
  const [errorMessage, setErrorMessage] = useState("");

  // Populate data if editing
  useEffect(() => {
    if (editingAnggota) {
      setNama(editingAnggota.nama);
      setWhatsapp(editingAnggota.whatsapp);
      setAlamatLengkap(editingAnggota.alamatLengkap);
      setTempekan(editingAnggota.tempekan);
      setErrorMessage("");
    } else {
      // Clear form for new addition
      setNama("");
      setWhatsapp("");
      setAlamatLengkap("");
      setTempekan("");
      setErrorMessage("");
    }
  }, [editingAnggota, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check validation: all fields are required
    if (!nama.trim() || !whatsapp.trim() || !alamatLengkap.trim() || !tempekan) {
      setErrorMessage("Mohon lengkapi seluruh data terlebih dahulu.");
      return;
    }

    const cleanWhatsapp = whatsapp.replace(/\s+/g, "");

    // WhatsApp validations
    if (/[^0-9]/.test(cleanWhatsapp)) {
      setErrorMessage("Nomor WhatsApp hanya boleh berisi angka.");
      return;
    }

    if (!cleanWhatsapp.startsWith("08")) {
      setErrorMessage("Nomor WhatsApp harus diawali dengan 08.");
      return;
    }

    if (cleanWhatsapp.length < 10) {
      setErrorMessage("Nomor WhatsApp terlalu pendek.");
      return;
    }

    if (cleanWhatsapp.length > 15) {
      setErrorMessage("Nomor WhatsApp terlalu panjang.");
      return;
    }

    setErrorMessage("");
    onSave({
      id: editingAnggota?.id,
      nama: nama.trim(),
      whatsapp: cleanWhatsapp,
      alamatLengkap: alamatLengkap.trim(),
      tempekan: tempekan as Tempekan,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Form Modal Box - Dark Luxury Style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-dark-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gold-500/20 overflow-hidden relative z-10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-dark-950 via-[#10151f] to-dark-950 px-6 py-5 flex items-center justify-between text-white border-b border-gold-500/10">
              <div>
                <h3 className="font-display font-black text-lg text-white">
                  {editingAnggota ? "Ubah Data Anggota" : "Tambah Anggota Baru"}
                </h3>
                <p className="text-gold-400/70 text-xs font-semibold mt-0.5">
                  Isi formulir pendaftaran anggota PUSBAYA HUB di bawah ini.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-dark-800 border border-gold-500/10 hover:bg-dark-700 text-gold-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content / Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Alert Error Message */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-950/40 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-black text-red-400 text-sm">Gagal Menyimpan</h5>
                    <p className="text-red-300 text-xs mt-0.5 font-bold">{errorMessage}</p>
                  </div>
                </motion.div>
              )}

              {/* Field: Nama */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gold-400 uppercase tracking-widest">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gold-500/60 pointer-events-none">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Contoh: I Putu Gede Astawa"
                    value={nama}
                    disabled={isOffline}
                    onChange={(e) => {
                      setNama(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    className="w-full pl-10 pr-4 min-h-[44px] bg-dark-850 border border-gold-500/20 rounded-xl text-white placeholder-slate-500 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/10 focus:border-gold-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Field: WhatsApp */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gold-400 uppercase tracking-widest">
                  Nomor WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gold-500/60 pointer-events-none">
                    <Phone className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={whatsapp}
                    disabled={isOffline}
                    onChange={(e) => {
                      // automatically strip spaces
                      const cleanVal = e.target.value.replace(/\s+/g, "");
                      setWhatsapp(cleanVal);
                      if (errorMessage) setErrorMessage("");
                    }}
                    className="w-full pl-10 pr-4 min-h-[44px] bg-dark-850 border border-gold-500/20 rounded-xl text-white placeholder-slate-500 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/10 focus:border-gold-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Field: Alamat Lengkap */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gold-400 uppercase tracking-widest">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-3.5 text-gold-500/60 pointer-events-none">
                    <Map className="w-4.5 h-4.5" />
                  </span>
                  <textarea
                    placeholder="Contoh: Jl. Raya Kerobokan No. 25, Desa Kerobokan, Kecamatan Kuta Utara, Kabupaten Badung."
                    value={alamatLengkap}
                    disabled={isOffline}
                    onChange={(e) => {
                      setAlamatLengkap(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-850 border border-gold-500/20 rounded-xl text-white placeholder-slate-500 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/10 focus:border-gold-400 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isOffline}
                  onChange={(e) => {
                    setTempekan(e.target.value as Tempekan);
                    if (errorMessage) setErrorMessage("");
                  }}
                  className="w-full px-3.5 min-h-[44px] bg-dark-850 border border-gold-500/20 rounded-xl text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/10 focus:border-gold-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="text-[10px] text-slate-500 italic font-medium">
                  * Klasifikasi wilayah adat wajib dipilih dari pilihan di atas.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gold-500/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-3 sm:py-2 bg-dark-850 border border-gold-500/5 hover:bg-dark-800 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isOffline}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-3 sm:py-2.5 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-700 hover:from-gold-500 hover:to-gold-600 text-dark-950 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-gold-500/10 hover:shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Simpan Data
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
