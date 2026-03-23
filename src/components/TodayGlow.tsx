"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, USER_ID } from "@/lib/supabase";
import { DAILY_TASKS, AFFIRMATIONS, formatDate, formatRupiah, getTodayString, Stats } from "@/lib/constants";
import ProgressRing from "./ProgressRing";
import Confetti from "./Confetti";
import Sparkle from "./Sparkle";
import LoadingSkeleton from "./LoadingSkeleton";

export default function TodayGlow() {
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [stats, setStats] = useState<Stats>({
    current_streak: 0,
    longest_streak: 0,
    total_content_posted: 0,
    total_brand_deals: 0,
    total_earnings: 0,
    thesis_progress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sparklingId, setSparklingId] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const today = new Date();
  const todayStr = getTodayString();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const affirmation = AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = (completedCount / DAILY_TASKS.length) * 100;
  const allDone = completedCount === DAILY_TASKS.length;

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        supabase
          .from("daily_tasks")
          .select("task_id, completed")
          .eq("user_id", USER_ID)
          .eq("date", todayStr),
        supabase
          .from("stats")
          .select("*")
          .eq("user_id", USER_ID)
          .single(),
      ]);

      if (tasksRes.data) {
        const map: Record<number, boolean> = {};
        tasksRes.data.forEach((t: { task_id: number; completed: boolean }) => {
          map[t.task_id] = t.completed;
        });
        setCompleted(map);
      }

      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (allDone && !loading) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [allDone, loading]);

  const toggleTask = async (taskId: number) => {
    const newValue = !completed[taskId];
    setCompleted((prev) => ({ ...prev, [taskId]: newValue }));

    if (newValue) {
      setSparklingId(taskId);
      setTimeout(() => setSparklingId(null), 700);
    }

    try {
      const { data: existing } = await supabase
        .from("daily_tasks")
        .select("id")
        .eq("user_id", USER_ID)
        .eq("task_id", taskId)
        .eq("date", todayStr)
        .single();

      if (existing) {
        await supabase
          .from("daily_tasks")
          .update({ completed: newValue })
          .eq("id", existing.id);
      } else {
        await supabase.from("daily_tasks").insert({
          user_id: USER_ID,
          task_id: taskId,
          date: todayStr,
          completed: newValue,
        });
      }
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="px-4 pb-4 space-y-5">
      <Confetti trigger={showConfetti} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold gradient-text">
          Hi Desinta ✨
        </h1>
        <p className="text-sm text-gray-500 font-body mt-0.5">
          {formatDate(today)}
        </p>
        <motion.p
          className="text-sm text-pink-400 font-body mt-2 italic"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          &ldquo;{affirmation}&rdquo;
        </motion.p>
      </div>

      {/* Progress Ring */}
      <motion.div
        className="flex justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <ProgressRing progress={progress} />
      </motion.div>

      {/* Celebration message */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center py-3 px-4 rounded-3xl gradient-pink text-white font-heading font-bold text-lg shadow-glow"
          >
            You&apos;re GLOWING today! ✨🌸
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          className="bg-white rounded-3xl p-3 shadow-card text-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <p className="text-2xl">🔥</p>
          <p className="text-xl font-heading font-bold text-pink-500">{stats.current_streak}</p>
          <p className="text-[10px] font-label text-gray-400">Streak</p>
        </motion.div>
        <motion.div
          className="bg-white rounded-3xl p-3 shadow-card text-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <p className="text-2xl">🎥</p>
          <p className="text-xl font-heading font-bold text-pink-500">{stats.total_content_posted}</p>
          <p className="text-[10px] font-label text-gray-400">Konten</p>
        </motion.div>
        <motion.div
          className="bg-white rounded-3xl p-3 shadow-card text-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <p className="text-2xl">💰</p>
          <p className="text-sm font-heading font-bold text-pink-500">{formatRupiah(stats.total_earnings)}</p>
          <p className="text-[10px] font-label text-gray-400">Earnings</p>
        </motion.div>
      </div>

      {/* Daily Checklist */}
      <div>
        <h2 className="text-lg font-heading font-bold text-foreground mb-3">Daily Checklist</h2>
        <div className="space-y-2">
          {DAILY_TASKS.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleTask(task.id)}
              className={`relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                completed[task.id]
                  ? "bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200"
                  : "bg-white border border-gray-100 hover:border-pink-200"
              } shadow-card`}
            >
              {/* Custom Checkbox */}
              <div className="relative flex-shrink-0">
                <motion.div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                    completed[task.id]
                      ? "bg-pink-500 border-pink-500"
                      : "border-gray-300"
                  }`}
                  animate={completed[task.id] ? { scale: [1, 1.2, 1] } : {}}
                >
                  {completed[task.id] && (
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <motion.path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  )}
                </motion.div>
                <Sparkle show={sparklingId === task.id} />
              </div>

              {/* Task content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-body ${
                    completed[task.id] ? "line-through text-gray-400" : "text-foreground"
                  }`}
                >
                  {task.emoji} {task.label}
                </p>
              </div>

              {/* Time badge */}
              <span className="text-[10px] font-label px-2 py-0.5 rounded-full bg-pink-50 text-pink-400 flex-shrink-0">
                {task.time}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
