export const DAILY_TASKS = [
  { id: 1, emoji: "🌅", label: "Cek email/WA — ada tawaran endorse baru?", time: "pagi" },
  { id: 2, emoji: "🌅", label: "Review & balas semua DM brand di TikTok/IG", time: "pagi" },
  { id: 3, emoji: "📚", label: "2 jam fokus skripsi — bab yang sedang dikerjakan", time: "siang" },
  { id: 4, emoji: "🎥", label: "Buat/edit 1 konten TikTok hari ini", time: "siang" },
  { id: 5, emoji: "📱", label: "Post atau schedule 1 konten ke TikTok/IG", time: "sore" },
  { id: 6, emoji: "📊", label: "Cek analytics konten kemarin — catat insight", time: "sore" },
  { id: 7, emoji: "📝", label: "Follow up brand deal yang pending", time: "malam" },
  { id: 8, emoji: "🌙", label: "Isi journal hari ini — 3 hal yang disyukuri", time: "malam" },
];

export const WEEKLY_TASKS = [
  { id: 1, emoji: "📱", label: "Post minimal 5 konten TikTok minggu ini" },
  { id: 2, emoji: "📩", label: "Kirim 3 proposal ke brand baru untuk endorse" },
  { id: 3, emoji: "📚", label: "Progress skripsi: selesaikan 1 sub-bab" },
  { id: 4, emoji: "👨‍🏫", label: "Konsultasi/bimbingan dengan dosen pembimbing (Pak Rian)" },
  { id: 5, emoji: "📊", label: "Review performa konten minggu ini (views, likes, engagement)" },
  { id: 6, emoji: "🔍", label: "Riset 3 produk/brand baru yang potential untuk endorse" },
  { id: 7, emoji: "🧖‍♀️", label: "Self-care: minimal 1 hari istirahat penuh" },
];

export const AFFIRMATIONS = [
  "Kamu sudah luar biasa hari ini, keep going! 💪",
  "Setiap langkah kecil membawamu lebih dekat ke wisuda! 🎓",
  "Skripsi + konten? Kamu multitalenta banget! ✨",
  "Hari ini adalah kesempatan baru untuk bersinar! 🌟",
  "Jangan lupa: istirahat juga bagian dari produktivitas 🧖‍♀️",
  "Kamu lebih kuat dari yang kamu pikir! 💖",
  "Setiap konten yang kamu buat menginspirasi orang lain 🎥",
  "Progress, bukan perfection — kamu sudah di jalur yang tepat! 🌸",
  "Dosen pembimbing pasti bangga sama perjuanganmu! 📚",
  "Brand-brand lucky banget bisa collab sama kamu! 💰",
  "Hari ini aku pilih untuk percaya pada prosesnya 🦋",
  "Kamu content creator DAN calon sarjana — double amazing! 🔥",
  "Setiap view, like, dan follower adalah bukti kerja kerasmu 📱",
  "Skripsimu akan jadi karya yang kamu banggakan! 📝",
  "Kamu layak mendapatkan semua hal baik yang datang padamu 💜",
  "Keep creating, keep growing, keep glowing! ✨",
  "Hari ini aku fokus pada yang bisa aku kendalikan 🎯",
  "Beauty-nya bukan cuma di konten, tapi di semangatmu! 🌺",
  "Satu langkah lagi menuju Desinta S.Pd! 🎓",
  "Engagement rate boleh naik turun, tapi semangatmu harus stay high! 📈",
  "Kamu menginspirasi banyak orang tanpa kamu sadari 💫",
  "Skripsi kelar, konten jalan — nothing can stop you! 🚀",
  "Hari ini aku bersyukur untuk semua proses yang sudah dilalui 🙏",
  "Kamu adalah bukti bahwa Gen Z bisa multitasking dan sukses! 💪",
  "Setiap brand deal adalah apresiasi untuk kreativitasmu 🎨",
  "Santai tapi pasti — itu gaya kamu dan itu valid! 🌈",
  "Kamu sudah sejauh ini, jangan berhenti sekarang! 🏃‍♀️",
  "Inner beauty + outer beauty + smart = Desinta! 👑",
  "Hari ini aku memilih untuk bersinar dengan caraku sendiri ☀️",
  "Semesta mendukung semua mimpi-mimpimu — believe it! 🌙",
];

export const MILESTONES = [
  { id: "first-content", emoji: "🌸", label: "First Content Posted", check: (s: Stats) => s.total_content_posted >= 1 },
  { id: "7-streak", emoji: "🔥", label: "7-Day Streak", check: (s: Stats) => s.longest_streak >= 7 },
  { id: "25-content", emoji: "🎥", label: "25 Konten Diposting", check: (s: Stats) => s.total_content_posted >= 25 },
  { id: "first-deal", emoji: "💰", label: "First Brand Deal Income", check: (s: Stats) => s.total_brand_deals >= 1 },
  { id: "1m-earned", emoji: "🚀", label: "Rp 1.000.000 Earned", check: (s: Stats) => s.total_earnings >= 1000000 },
  { id: "3m-earned", emoji: "⭐", label: "Rp 3.000.000 Earned", check: (s: Stats) => s.total_earnings >= 3000000 },
  { id: "5m-earned", emoji: "👑", label: "Rp 5.000.000 Earned", check: (s: Stats) => s.total_earnings >= 5000000 },
  { id: "30-streak", emoji: "🏆", label: "30-Day Streak", check: (s: Stats) => s.longest_streak >= 30 },
  { id: "50-content", emoji: "💎", label: "50 Konten Diposting", check: (s: Stats) => s.total_content_posted >= 50 },
  { id: "thesis-done", emoji: "🎓", label: "Skripsi Selesai!", check: (s: Stats) => s.thesis_progress >= 100 },
  { id: "100-content", emoji: "🌟", label: "100 Konten Diposting", check: (s: Stats) => s.total_content_posted >= 100 },
];

