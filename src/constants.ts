/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Anggota, Tempekan } from "./types";

export const INITIAL_ANGGOTA_DATA: Anggota[] = [
  {
    id: "1",
    nama: "I Putu Gede Astawa",
    whatsapp: "081234567890",
    alamatLengkap: "Jl. Raya Kerobokan No. 4, Banjar Tegal Jaya, Kuta Utara, Badung",
    tempekan: Tempekan.KauhKelod,
    createdAt: "2026-07-10T10:00:00.000Z"
  },
  {
    id: "2",
    nama: "Ni Kadek Windasari",
    whatsapp: "081987654321",
    alamatLengkap: "Jl. Mertanadi No. 12, Banjar Tegal Jaya, Kuta Utara, Badung",
    tempekan: Tempekan.DanginDaja,
    createdAt: "2026-07-12T14:30:00.000Z"
  },
  {
    id: "3",
    nama: "I Made Dwi Cahyadi",
    whatsapp: "081333444555",
    alamatLengkap: "Jl. Sunset Road No. 8, Banjar Kauh Mandara, Seminyak, Badung",
    tempekan: Tempekan.KauhKaja,
    createdAt: "2026-07-15T09:15:00.000Z"
  },
  {
    id: "4",
    nama: "Ni Nyoman Sri Wahyuni",
    whatsapp: "081222333444",
    alamatLengkap: "Jl. Gajah Mada No. 1A, Banjar Dangin Puri, Denpasar",
    tempekan: Tempekan.DanginKelod,
    createdAt: "2026-07-18T11:00:00.000Z"
  }
];

export const TEMPEKAN_OPTIONS = [
  Tempekan.KauhKelod,
  Tempekan.KauhKaja,
  Tempekan.DanginDaja,
  Tempekan.DanginKelod
];
