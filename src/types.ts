/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Tempekan {
  KauhKelod = "Tempek Kauh Kelod",
  KauhKaja = "Tempek Kauh Kaja",
  DanginDaja = "Tempek Dangin Daja",
  DanginKelod = "Tempek Dangin Kelod"
}

export interface Anggota {
  id: string;
  nama: string;
  whatsapp: string;
  alamatLengkap: string;
  tempekan: Tempekan;
  createdAt: string;
}

export type Role = "admin" | "user";

export interface UserSession {
  nama: string;
  role: Role;
  loginAt: string;
}
