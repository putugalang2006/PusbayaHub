/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  FileText,
  Download,
  Eye,
  Printer,
  Calendar,
  User,
  Filter,
  Users,
  Layers,
  MapPin,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Anggota, Tempekan, UserSession } from "../types";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface RekapDataProps {
  anggotaList: Anggota[];
  userSession: UserSession;
}

export default function RekapData({ anggotaList, userSession }: RekapDataProps) {
  const [selectedTempekan, setSelectedTempekan] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    const total = anggotaList.length;
    const kauhKelod = anggotaList.filter(a => a.tempekan === Tempekan.KauhKelod).length;
    const kauhKaja = anggotaList.filter(a => a.tempekan === Tempekan.KauhKaja).length;
    const danginDaja = anggotaList.filter(a => a.tempekan === Tempekan.DanginDaja).length;
    const danginKelod = anggotaList.filter(a => a.tempekan === Tempekan.DanginKelod).length;
    return { total, kauhKelod, kauhKaja, danginDaja, danginKelod };
  }, [anggotaList]);

  // Current Date and Time Indonesian style for the statistics
  const currentDateTimeString = useMemo(() => {
    const now = new Date();
    const datePart = now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const timePart = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });
    return `${datePart}, Pukul ${timePart} WITA`;
  }, []);

  // Filter members based on search and Tempekan dropdown selection
  const filteredList = useMemo(() => {
    return anggotaList.filter(item => {
      // Filter Tempekan
      if (selectedTempekan !== "Semua" && item.tempekan !== selectedTempekan) {
        return false;
      }
      // Filter Search query
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      return (
        item.nama.toLowerCase().includes(query) ||
        item.whatsapp.toLowerCase().includes(query) ||
        item.alamatLengkap.toLowerCase().includes(query)
      );
    });
  }, [anggotaList, selectedTempekan, searchQuery]);

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

  // Safe formatting function for PDF filename dates
  const getFormattedFilenameDate = () => {
    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, "0");
    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Generate jsPDF document instance
  const generatePDFDoc = (isForPreview: boolean = false) => {
    // Determine A4 orientation: standard is portrait, but if dataset is large, change to landscape
    // as requested: "Apabila data sangat banyak, otomatis berubah menjadi Landscape agar tabel tetap rapi."
    const isLandscape = filteredList.length > 15;
    const orientation = isLandscape ? "landscape" : "portrait";

    const doc = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: "a4"
    });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Setup print metadata
    const now = new Date();
    const tglCetak = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const jamCetak = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    }) + " WITA";

    const dicetakOleh = userSession.nama;
    const totalCetak = filteredList.length.toString();

    // We start rendering content below
    // Title & Header Information
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(24, 28, 36); // Deep charcoal
    doc.text("PUSBAYA HUB", 20, 25);

    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Laporan Rekap Data Anggota", 20, 31);

    // Divider line
    doc.setDrawColor(212, 175, 55); // Rich Gold
    doc.setLineWidth(0.6);
    doc.line(20, 35, pageW - 20, 35);

    // Metadata block
    doc.setFontSize(9);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(110, 110, 110);

    doc.text("Tanggal Cetak :", 20, 42);
    doc.text("Jam Cetak     :", 20, 47);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(tglCetak, 47, 42);
    doc.text(jamCetak, 47, 47);

    // Right column metadata
    const col2X = isLandscape ? 150 : 105;
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(110, 110, 110);
    doc.text("Dicetak oleh  :", col2X, 42);
    doc.text("Total Anggota :", col2X, 47);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(dicetakOleh, col2X + 27, 42);
    doc.text(`${totalCetak} Orang`, col2X + 27, 47);

    // Generate table data
    const tableBody = filteredList.map((item, idx) => [
      (idx + 1).toString(),
      item.nama,
      item.whatsapp,
      item.alamatLengkap,
      item.tempekan
    ]);

    // Render AutoTable
    autoTable(doc, {
      head: [["No", "Nama Lengkap", "Nomor WhatsApp", "Alamat Lengkap", "Tempekan"]],
      body: tableBody,
      startY: 54,
      margin: { top: 35, right: 20, bottom: 25, left: 20 },
      styles: {
        fontSize: 9,
        cellPadding: 3.5,
        font: "Helvetica",
        textColor: [40, 40, 40],
        lineColor: [230, 230, 230],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [24, 28, 36], // Dark Charcoal match
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "left",
        lineWidth: 0
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: isLandscape ? 55 : 40, fontStyle: "bold" },
        2: { cellWidth: isLandscape ? 40 : 30 },
        3: { cellWidth: "auto" },
        4: { cellWidth: isLandscape ? 50 : 38 }
      },
      alternateRowStyles: {
        fillColor: [250, 249, 246] // Off-white warm background
      },
      didDrawCell: (data) => {
        // Safe styling adjustments
      }
    });

    // Post-processing to add responsive headers and footers to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // On pages after the first, add a lightweight header
      if (i > 1) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(24, 28, 36);
        doc.text("PUSBAYA HUB - Laporan Rekap Data Anggota", 20, 15);

        doc.setDrawColor(212, 175, 55);
        doc.setLineWidth(0.3);
        doc.line(20, 18, pageW - 20, 18);
      }

      // Footer - Elegant lines & auto-pagination
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.3);
      doc.line(20, pageH - 18, pageW - 20, pageH - 18);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text("PUSBAYA HUB", 20, pageH - 12);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(160, 160, 160);
      doc.text("• Sistem Pendataan Organisasi", 44, pageH - 12);

      const footerText = `Laporan dibuat secara otomatis oleh sistem. Halaman ${i} dari ${totalPages}`;
      const footerTextW = doc.getTextWidth(footerText);
      doc.text(footerText, pageW - 20 - footerTextW, pageH - 12);
    }

    return doc;
  };

  // Trigger download PDF file directly
  const handleDownloadPDF = () => {
    try {
      const doc = generatePDFDoc();
      const dateStr = getFormattedFilenameDate();
      const filename = `Rekap_Data_Anggota_PUSBAYA_HUB_${dateStr}.pdf`;
      doc.save(filename);

      setSuccessToast(`Laporan berhasil diunduh dengan nama: ${filename}`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (error) {
      console.error("PDF download failed", error);
    }
  };

  // Generate Data URI for printing or inline preview
  const pdfDataUri = useMemo(() => {
    if (!isPreviewOpen) return "";
    try {
      const doc = generatePDFDoc(true);
      return doc.output("datauristring");
    } catch (e) {
      console.error(e);
      return "";
    }
  }, [filteredList, isPreviewOpen, userSession]);

  // Safe Print action that works by opening the PDF in a blob URL or in an iframe
  const handlePrintPDF = () => {
    try {
      const doc = generatePDFDoc();
      const blob = doc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      
      const printIframe = document.createElement("iframe");
      printIframe.style.position = "fixed";
      printIframe.style.right = "0";
      printIframe.style.bottom = "0";
      printIframe.style.width = "0";
      printIframe.style.height = "0";
      printIframe.style.border = "none";
      printIframe.src = blobUrl;
      
      document.body.appendChild(printIframe);
      printIframe.contentWindow?.focus();
      
      // Delay printing slightly to ensure document is fully loaded in iframe
      setTimeout(() => {
        printIframe.contentWindow?.print();
        // Clean up
        setTimeout(() => {
          document.body.removeChild(printIframe);
          URL.revokeObjectURL(blobUrl);
        }, 5000);
      }, 500);

      setSuccessToast("Perintah cetak laporan berhasil diluncurkan.");
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (error) {
      console.error("Printing failed", error);
    }
  };

  return (
    <div id="rekap-container" className="space-y-6">
      {/* Page Title & Navigation Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-dark-900/60 backdrop-blur-md rounded-2xl border border-gold-500/10 shadow-lg">
        <div>
          <h2 id="rekap-page-header-title" className="font-display font-black text-xl text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-gold-400" />
            Rekap Data Anggota PUSBAYA HUB
          </h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Buat laporan komprehensif, saring berdasarkan tempekan, dan ekspor ke dokumen cetak PDF berkualitas tinggi.
          </p>
        </div>
      </div>

      {/* Main Statistics Hub - Grid of luxury dark panels */}
      <div id="rekap-stats-grid" className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Anggota */}
        <div className="col-span-2 lg:col-span-1 bg-dark-900/60 backdrop-blur-md border border-gold-500/10 p-5 rounded-xl shadow-md space-y-3 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-16 h-16 bg-gold-500/5 rounded-full blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gold-400/80 uppercase tracking-widest">TOTAL ANGGOTA</span>
            <Users className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-white">{stats.total}</p>
            <p className="text-slate-500 text-[10px] font-bold mt-1">Terdaftar aktif</p>
          </div>
        </div>

        {/* Kauh Kelod */}
        <div className="bg-dark-900/60 backdrop-blur-md border border-amber-500/10 p-5 rounded-xl shadow-md space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-400/80 uppercase tracking-widest">Kauh Kelod</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{stats.kauhKelod}</p>
            <p className="text-slate-500 text-[10px] font-bold mt-1">Anggota tempekan</p>
          </div>
        </div>

        {/* Kauh Kaja */}
        <div className="bg-dark-900/60 backdrop-blur-md border border-yellow-500/10 p-5 rounded-xl shadow-md space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-yellow-400/80 uppercase tracking-widest">Kauh Kaja</span>
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{stats.kauhKaja}</p>
            <p className="text-slate-500 text-[10px] font-bold mt-1">Anggota tempekan</p>
          </div>
        </div>

        {/* Dangin Daja */}
        <div className="bg-dark-900/60 backdrop-blur-md border border-orange-500/10 p-5 rounded-xl shadow-md space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-orange-400/80 uppercase tracking-widest">Dangin Daja</span>
            <span className="w-2 h-2 rounded-full bg-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{stats.danginDaja}</p>
            <p className="text-slate-500 text-[10px] font-bold mt-1">Anggota tempekan</p>
          </div>
        </div>

        {/* Dangin Kelod */}
        <div className="bg-dark-900/60 backdrop-blur-md border border-gold-500/10 p-5 rounded-xl shadow-md space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gold-400/80 uppercase tracking-widest">Dangin Kelod</span>
            <span className="w-2 h-2 rounded-full bg-gold-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{stats.danginKelod}</p>
            <p className="text-slate-500 text-[10px] font-bold mt-1">Anggota tempekan</p>
          </div>
        </div>
      </div>

      {/* Metadata & Admin Information Ribbon */}
      <div id="rekap-metadata-banner" className="bg-[#101620] border border-gold-500/15 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold text-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-400 shrink-0" />
            <span>Tanggal Laporan: <strong className="text-white">{currentDateTimeString}</strong></span>
          </span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="flex items-center gap-2">
            <User className="w-4 h-4 text-gold-400 shrink-0" />
            <span>Penyusun Laporan: <strong className="text-white">{userSession.nama} (Admin)</strong></span>
          </span>
        </div>
        <div className="text-[10px] font-bold tracking-widest text-gold-400 uppercase bg-gold-500/10 border border-gold-500/20 px-3 py-1 rounded-md self-start md:self-center">
          LAPORAN AKTIF
        </div>
      </div>

      {/* Interactive Filter & Action Bar */}
      <div id="rekap-action-bar" className="bg-dark-900/60 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-gold-500/10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* Left Side: Filter and Search Inputs */}
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          {/* Dropdown: Tempekan */}
          <div className="w-full md:w-64">
            <label className="block text-[10px] font-black text-gold-400/70 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Saring Tempekan
            </label>
            <select
              value={selectedTempekan}
              onChange={(e) => setSelectedTempekan(e.target.value)}
              className="w-full h-11 px-3 bg-dark-850 border border-gold-500/15 rounded-xl text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/10 focus:border-gold-400 cursor-pointer"
            >
              <option value="Semua">Semua Tempekan</option>
              <option value={Tempekan.KauhKelod}>{Tempekan.KauhKelod}</option>
              <option value={Tempekan.KauhKaja}>{Tempekan.KauhKaja}</option>
              <option value={Tempekan.DanginDaja}>{Tempekan.DanginDaja}</option>
              <option value={Tempekan.DanginKelod}>{Tempekan.DanginKelod}</option>
            </select>
          </div>

          {/* Input: Search Query */}
          <div className="flex-1">
            <label className="block text-[10px] font-black text-gold-400/70 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              Pencarian Cepat
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gold-500/50 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama, WhatsApp, atau alamat lengkap..."
                className="w-full pl-10 pr-4 h-11 bg-dark-850 border border-gold-500/15 rounded-xl text-white placeholder-slate-500 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/10 focus:border-gold-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Primary PDF Actions */}
        <div className="flex flex-col sm:flex-row gap-3 xl:self-end pt-2 xl:pt-0">
          {/* Preview Button */}
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex-1 sm:flex-initial min-h-[44px] px-5 py-3 rounded-xl border border-gold-500/20 bg-dark-850 text-white hover:bg-gold-500/10 hover:text-gold-400 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-gold-400" />
            Preview Laporan
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-initial min-h-[44px] px-5 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-600 text-dark-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-gold-500/10 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Main Table Content Container (Matches Application Theme) */}
      <div id="rekap-table-card" className="bg-dark-900/60 backdrop-blur-md rounded-2xl shadow-lg border border-gold-500/10 overflow-hidden">
        <div className="p-6 border-b border-gold-500/10 flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-gold-400" />
              Laporan Pratinjau Tabel
            </h3>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              Menampilkan {filteredList.length} baris data berdasarkan filter yang diterapkan.
              {filteredList.length > 15 && (
                <span className="text-amber-400 block sm:inline sm:ml-2 font-bold">
                  ⚠️ PDF otomatis diubah ke orientasi Landscape agar tetap rapi.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Responsive Horizontal Scroll wrapper for mobile */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-950/80 text-gold-400/80 font-bold text-xs uppercase tracking-widest border-b border-gold-500/10">
                <th className="py-4 px-6 text-center w-16">No</th>
                <th className="py-4 px-6 min-w-[180px]">Nama Lengkap</th>
                <th className="py-4 px-6 min-w-[150px]">Nomor WhatsApp</th>
                <th className="py-4 px-6 min-w-[280px]">Alamat Lengkap</th>
                <th className="py-4 px-6 min-w-[160px]">Tempekan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-500/5 text-slate-300">
              {filteredList.length > 0 ? (
                filteredList.map((item, index) => (
                  <tr
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
                    <td className="py-4 px-6 text-slate-400 font-medium text-sm">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-bold text-sm">
                    Tidak ada data anggota yang memenuhi kriteria filter saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Success Alert Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-md bg-dark-900 border border-gold-500/20 rounded-xl shadow-2xl p-4 flex items-start gap-3.5"
          >
            <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h5 className="font-display font-black text-xs text-white uppercase tracking-wider">BERHASIL</h5>
              <p className="text-slate-400 text-xs font-semibold mt-0.5 leading-relaxed">{successToast}</p>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-slate-500 hover:text-white p-1 text-xs">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Report Live Preview Modal Overlay */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-dark-900 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl border border-gold-500/20 relative z-10 overflow-hidden"
            >
              {/* Modal Top Controls Bar */}
              <div className="p-4 bg-dark-950 border-b border-gold-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center border border-gold-500/20 text-gold-400">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm text-white">
                      Pratinjau Laporan Rekap PDF
                    </h4>
                    <p className="text-slate-500 text-[10px] font-bold">
                      Format: A4 {filteredList.length > 15 ? "Landscape" : "Portrait"} • Ukuran Margins: 20 mm
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Print Button */}
                  <button
                    onClick={handlePrintPDF}
                    title="Cetak Langsung"
                    className="p-2 bg-dark-850 hover:bg-gold-500/10 hover:text-gold-400 border border-gold-500/10 text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px] px-3.5"
                  >
                    <Printer className="w-4 h-4 text-gold-400" />
                    <span className="hidden sm:inline uppercase tracking-wider text-[10px]">Cetak</span>
                  </button>

                  {/* Download Button */}
                  <button
                    onClick={handleDownloadPDF}
                    title="Unduh PDF"
                    className="p-2 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-600 text-dark-950 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px] px-3.5"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline uppercase tracking-wider text-[10px]">Unduh</span>
                  </button>

                  {/* Close Modal */}
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-2 bg-dark-850 hover:bg-red-500/20 text-slate-400 hover:text-white border border-gold-500/5 rounded-lg transition-all cursor-pointer min-h-[38px] px-3"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Modal Core Layout Content Area (Paper report aesthetic representation) */}
              <div className="flex-1 bg-dark-950 overflow-y-auto p-4 md:p-8 flex justify-center">
                <div
                  className={`bg-white text-slate-900 rounded-xl shadow-2xl p-8 md:p-12 w-full max-w-4xl border border-slate-300/50 flex flex-col justify-between ${
                    filteredList.length > 15 ? "aspect-[1.414/1]" : "aspect-[1/1.414]"
                  } h-fit`}
                >
                  {/* Paper Top Header */}
                  <div>
                    <div className="flex justify-between items-start border-b-2 border-amber-500 pb-5">
                      <div>
                        <h1 className="font-sans font-black text-2xl text-slate-900 tracking-tight">PUSBAYA HUB</h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-0.5">Laporan Rekap Data Anggota</p>
                      </div>
                      <div className="text-right text-[10px] text-slate-500 font-bold space-y-1">
                        <p>Tanggal Cetak : <span className="text-slate-900">{new Date().toLocaleDateString("id-ID")}</span></p>
                        <p>Jam Cetak     : <span className="text-slate-900">{new Date().toLocaleTimeString("id-ID")} WITA</span></p>
                        <p>Dicetak oleh  : <span className="text-slate-900 font-black">{userSession.nama}</span></p>
                        <p>Total Anggota : <span className="text-slate-900 font-black">{filteredList.length} Orang</span></p>
                      </div>
                    </div>

                    {/* Paper Table Body */}
                    <div className="mt-8 overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3 text-center border border-slate-900 w-10">No</th>
                            <th className="py-2.5 px-3 border border-slate-900">Nama Lengkap</th>
                            <th className="py-2.5 px-3 border border-slate-900">Nomor WhatsApp</th>
                            <th className="py-2.5 px-3 border border-slate-900">Alamat Lengkap</th>
                            <th className="py-2.5 px-3 border border-slate-900">Tempekan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300">
                          {filteredList.length > 0 ? (
                            filteredList.map((item, index) => (
                              <tr key={item.id} className={index % 2 === 1 ? "bg-slate-50" : "bg-white"}>
                                <td className="py-2.5 px-3 text-center font-bold text-slate-500">{index + 1}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-950">{item.nama}</td>
                                <td className="py-2.5 px-3 text-slate-800">{item.whatsapp}</td>
                                <td className="py-2.5 px-3 text-slate-600 leading-relaxed">{item.alamatLengkap}</td>
                                <td className="py-2.5 px-3">
                                  <span className="font-bold text-slate-700">{item.tempekan}</span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold italic">
                                Tidak ada data anggota yang ditemukan untuk filter yang dipilih.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Paper Footer (Exactly mirrors PDF footer design requirements) */}
                  <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>PUSBAYA HUB • Sistem Pendataan Organisasi</span>
                    <span>Laporan dibuat secara otomatis oleh sistem. Halaman 1 dari 1</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
