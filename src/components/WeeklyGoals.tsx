"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase, USER_ID } from "@/lib/supabase";
import { WEEKLY_TASKS, getWeekNumber } from "@/lib/constants";
import LoadingSkeleton from "./LoadingSkeleton";
import Sparkle from "./Sparkle";

export default function WeeklyGoals() {
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [prevWeekCompleted, setPrevWeekCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sparklingId, setSparklingId] = useState<number | null>(null);

  const now = new Date();
  const week = getWeekNumber(now);
  const year = now.getFullYear();
  const prevWeek = week === 1 ? 52 : week - 1;
  const prevYear = week === 1 ? year - 1 : year;

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = (completedCount / WEEKLY_TASKS.length) * 100;

  const fetchData = useCallback(async () => {
    try {
      const [currentRes, prevRes] = await Promise.all([
        supabase
          .from("weekly_tasks")
          .select("task_id, completed")
          .eq("user_id", USER_ID)
          .eq("week_number", week)
          .eq("year", year),
        supabase
          .from("weekly_tasks")
          .select("task_id, completed")
          .eq("user_id", USER_ID)
          .eq("week_number", prevWeek)
          .eq("year", prevYear),
      ]);

      if (currentRes.data) {
        const map: Record<number, boolean> = {};
        currentRes.data.forEach((t: { task_id: number; completed: boolean }) => {
          map[t.task_id] = t.completed;
        });
        setCompleted(map);
      }

      if (prevRes.data) {
        setPrevWeekCompleted(prevRes.data.filter((t: { completed: boolean }) => t.completed).length);
      }
    } catch (err) {
      console.error("Error fetching weekly data:", err);
    } finally {
      setLoading(false);
    }
  }, [week, year, prevWeek, prevYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTask = async (taskId: number) => {
    const newValue = !completed[taskId];
    setCompleted((prev) => ({ ...prev, [taskId]: newValue }));

    if (newValue) {
      setSparklingId(taskId);
      setTimeout(() => setSparklingId(null), 700);
    }

    try {
      const { data: existing } = await supabase
        .from("weekly_tasks")
        .select("id")
        .eq("user_id", USER_ID)
        .eq("task_id", taskId)
        .eq("week_number", week)
        .eq("year", year)
        .single();

      if (existing) {
        await supabase
          .from("weekly_tasks")
          .update({ completed: newValue })
          .eq("id", existing.id);
      } else {
        await supabase.from("weekly_tasks").insert({
          user_id: USER_ID,
          task_id: taskId,
          week_number: week,
          year: year,
          completed: newValue,
        });
      }
    } catch (err) {
      console.error("Error toggling weekly task:", err);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="px-4 pb-4 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold gradient-text">Weekly Goals 📅</h1>
        <p className="text-sm text-gray-500 font-body mt-0.5">
          Minggu ke-{week}, {year}
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-3xl p-4 shadow-card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-label text-gray-500">Progress Minggu Ini</span>
          <span className="text-sm font-heading font-bold text-pink-500">
            {completedCount}/{WEEKLY_TASKS.length}
          </span>
        </div>
        <div className="h-3 bg-pink-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-pink"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Week comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-3 shadow-card text-center">
          <p className="text-2xl font-heading font-bold text-pink-500">{completedCount}</p>
          <p className="text-xs font-label text-gray-400">Minggu ini</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-card text-center">
          <p className="text-2xl font-heading font-bold text-lavender-400">{prevWeekCompleted}</p>
          <p className="text-xs font-label text-gray-400">Minggu lalu</p>
        </div>
      </div>

      {/* Comparison indicator */}
      {completedCount > prevWeekCompleted ? (
        <p className="text-center text-sm text-green-500 font-body">
          📈 Kamu lebih produktif dari minggu lalu! Keep it up!
        </p>
      ) : completedCount === prevWeekCompleted ? (
        <p className="text-center text-sm text-gray-400 font-body">
          ✨ Sama dengan minggu lalu — yuk tingkatkan!
        </p>
      ) : (
        <p className="text-center text-sm text-pink-400 font-body">
          💪 Ayo kejar minggu lalu! Kamu pasti bisa!
        </p>
      )}

      {/* Weekly checklist */}
      <div>
        <h2 className="text-lg font-heading font-bold text-foreground mb-3">Target Minggu Ini</h2>
        <div className="space-y-2">
          {WEEKLY_TASKS.map((task, index) => (
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
                      <motion.path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </motion.div>
                <Sparkle show={sparklingId === task.id} />
              </div>
              <p
                className={`text-sm font-body flex-1 ${
                  completed[task.id] ? "line-through text-gray-400" : "text-foreground"
                }`}
              >
                {task.emoji} {task.label}
              </p>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className="text-[10px] font-label px-2 py-0.5 rounded-full bg-purple-50 text-purple-400 whitespace-nowrap">
                  {task.day}
                </span>
                <span className="text-[9px] font-label text-gray-300 whitespace-nowrap">{task.timeSlot}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
