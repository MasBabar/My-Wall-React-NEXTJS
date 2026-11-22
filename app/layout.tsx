// Mengimpor tipe Metadata bawaan Next.js untuk mengatur judul tab & meta deskripsi halaman
import type { Metadata } from "next";
// Mengimpor font Inter & JetBrains Mono dari Google Fonts melalui next/font/google
import { Inter, JetBrains_Mono } from "next/font/google";
// Mengimpor stylesheet global Tailwind CSS
import "./globals.css";

// Konfigurasi font sans-serif utama (Inter) dan variabel CSS-nya
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Konfigurasi font monospace (JetBrains Mono) untuk counter karakter & badge status
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Metadata halaman utama My Wall React (tampil di tab browser & hasil preview link)
export const metadata: Metadata = {
  title: "My Wall React — Mega Mendung Wall",
  description:
    "Personal Bulletin & Status Wall built with React, Next.js, and Supabase — Javanese Mega Mendung batik edition.",
};

// Komponen RootLayout membungkus seluruh halaman di dalam aplikasi
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      {/* Menerapkan font Inter secara default dan menjaga tinggi penuh halaman */}
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}