export const THESIS_STAGES = [
  { label: "Proposal", min: 0, max: 20 },
  { label: "Penelitian", min: 20, max: 40 },
  { label: "Pengolahan Data", min: 40, max: 60 },
  { label: "Penulisan", min: 60, max: 80 },
  { label: "Sidang", min: 80, max: 100 },
];

export const INCOME_SOURCES = [
  "TikTok Endorse",
  "Instagram Endorse",
  "TikTok Affiliate",
  "Brand Deal Langsung",
  "Lainnya",
];

export const CONTENT_TYPES = ["Review", "GRWM", "Tutorial", "Endorse", "Other"];
export const PLATFORMS = ["TikTok", "Instagram", "Both"];
export const CONTENT_STATUSES = ["idea", "filming", "editing", "posted"];

export const MOOD_OPTIONS = [
  { value: "glowing", emoji: "✨", label: "Glowing" },
  { value: "happy", emoji: "😊", label: "Happy" },
  { value: "okay", emoji: "🙂", label: "Okay" },
  { value: "tired", emoji: "😮‍💨", label: "Tired" },
];

export interface Stats {
  current_streak: number;
  longest_streak: number;
  total_content_posted: number;
  total_brand_deals: number;
  total_earnings: number;
  thesis_progress: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  note: string;
  created_at: string;
}

export interface IncomeEntry {
  id: string;
  date: string;
  source: string;
  amount: number;
  description: string;
  created_at: string;
}

export interface ContentEntry {
  id: string;
  date: string;
  platform: string;
  content_type: string;
  brand_name: string | null;
  status: string;
  notes: string;
  created_at: string;
}

// ── Self Body Care ──────────────────────────────────────────────

export const SKINCARE_AM = [
  { id: 1, emoji: "🧴", label: "Cleanser / Face wash" },
  { id: 2, emoji: "💧", label: "Toner" },
  { id: 3, emoji: "✨", label: "Serum (Vitamin C / Niacinamide)" },
  { id: 4, emoji: "🧊", label: "Moisturizer" },
  { id: 5, emoji: "☀️", label: "Sunscreen SPF 30+" },
];

export const SKINCARE_PM = [
  { id: 6, emoji: "🫧", label: "Double cleanse (oil + foam)" },
  { id: 7, emoji: "💧", label: "Toner" },
  { id: 8, emoji: "🌙", label: "Serum (Retinol / AHA-BHA)" },
  { id: 9, emoji: "👁️", label: "Eye cream" },
  { id: 10, emoji: "🧴", label: "Night cream / Sleeping mask" },
];

export const WEEKLY_CARE_ITEMS = [
  { id: 1, emoji: "🧖‍♀️", label: "Face mask / Sheet mask", frequency: "2x/minggu" },
  { id: 2, emoji: "🧽", label: "Exfoliasi / Scrub wajah", frequency: "1-2x/minggu" },
  { id: 3, emoji: "🛁", label: "Body scrub", frequency: "2x/minggu" },
  { id: 4, emoji: "💆‍♀️", label: "Hair mask / Treatment", frequency: "1x/minggu" },
  { id: 5, emoji: "💅", label: "Nail care (potong, file, cuticle)", frequency: "1x/minggu" },
  { id: 6, emoji: "🦶", label: "Foot care / Scrub kaki", frequency: "1x/minggu" },
  { id: 7, emoji: "🫶", label: "Full body moisturizing", frequency: "Setiap hari" },
  { id: 8, emoji: "💋", label: "Lip scrub + lip mask", frequency: "2x/minggu" },
];

export const SKIN_CONDITIONS = [
  { value: "glowing", emoji: "✨", label: "Glowing" },
  { value: "normal", emoji: "😊", label: "Normal" },
  { value: "oily", emoji: "💦", label: "Oily" },
  { value: "dry", emoji: "🏜️", label: "Kering" },
  { value: "breakout", emoji: "😣", label: "Breakout" },
];

export interface SkinLogEntry {
  id: string;
  date: string;
  condition: string;
  note: string;
  created_at: string;
}

export interface BodyCareProduct {
  id: string;
  name: string;
  category: string;
  opened_date: string;
  expiry_months: number;
  notes: string;
  is_active: boolean;
  created_at: string;
}

export const PRODUCT_CATEGORIES = [
  "Cleanser",
  "Toner",
  "Serum",
  "Moisturizer",
  "Sunscreen",
  "Mask",
  "Body Care",
  "Hair Care",
  "Lip Care",
  "Lainnya",
];

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
