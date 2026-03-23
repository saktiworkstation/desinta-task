"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, USER_ID } from "@/lib/supabase";
import {
  MOOD_OPTIONS,
  MILESTONES,
  THESIS_STAGES,
  JournalEntry,
  Stats,
  getTodayString,
} from "@/lib/constants";
import LoadingSkeleton from "./LoadingSkeleton";

export default function JournalMilestones() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    current_streak: 0,
    longest_streak: 0,
    total_content_posted: 0,
    total_brand_deals: 0,
    total_earnings: 0,
    thesis_progress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [mood, setMood] = useState("happy");
  const [note, setNote] = useState("");
  const [thesisProgress, setThesisProgress] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysStr = sevenDaysAgo.toISOString().split("T")[0];

      const [journalRes, statsRes] = await Promise.all([
        supabase
          .from("journal")
          .select("*")
          .eq("user_id", USER_ID)
          .gte("date", sevenDaysStr)
          .order("date", { ascending: false }),
        supabase
          .from("stats")
          .select("*")
          .eq("user_id", USER_ID)
          .single(),
      ]);

      if (journalRes.data) setEntries(journalRes.data);
      if (statsRes.data) {
        setStats(statsRes.data);
        setThesisProgress(statsRes.data.thesis_progress);
      }
    } catch (err) {
      console.error("Error fetching journal data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveJournal = async () => {
    const todayStr = getTodayString();

    try {
      // Check if entry exists for today
      const { data: existing } = await supabase
        .from("journal")
        .select("id")
        .eq("user_id", USER_ID)
        .eq("date", todayStr)
        .single();

      if (existing) {
        await supabase
          .from("journal")
          .update({ mood, note })
          .eq("id", existing.id);

        setEntries((prev) =>
          prev.map((e) => (e.id === existing.id ? { ...e, mood, note } : e))
        );
      } else {
        const { data } = await supabase
          .from("journal")
          .insert({
            user_id: USER_ID,
            date: todayStr,
            mood,
            note,
          })
          .select()
          .single();

        if (data) {
          setEntries((prev) => [data, ...prev]);
        }
      }

      setShowForm(false);
      setNote("");
    } catch (err) {
      console.error("Error saving journal:", err);
    }
  };

  const updateThesisProgress = async (value: number) => {
    setThesisProgress(value);
    setStats((prev) => ({ ...prev, thesis_progress: value }));

    try {
      await supabase
        .from("stats")
        .update({ thesis_progress: value, updated_at: new Date().toISOString() })
        .eq("user_id", USER_ID);
    } catch (err) {
      console.error("Error updating thesis progress:", err);
    }
  };

  const getMoodEmoji = (moodValue: string) => {
    return MOOD_OPTIONS.find((m) => m.value === moodValue)?.emoji || "🙂";
  };

  const getCurrentThesisStage = () => {
    return THESIS_STAGES.find((s) => thesisProgress >= s.min && thesisProgress <= s.max) || THESIS_STAGES[0];
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="px-4 pb-4 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-heading font-bold gradient-text">Journal & Milestones 📓</h1>
          <p className="text-sm text-gray-500 font-body mt-0.5">Refleksi & pencapaianmu</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="gradient-pink text-white px-4 py-2 rounded-2xl text-sm font-label shadow-soft"
        >
          {showForm ? "✕" : "+ Journal"}
        </motion.button>
      </div>

      {/* Journal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl p-4 shadow-card space-y-4 overflow-hidden"
          >
            {/* Mood picker */}
            <div>
              <label className="text-xs font-label text-gray-500 mb-2 block">Mood hari ini</label>
              <div className="flex gap-3 justify-center">
                {MOOD_OPTIONS.map((m) => (
                  <motion.button
                    key={m.value}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
                      mood === m.value
                        ? "bg-pink-50 border-2 border-pink-300 shadow-soft"
                        : "bg-gray-50 border-2 border-transparent"
                    }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] font-label mt-1 text-gray-500">{m.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-label text-gray-500 mb-1 block">
                Catatan hari ini & 3 hal yang disyukuri
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Hari ini aku bersyukur untuk...&#10;1. &#10;2. &#10;3. "
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none resize-none"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={saveJournal}
              className="w-full gradient-pink text-white py-2.5 rounded-2xl font-label text-sm shadow-soft"
            >
              Simpan Journal ✨
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journal entries - last 7 days */}
      <div>
        <h3 className="text-sm font-label font-semibold text-gray-500 mb-3">7 Hari Terakhir</h3>
        {entries.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm text-gray-400 font-body">Belum ada jurnal. Yuk mulai tulis!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-3 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{getMoodEmoji(entry.mood)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-label text-gray-400">
                      {new Date(entry.date + "T00:00:00").toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    {entry.note && (
                      <p className="text-sm font-body text-foreground mt-1 whitespace-pre-wrap">
                        {entry.note}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Thesis Progress */}
      <div className="bg-white rounded-3xl p-4 shadow-card">
        <h3 className="text-sm font-label font-semibold text-gray-500 mb-3">
          🎓 Progress Skripsi
        </h3>
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-label text-pink-500 font-semibold">
              {getCurrentThesisStage().label}
            </span>
            <span className="text-xs font-heading font-bold text-pink-500">{thesisProgress}%</span>
          </div>
          <div className="h-3 bg-pink-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full gradient-pink-lavender"
              animate={{ width: `${thesisProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={thesisProgress}
          onChange={(e) => updateThesisProgress(parseInt(e.target.value))}
          className="w-full accent-pink-500"
        />
        {/* Stage markers */}
        <div className="flex justify-between mt-2">
          {THESIS_STAGES.map((stage) => (
            <span
              key={stage.label}
              className={`text-[8px] font-label ${
                thesisProgress >= stage.min ? "text-pink-400" : "text-gray-300"
              }`}
            >
              {stage.label}
            </span>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h3 className="text-sm font-label font-semibold text-gray-500 mb-3">✨ Milestones</h3>
        <div className="grid grid-cols-2 gap-2">
          {MILESTONES.map((milestone) => {
            const unlocked = milestone.check(stats);
            return (
              <motion.div
                key={milestone.id}
                className={`relative rounded-2xl p-3 text-center transition-all ${
                  unlocked
                    ? "bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 shadow-soft"
                    : "bg-gray-50 border border-gray-100"
                }`}
                whileHover={unlocked ? { scale: 1.02 } : {}}
              >
                <span className={`text-2xl ${unlocked ? "" : "grayscale opacity-40"}`}>
                  {milestone.emoji}
                </span>
                <p
                  className={`text-xs font-label mt-1 ${
                    unlocked ? "text-pink-600 font-semibold" : "text-gray-400"
                  }`}
                >
                  {milestone.label}
                </p>
                {unlocked && (
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-xs">✦</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
