// Mengaktifkan Client Component agar state React, useEffect, dan event form dapat berjalan di browser
"use client";

import React, { useEffect, useState } from "react";
// Mengimpor instance client Supabase untuk membaca & menyimpan data ke tabel 'wall_entries'
import { supabase } from "@/src/lib/supabase";

// Struktur data yang sesuai dengan kolom tabel 'wall_entries' di Supabase
interface WallEntry {
  id: string;
  sender: string;
  content: string;
  tag: string;
  created_at: string;
}

// Batas maksimal karakter dan nama pengirim tetap
const MAX_CHARS = 280;
const DEFAULT_SENDER = "Rizky Akbar";

// Palet warna pewarna alami Nusantara untuk setiap Topic Badge
const TOPIC_STYLES: Record<
  string,
  { badge: string; dot: string; accentBar: string; cardHover: string }
> = {
  Note: {
    // Sogan Amber / Gold
    badge: "bg-amber-50/95 text-[#92400E] border-amber-400/65",
    dot: "bg-[#B45309]",
    accentBar: "bg-linear-to-b from-[#B45309] to-[#D97706]",
    cardHover: "hover:border-amber-600/55",
  },
  "Build Log": {
    // Indigo Nila Mega Mendung
    badge: "bg-sky-50/95 text-[#1E3A8A] border-sky-400/60",
    dot: "bg-[#1D4ED8]",
    accentBar: "bg-linear-to-b from-[#1E3A8A] to-[#0369A1]",
    cardHover: "hover:border-sky-600/55",
  },
  Random: {
    // Mengkudu Terakota
    badge: "bg-orange-50/95 text-[#9A3412] border-orange-400/60",
    dot: "bg-[#C2410C]",
    accentBar: "bg-linear-to-b from-[#9A3412] to-[#C2410C]",
    cardHover: "hover:border-orange-600/55",
  },
  Idea: {
    // Daun Pandan / Hijau Jawa
    badge: "bg-emerald-50/95 text-[#065F46] border-emerald-400/60",
    dot: "bg-[#047857]",
    accentBar: "bg-linear-to-b from-[#065F46] to-[#047857]",
    cardHover: "hover:border-emerald-600/55",
  },
};

