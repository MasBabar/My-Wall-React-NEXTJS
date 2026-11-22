// Mengimpor fungsi createClient dari SDK Supabase
import { createClient } from "@supabase/supabase-js";

// Membaca URL dan key publik dari file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Validasi awal agar mudah dikenali jika salah satu variabel di .env.local belum terisi
if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
}

// Membuat dan mengekspor instance client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);