"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, USER_ID } from "@/lib/supabase";
import { CONTENT_TYPES, PLATFORMS, CONTENT_STATUSES, ContentEntry, getTodayString } from "@/lib/constants";
import LoadingSkeleton from "./LoadingSkeleton";

const STATUS_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  idea: { label: "Idea", emoji: "💡", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
  filming: { label: "Filming", emoji: "🎥", color: "bg-blue-50 border-blue-200 text-blue-700" },
  editing: { label: "Editing", emoji: "✂️", color: "bg-purple-50 border-purple-200 text-purple-700" },
  posted: { label: "Posted", emoji: "✅", color: "bg-green-50 border-green-200 text-green-700" },
};

type FilterRange = "week" | "month" | "all";

export default function ContentPlanner() {
  const [contents, setContents] = useState<ContentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<FilterRange>("week");

  // Form state
  const [formDate, setFormDate] = useState(getTodayString());
  const [formPlatform, setFormPlatform] = useState("TikTok");
  const [formType, setFormType] = useState("Review");
  const [formBrand, setFormBrand] = useState("");
  const [formStatus, setFormStatus] = useState("idea");
  const [formScheduledTime, setFormScheduledTime] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const fetchContents = useCallback(async () => {
    try {
      let query = supabase
        .from("content_tracker")
        .select("*")
        .eq("user_id", USER_ID)
        .order("created_at", { ascending: false });

      const now = new Date();
      if (filter === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte("date", weekAgo.toISOString().split("T")[0]);
      } else if (filter === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte("date", monthAgo.toISOString().split("T")[0]);
      }

      const { data } = await query;
      if (data) setContents(data);
    } catch (err) {
      console.error("Error fetching contents:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const addContent = async () => {
    try {
      const { data } = await supabase
        .from("content_tracker")
        .insert({
          user_id: USER_ID,
          date: formDate,
          platform: formPlatform,
          content_type: formType,
          brand_name: formBrand || null,
          status: formStatus,
          scheduled_time: formScheduledTime || null,
          notes: formNotes,
        })
        .select()
        .single();

      if (data) {
        setContents((prev) => [data, ...prev]);

        // Update stats if posted
        if (formStatus === "posted") {
          const { data: statsData } = await supabase
            .from("stats")
            .select("total_content_posted")
            .eq("user_id", USER_ID)
            .single();
          if (statsData) {
            await supabase
              .from("stats")
              .update({
                total_content_posted: statsData.total_content_posted + 1,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", USER_ID);
          }
        }
      }

      setShowForm(false);
      setFormBrand("");
      setFormNotes("");
      setFormStatus("idea");
      setFormScheduledTime("");
    } catch (err) {
      console.error("Error adding content:", err);
    }
  };

  const changeStatus = async (content: ContentEntry) => {
    const currentIndex = CONTENT_STATUSES.indexOf(content.status);
    const nextIndex = (currentIndex + 1) % CONTENT_STATUSES.length;
    const nextStatus = CONTENT_STATUSES[nextIndex];

    try {
      await supabase
        .from("content_tracker")
        .update({ status: nextStatus })
        .eq("id", content.id);

      setContents((prev) =>
        prev.map((c) => (c.id === content.id ? { ...c, status: nextStatus } : c))
      );

      // If changing to posted, update stats
      if (nextStatus === "posted" && content.status !== "posted") {
        const { data: stats } = await supabase
          .from("stats")
          .select("total_content_posted")
          .eq("user_id", USER_ID)
          .single();
        if (stats) {
          await supabase
            .from("stats")
            .update({
              total_content_posted: stats.total_content_posted + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", USER_ID);
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const getCountByStatus = (status: string) => contents.filter((c) => c.status === status).length;

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="px-4 pb-4 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-heading font-bold gradient-text">Content Planner 🎬</h1>
          <p className="text-sm text-gray-500 font-body mt-0.5">Kelola konten TikTok & IG</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="gradient-pink text-white px-4 py-2 rounded-2xl text-sm font-label shadow-soft"
        >
          {showForm ? "✕" : "+ Baru"}
        </motion.button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl p-4 shadow-card space-y-3 overflow-hidden"
          >
            <div>
              <label className="text-xs font-label text-gray-500 mb-1 block">Tanggal</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-label text-gray-500 mb-1 block">Platform</label>
                <select
                  value={formPlatform}
                  onChange={(e) => setFormPlatform(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-label text-gray-500 mb-1 block">Tipe</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none"
                >
                  {CONTENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-label text-gray-500 mb-1 block">Brand (opsional)</label>
                <input
                  type="text"
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                  placeholder="Nama brand..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-label text-gray-500 mb-1 block">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none"
                >
                  {CONTENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-label text-gray-500 mb-1 block">
                ⏰ Jam Tayang <span className="text-gray-300">(opsional — prime time TikTok: 17:00–21:00)</span>
              </label>
              <input
                type="time"
                value={formScheduledTime}
                onChange={(e) => setFormScheduledTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-label text-gray-500 mb-1 block">Catatan</label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Catatan..."
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none resize-none"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={addContent}
              className="w-full gradient-pink text-white py-2.5 rounded-2xl font-label text-sm shadow-soft"
            >
              Simpan Konten ✨
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status counters */}
      <div className="grid grid-cols-4 gap-2">
        {CONTENT_STATUSES.map((status) => (
          <div
            key={status}
            className={`rounded-2xl p-2 text-center border ${STATUS_LABELS[status].color}`}
          >
            <p className="text-lg">{STATUS_LABELS[status].emoji}</p>
            <p className="text-lg font-heading font-bold">{getCountByStatus(status)}</p>
            <p className="text-[10px] font-label">{STATUS_LABELS[status].label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["week", "month", "all"] as FilterRange[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-label transition-all ${
              filter === f
                ? "gradient-pink text-white shadow-soft"
                : "bg-white text-gray-500 border border-gray-200"
            }`}
          >
            {f === "week" ? "Minggu ini" : f === "month" ? "Bulan ini" : "Semua"}
          </button>
        ))}
      </div>

      {/* Kanban-style columns */}
      <div className="space-y-4">
        {CONTENT_STATUSES.map((status) => {
          const items = contents.filter((c) => c.status === status);
          if (items.length === 0) return null;
          return (
            <div key={status}>
              <h3 className="text-sm font-label font-semibold text-gray-500 mb-2 flex items-center gap-1">
                {STATUS_LABELS[status].emoji} {STATUS_LABELS[status].label}
                <span className="text-xs text-gray-400 ml-1">({items.length})</span>
              </h3>
              <div className="space-y-2">
                {items.map((content) => (
                  <motion.div
                    key={content.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-2xl p-3 shadow-card border border-gray-100`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-pink-50 text-pink-500 font-label">
                            {content.platform}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-lavender-200 text-purple-700 font-label">
                            {content.content_type}
                          </span>
                          {content.brand_name && (
                            <span className="text-xs text-gray-500 font-body">
                              • {content.brand_name}
                            </span>
                          )}
                        </div>
                        {content.notes && (
                          <p className="text-xs text-gray-400 font-body mt-1 truncate">{content.notes}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-gray-300 font-label">{content.date}</p>
                          {content.scheduled_time && (
                            <span className="text-[10px] font-label text-pink-400 bg-pink-50 px-1.5 py-0.5 rounded-full">
                              ⏰ {content.scheduled_time}
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => changeStatus(content)}
                        className={`ml-2 px-2 py-1 rounded-xl text-[10px] font-label border flex-shrink-0 ${
                          STATUS_LABELS[
                            CONTENT_STATUSES[(CONTENT_STATUSES.indexOf(content.status) + 1) % CONTENT_STATUSES.length]
                          ].color
                        }`}
                      >
                        → {STATUS_LABELS[
                          CONTENT_STATUSES[(CONTENT_STATUSES.indexOf(content.status) + 1) % CONTENT_STATUSES.length]
                        ].label}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {contents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-4xl mb-2">🎬</p>
          <p className="text-sm text-gray-400 font-body">Belum ada konten. Yuk mulai buat!</p>
        </div>
      )}
    </div>
  );
}