export default function MyWallReactPage() {
  // State untuk menyimpan daftar pesan dari tabel 'wall_entries' di Supabase
  const [entries, setEntries] = useState<WallEntry[]>([]);
  // State untuk menyimpan teks pesan yang sedang diketik pengguna
  const [message, setMessage] = useState("");
  // State untuk menyimpan label kategori singkat tiap catatan
  const [tag, setTag] = useState("Note");
  // State penanda saat data awal sedang diambil dari Supabase
  const [loading, setLoading] = useState(true);
  // State penanda saat tombol Share sedang mengirim data ke Supabase
  const [sharing, setSharing] = useState(false);
  // State untuk menampilkan pesan error/validasi bila input atau koneksi bermasalah
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fungsi mengambil semua pesan dari 'wall_entries' dengan urutan terbaru di paling atas
  const fetchWallEntries = async () => {
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("wall_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage("Failed to load wall_entries: " + error.message);
    } else {
      setEntries(data || []);
    }

    setLoading(false);
  };

  // Menjalankan fetchWallEntries() saat pertama kali dimuat + subscribe Supabase Realtime INSERT
  useEffect(() => {
    fetchWallEntries();

    const channel = supabase
      .channel("wall_entries-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wall_entries" },
        (payload: { new: Record<string, unknown> }) => {
          const incomingEntry = payload.new as unknown as WallEntry;
          setEntries((prevEntries) => {
            const alreadyExists = prevEntries.some((item) => item.id === incomingEntry.id);
            if (alreadyExists) return prevEntries;
            return [incomingEntry, ...prevEntries];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fungsi yang dijalankan saat tombol Share ditekan untuk menyimpan pesan ke 'wall_entries'
  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedText = message.trim();
    if (!trimmedText) {
      setErrorMessage("Please write a short message before pressing Share.");
      return;
    }

    if (trimmedText.length > MAX_CHARS) {
      setErrorMessage(`Message cannot exceed ${MAX_CHARS} characters.`);
      return;
    }

    setSharing(true);
    setErrorMessage(null);

    const { error } = await supabase.from("wall_entries").insert([
      {
        sender: DEFAULT_SENDER,
        content: trimmedText,
        tag,
      },
    ]);

    if (error) {
      setErrorMessage("Failed to save to wall_entries: " + error.message);
    } else {
      setMessage("");
      await fetchWallEntries();
    }

    setSharing(false);
  };

  // Fungsi helper untuk memformat created_at dari Supabase
  const formatPostedAt = (isoString: string) => {
    return new Date(isoString).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Menghitung sisa karakter dari batas 280 karakter
  const charsLeft = MAX_CHARS - message.length;
  const activeTopicStyle = TOPIC_STYLES[tag] || TOPIC_STYLES.Note;

  return (
    <div className="min-h-screen bg-mega-mendung-canvas text-[#2C1508] selection:bg-amber-200 selection:text-[#4A2511] flex flex-col">
      {/* CSS khusus motif Batik Mega Mendung (awan berlapis khas Jawa) & strip Tumpal */}
      <style jsx global>{`
        .bg-mega-mendung-canvas {
          background-color: #FAF6EE;
          background-image: url("data:image/svg+xml,%3Csvg width='160' height='120' viewBox='0 0 160 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- Lapisan luar Mega Mendung (Sogan hangat) --%3E%3Cpath d='M12 96 C12 52, 46 28, 80 28 C114 28, 148 52, 148 96' stroke='%234A2511' stroke-opacity='0.075' stroke-width='1.5'/%3E%3C!-- Lapisan kedua (Indigo / Biru Mega Mendung) --%3E%3Cpath d='M24 96 C24 60, 52 40, 80 40 C108 40, 136 60, 136 96' stroke='%231E3A8A' stroke-opacity='0.07' stroke-width='1.4'/%3E%3C!-- Lapisan ketiga (Emas Sogan) --%3E%3Cpath d='M36 96 C36 68, 58 52, 80 52 C102 52, 124 68, 124 96' stroke='%23B45309' stroke-opacity='0.085' stroke-width='1.3'/%3E%3C!-- Gulungan inti Mega Mendung --%3E%3Cpath d='M50 96 C50 76, 65 65, 80 65 C95 65, 110 76, 110 96' stroke='%234A2511' stroke-opacity='0.07' stroke-width='1.2'/%3E%3Ccircle cx='80' cy='86' r='5' stroke='%23D97706' stroke-opacity='0.11' stroke-width='1.2'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 160px 120px;
        }

        .batik-tumpal-strip {
          background-color: #4A2511;
          background-image: url("data:image/svg+xml,%3Csvg width='48' height='8' viewBox='0 0 48 8' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='48' height='8' fill='%234A2511'/%3E%3Cpolygon points='0,8 12,0 24,8' fill='%231E3A8A'/%3E%3Cpolygon points='24,8 36,0 48,8' fill='%231E3A8A'/%3E%3Cpath d='M0 7.5 L12 0.8 L24 7.5 L36 0.8 L48 7.5' fill='none' stroke='%23D97706' stroke-width='1.3'/%3E%3C/svg%3E");
          background-repeat: repeat-x;
          background-size: 48px 8px;
        }
      `}</style>

      {/* === HEADER === */}
      <header className="sticky top-0 z-20 border-b border-[#4A2511]/15 bg-[#FFFDF9]/95 backdrop-blur-md shadow-[0_1px_12px_rgba(74,37,17,0.04)]">
        <div className="h-2 w-full batik-tumpal-strip" />

        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Logo Cap Batik MW & Judul */}
          <div className="flex items-center gap-3.5">
            <div
              className="relative w-11 h-11 rounded-xl bg-linear-to-br from-[#4A2511] via-[#78350F] to-[#B45309] text-amber-50 font-bold text-sm tracking-wider flex items-center justify-center shadow-md shadow-[#4A2511]/25 ring-2 ring-amber-400/60 select-none"
              title="My Wall Batik Stamp"
            >
              <span className="absolute inset-1 rounded-lg border border-amber-300/35 pointer-events-none" />
              <span className="relative z-10">MW</span>
              <span className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-amber-300/80" />
              <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-amber-300/80" />
              <span className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-amber-300/80" />
              <span className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-amber-300/80" />
            </div>

            <div>
              <h1 className="font-bold text-[#2C1508] text-base sm:text-lg leading-tight tracking-tight">
                My Wall React
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Personal Bulletin &amp; Status Wall · Mega Mendung Edition
              </p>
            </div>
          </div>

          {/* Status Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF3E6] border border-amber-600/30 text-[#4A2511] text-xs font-mono font-medium shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D97706]" />
            </span>
            <span>wall_entries live</span>
          </div>
        </div>
      </header>

      {/* === MAIN 2-COLUMN GRID === */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-7 sm:py-9">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* KOLOM KIRI: Sticky Form Card */}
          <section className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="relative overflow-hidden bg-[#FFFDF9] rounded-2xl p-6 border border-[#4A2511]/15 shadow-sm shadow-[#4A2511]/5">
              {/* Ornamen Mega Mendung di sudut kanan atas form */}
              <svg
                className="pointer-events-none -top-2 -right-2 absolute w-24 h-20 text-[#1E3A8A]/8"
                viewBox="0 0 120 96"
                fill="none"
              >
                <path
                  d="M16 88 C16 48, 46 24, 78 24 C104 24, 120 42, 120 68"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M32 88 C32 56, 56 38, 82 38 C100 38, 112 52, 112 72"
                  stroke="#B45309"
                  strokeOpacity="0.45"
                  strokeWidth="1.5"
                />
                <path
                  d="M48 88 C48 64, 66 52, 84 52 C96 52, 104 62, 104 76"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>

              {/* Header Form */}
              <div className="relative mb-5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[#B45309] mb-1">
                  <span className="w-1.5 h-1.5 rotate-45 bg-[#D97706] inline-block" />
                  NEW ENTRY
                </span>
                <h2 className="text-xl font-bold text-[#2C1508] tracking-tight">
                  Post to the Wall
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Posting as{" "}
                  <span className="font-semibold text-[#4A2511]">{DEFAULT_SENDER}</span> &middot;
                  Max {MAX_CHARS} characters
                </p>
              </div>

              <form onSubmit={handleShare} className="relative space-y-4">
                {/* Topic Badge Dropdown */}
                <div>
                  <label
                    htmlFor="topicSelect"
                    className="block text-xs font-semibold text-stone-700 mb-1.5"
                  >
                    Topic badge
                  </label>
                  <div className="relative">
                    <span
                      className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ring-2 ring-amber-200/70 transition-colors duration-150 ${activeTopicStyle.dot}`}
                    />

                    <select
                      id="topicSelect"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full appearance-none rounded-xl bg-[#FAF6EE]/85 hover:bg-[#FAF3E6] border border-[#4A2511]/15 pl-9 pr-10 py-2.5 text-sm font-medium text-stone-800 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/20 transition-all cursor-pointer"
                    >
                      <option value="Note">Note</option>
                      <option value="Build Log">Build Log</option>
                      <option value="Random">Random</option>
                      <option value="Idea">Idea</option>
                    </select>

                    <svg
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A2511]/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Message Textarea */}
                <div>
                  <label htmlFor="messageInput" className="sr-only">
                    Message
                  </label>
                  <textarea
                    id="messageInput"
                    rows={4}
                    maxLength={MAX_CHARS}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Write a quick note, build update, or idea..."
                    className="w-full resize-none rounded-xl bg-[#FAF6EE]/70 border border-[#4A2511]/15 p-3.5 text-sm text-stone-800 placeholder:text-stone-400 leading-relaxed focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/20 transition-all"
                  />
                </div>

                {/* Character Counter & Share Button */}
                <div className="pt-1 flex items-center justify-between gap-3">
                  <span
                    className={`text-xs font-mono transition-colors duration-150 ${
                      charsLeft <= 20
                        ? "text-[#B91C1C] font-semibold"
                        : charsLeft <= 50
                        ? "text-[#B45309] font-medium"
                        : "text-stone-400"
                    }`}
                  >
                    {charsLeft} chars left
                  </span>

                  <button
                    type="submit"
                    disabled={sharing || !message.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-[#4A2511] via-[#78350F] to-[#D97706] hover:from-[#3A1C0C] hover:via-[#632B0C] hover:to-[#B45309] text-amber-50 text-sm font-semibold border border-amber-400/30 shadow-sm shadow-[#4A2511]/25 hover:shadow-md hover:shadow-[#4A2511]/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-150 disabled:opacity-45 disabled:pointer-events-none cursor-pointer"
                  >
                    <span>{sharing ? "Sharing..." : "Share"}</span>
                    <svg
                      className="w-3.5 h-3.5 text-amber-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>

                {/* Pesan error jika terjadi masalah */}
                {errorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                    {errorMessage}
                  </div>
                )}
              </form>
            </div>
          </section>

          {/* KOLOM KANAN: Wall Stream (Terbaru di Paling Atas) */}
          <section className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rotate-45 bg-[#4A2511] ring-2 ring-amber-500/40 inline-block" />
                <h2 className="text-sm font-bold text-[#2C1508]">
                  Wall Stream ({entries.length})
                </h2>
              </div>
              <span className="text-xs font-medium text-[#4A2511]/80 bg-[#FFFDF9] border border-[#4A2511]/15 px-3 py-1 rounded-full shadow-2xs">
                Newest first
              </span>
            </div>

            {loading ? (
              <div className="bg-[#FFFDF9] border border-[#4A2511]/15 rounded-2xl p-6 text-center text-sm text-stone-500">
                Loading entries from wall_entries...
              </div>
            ) : entries.length === 0 ? (
              <div className="bg-[#FFFDF9] border border-[#4A2511]/15 rounded-2xl p-6 text-center text-sm text-stone-500">
                No entries yet in wall_entries. Write the first note on the wall!
              </div>
            ) : (
              <div className="space-y-3.5">
                {entries.map((entry) => {
                  const style = TOPIC_STYLES[entry.tag] || TOPIC_STYLES.Note;

                  return (
                    <article
                      key={entry.id}
                      className={`relative overflow-hidden group bg-[#FFFDF9] rounded-2xl p-5 pl-6 border border-[#4A2511]/15 shadow-sm shadow-[#4A2511]/3 hover:shadow-md hover:shadow-[#4A2511]/[0.07] transition-all duration-200 ${style.cardHover}`}
                    >
                      {/* Garis aksen vertikal kiri */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.accentBar}`}
                      />

                      {/* Watermark Mega Mendung di pojok kanan bawah kartu */}
                      <svg
                        className="pointer-events-none -right-3 -bottom-3 absolute w-28 h-24 text-[#1E3A8A]/5 group-hover:text-[#1E3A8A]/8 transition-colors duration-300"
                        viewBox="0 0 120 96"
                        fill="none"
                      >
                        <path
                          d="M14 88 C14 46, 46 22, 78 22 C104 22, 118 40, 118 68"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M30 88 C30 56, 54 36, 80 36 C98 36, 110 50, 110 72"
                          stroke="#B45309"
                          strokeOpacity="0.45"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M46 88 C46 64, 64 50, 82 50 C94 50, 102 60, 102 76"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                      </svg>

                      <div className="relative flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar lingkaran inisial dengan ring keemasan */}
                          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-[#FDE68A] via-[#FEF3C7] to-[#FFFBEB] text-[#4A2511] font-bold text-xs flex items-center justify-center ring-2 ring-[#D97706]/55 shadow-2xs select-none shrink-0">
                            {entry.sender
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#2C1508] text-sm leading-snug">
                              {entry.sender}
                            </h3>
                            <time className="block text-xs text-stone-400 mt-0.5">
                              {formatPostedAt(entry.created_at)}
                            </time>
                          </div>
                        </div>

                        {/* Topic Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${style.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rotate-45 ${style.dot}`} />
                          {entry.tag}
                        </span>
                      </div>

                      <p className="relative mt-3.5 text-stone-700 text-sm leading-relaxed whitespace-pre-line wrap-break-word">
                        {entry.content}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}