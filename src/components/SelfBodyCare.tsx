"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, USER_ID } from "@/lib/supabase";
import {
  SKINCARE_AM,
  SKINCARE_PM,
  WEEKLY_CARE_ITEMS,
  SKIN_CONDITIONS,
  PRODUCT_CATEGORIES,
  SkinLogEntry,
  BodyCareProduct,
  getTodayString,
  getWeekNumber,
} from "@/lib/constants";
import LoadingSkeleton from "./LoadingSkeleton";
import Sparkle from "./Sparkle";

type Section = "routine" | "weekly" | "skin-log" | "products";

export default function SelfBodyCare() {
  const [activeSection, setActiveSection] = useState<Section>("routine");
  const [loading, setLoading] = useState(true);

  // Daily routine state
  const [completedAM, setCompletedAM] = useState<Record<number, boolean>>({});
  const [completedPM, setCompletedPM] = useState<Record<number, boolean>>({});
  const [sparklingId, setSparklingId] = useState<number | null>(null);

  // Weekly care state
  const [completedWeekly, setCompletedWeekly] = useState<Record<number, boolean>>({});

  // Skin log state
  const [skinLogs, setSkinLogs] = useState<SkinLogEntry[]>([]);
  const [showSkinForm, setShowSkinForm] = useState(false);
  const [skinCondition, setSkinCondition] = useState("normal");
  const [skinNote, setSkinNote] = useState("");

  // Product tracker state
  const [products, setProducts] = useState<BodyCareProduct[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("Cleanser");
  const [productOpenedDate, setProductOpenedDate] = useState(getTodayString());
  const [productExpiryMonths, setProductExpiryMonths] = useState(12);
  const [productNotes, setProductNotes] = useState("");

  // Streak
  const [careStreak, setCareStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [streakUpdatedToday, setStreakUpdatedToday] = useState(false);

  const todayStr = getTodayString();
  const weekNumber = getWeekNumber(new Date());
  const year = new Date().getFullYear();

  const amCount = Object.values(completedAM).filter(Boolean).length;
  const pmCount = Object.values(completedPM).filter(Boolean).length;
  const totalRoutine = SKINCARE_AM.length + SKINCARE_PM.length;
  const routineProgress = ((amCount + pmCount) / totalRoutine) * 100;
  const weeklyCount = Object.values(completedWeekly).filter(Boolean).length;
  const weeklyProgress = (weeklyCount / WEEKLY_CARE_ITEMS.length) * 100;

  const fetchData = useCallback(async () => {
    try {
      const [amRes, pmRes, weeklyRes, skinRes, productRes, streakRes] = await Promise.all([
        supabase
          .from("bodycare_daily")
          .select("item_id, completed")
          .eq("user_id", USER_ID)
          .eq("date", todayStr)
          .eq("routine", "am"),
        supabase
          .from("bodycare_daily")
          .select("item_id, completed")
          .eq("user_id", USER_ID)
          .eq("date", todayStr)
          .eq("routine", "pm"),
        supabase
          .from("bodycare_weekly")
          .select("item_id, completed")
          .eq("user_id", USER_ID)
          .eq("week_number", weekNumber)
          .eq("year", year),
        supabase
          .from("skin_log")
          .select("*")
          .eq("user_id", USER_ID)
          .order("date", { ascending: false })
          .limit(14),
        supabase
          .from("bodycare_products")
          .select("*")
          .eq("user_id", USER_ID)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("bodycare_streak")
          .select("current_streak, longest_streak, updated_at")
          .eq("user_id", USER_ID)
          .single(),
      ]);

      if (amRes.data) {
        const map: Record<number, boolean> = {};
        amRes.data.forEach((t: { item_id: number; completed: boolean }) => {
          map[t.item_id] = t.completed;
        });
        setCompletedAM(map);
      }

      if (pmRes.data) {
        const map: Record<number, boolean> = {};
        pmRes.data.forEach((t: { item_id: number; completed: boolean }) => {
          map[t.item_id] = t.completed;
        });
        setCompletedPM(map);
      }

      if (weeklyRes.data) {
        const map: Record<number, boolean> = {};
        weeklyRes.data.forEach((t: { item_id: number; completed: boolean }) => {
          map[t.item_id] = t.completed;
        });
        setCompletedWeekly(map);
      }

      if (skinRes.data) setSkinLogs(skinRes.data);
      if (productRes.data) setProducts(productRes.data);
      if (streakRes.data) {
        setCareStreak(streakRes.data.current_streak);
        setLongestStreak(streakRes.data.longest_streak);
        // Check if streak was already updated today
        if (streakRes.data.updated_at) {
          const lastUpdate = streakRes.data.updated_at.split("T")[0];
          setStreakUpdatedToday(lastUpdate === todayStr);
        }
      }
    } catch (err) {
      console.error("Error fetching body care data:", err);
    } finally {
      setLoading(false);
    }
  }, [todayStr, weekNumber, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update streak when all daily routine items are completed
  const updateStreak = useCallback(async () => {
    if (streakUpdatedToday) return;

    const newStreak = careStreak + 1;
    const newLongest = Math.max(newStreak, longestStreak);

    setCareStreak(newStreak);
    setLongestStreak(newLongest);
    setStreakUpdatedToday(true);

    try {
      await supabase
        .from("bodycare_streak")
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", USER_ID);
    } catch (err) {
      console.error("Error updating streak:", err);
    }
  }, [careStreak, longestStreak, streakUpdatedToday]);

  // Reset streak if yesterday was missed (check on load)
  const checkStreakContinuity = useCallback(async () => {
    if (loading) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    try {
      const { data } = await supabase
        .from("bodycare_daily")
        .select("item_id, completed")
        .eq("user_id", USER_ID)
        .eq("date", yesterdayStr);

      if (data) {
        const yesterdayCompleted = data.filter((t: { completed: boolean }) => t.completed).length;
        // If yesterday had no completed items at all and streak > 0, reset
        if (yesterdayCompleted === 0 && careStreak > 0 && !streakUpdatedToday) {
          setCareStreak(0);
          await supabase
            .from("bodycare_streak")
            .update({ current_streak: 0, updated_at: new Date().toISOString() })
            .eq("user_id", USER_ID);
        }
      }
    } catch (err) {
      console.error("Error checking streak continuity:", err);
    }
  }, [loading, careStreak, streakUpdatedToday]);

  useEffect(() => {
    checkStreakContinuity();
  }, [checkStreakContinuity]);

  // Trigger streak update when routine hits 100%
  useEffect(() => {
    if (routineProgress === 100 && !loading && !streakUpdatedToday) {
      updateStreak();
    }
  }, [routineProgress, loading, streakUpdatedToday, updateStreak]);

  const toggleRoutineItem = async (itemId: number, routine: "am" | "pm") => {
    const setter = routine === "am" ? setCompletedAM : setCompletedPM;
    const current = routine === "am" ? completedAM : completedPM;
    const newValue = !current[itemId];

    setter((prev) => ({ ...prev, [itemId]: newValue }));

    if (newValue) {
      setSparklingId(itemId);
      setTimeout(() => setSparklingId(null), 700);
    }

    try {
      const { data: existing } = await supabase
        .from("bodycare_daily")
        .select("id")
        .eq("user_id", USER_ID)
        .eq("item_id", itemId)
        .eq("date", todayStr)
        .eq("routine", routine)
        .single();

      if (existing) {
        await supabase
          .from("bodycare_daily")
          .update({ completed: newValue })
          .eq("id", existing.id);
      } else {
        await supabase.from("bodycare_daily").insert({
          user_id: USER_ID,
          item_id: itemId,
          date: todayStr,
          routine,
          completed: newValue,
        });
      }
    } catch (err) {
      console.error("Error toggling routine item:", err);
    }
  };

  const toggleWeeklyItem = async (itemId: number) => {
    const newValue = !completedWeekly[itemId];
    setCompletedWeekly((prev) => ({ ...prev, [itemId]: newValue }));

    if (newValue) {
      setSparklingId(itemId + 100);
      setTimeout(() => setSparklingId(null), 700);
    }

    try {
      const { data: existing } = await supabase
        .from("bodycare_weekly")
        .select("id")
        .eq("user_id", USER_ID)
        .eq("item_id", itemId)
        .eq("week_number", weekNumber)
        .eq("year", year)
        .single();

      if (existing) {
        await supabase
          .from("bodycare_weekly")
          .update({ completed: newValue })
          .eq("id", existing.id);
      } else {
        await supabase.from("bodycare_weekly").insert({
          user_id: USER_ID,
          item_id: itemId,
          week_number: weekNumber,
          year,
          completed: newValue,
        });
      }
    } catch (err) {
      console.error("Error toggling weekly item:", err);
    }
  };

  const saveSkinLog = async () => {
    try {
      const { data: existing } = await supabase
        .from("skin_log")
        .select("id")
        .eq("user_id", USER_ID)
        .eq("date", todayStr)
        .single();

      if (existing) {
        await supabase
          .from("skin_log")
          .update({ condition: skinCondition, note: skinNote })
          .eq("id", existing.id);

        setSkinLogs((prev) =>
          prev.map((e) =>
            e.id === existing.id ? { ...e, condition: skinCondition, note: skinNote } : e
          )
        );
      } else {
        const { data } = await supabase
          .from("skin_log")
          .insert({
            user_id: USER_ID,
            date: todayStr,
            condition: skinCondition,
            note: skinNote,
          })
          .select()
          .single();

        if (data) setSkinLogs((prev) => [data, ...prev]);
      }

      setShowSkinForm(false);
      setSkinNote("");
    } catch (err) {
      console.error("Error saving skin log:", err);
    }
  };

  const saveProduct = async () => {
    if (!productName.trim()) return;

    try {
      const { data } = await supabase
        .from("bodycare_products")
        .insert({
          user_id: USER_ID,
          name: productName,
          category: productCategory,
          opened_date: productOpenedDate,
          expiry_months: productExpiryMonths,
          notes: productNotes,
          is_active: true,
        })
        .select()
        .single();

      if (data) setProducts((prev) => [data, ...prev]);

      setShowProductForm(false);
      setProductName("");
      setProductNotes("");
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const archiveProduct = async (productId: string) => {
    try {
      await supabase
        .from("bodycare_products")
        .update({ is_active: false })
        .eq("id", productId);

      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Error archiving product:", err);
    }
  };

  const getConditionEmoji = (condition: string) => {
    return SKIN_CONDITIONS.find((c) => c.value === condition)?.emoji || "😊";
  };

  const getExpiryStatus = (product: BodyCareProduct) => {
    const opened = new Date(product.opened_date);
    const expiry = new Date(opened);
    expiry.setMonth(expiry.getMonth() + product.expiry_months);
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / 86400000);

    if (daysLeft < 0) return { label: "Expired", color: "text-red-500 bg-red-50", urgent: true };
    if (daysLeft <= 30) return { label: `${daysLeft}d left`, color: "text-orange-500 bg-orange-50", urgent: true };
    if (daysLeft <= 90) return { label: `${Math.ceil(daysLeft / 30)}mo left`, color: "text-yellow-600 bg-yellow-50", urgent: false };
    return { label: `${Math.ceil(daysLeft / 30)}mo left`, color: "text-green-500 bg-green-50", urgent: false };
  };

  const sections: { id: Section; emoji: string; label: string }[] = [
    { id: "routine", emoji: "🧴", label: "Routine" },
    { id: "weekly", emoji: "🧖‍♀️", label: "Weekly" },
    { id: "skin-log", emoji: "📊", label: "Skin Log" },
    { id: "products", emoji: "🧪", label: "Products" },
  ];

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="px-4 pb-4 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold gradient-text">Self Body Care 🧖‍♀️</h1>
        <p className="text-sm text-gray-500 font-body mt-0.5">Track & rawat dirimu setiap hari</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          className="bg-white rounded-3xl p-3 shadow-card text-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <p className="text-2xl">🔥</p>
          <p className="text-xl font-heading font-bold text-pink-500">{careStreak}</p>
          <p className="text-[10px] font-label text-gray-400">Care Streak</p>
        </motion.div>
        <motion.div
          className="bg-white rounded-3xl p-3 shadow-card text-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <p className="text-2xl">🌅</p>
          <p className="text-xl font-heading font-bold text-pink-500">{Math.round(routineProgress)}%</p>
          <p className="text-[10px] font-label text-gray-400">Hari Ini</p>
        </motion.div>
        <motion.div
          className="bg-white rounded-3xl p-3 shadow-card text-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <p className="text-2xl">🧖‍♀️</p>
          <p className="text-xl font-heading font-bold text-pink-500">{Math.round(weeklyProgress)}%</p>
          <p className="text-[10px] font-label text-gray-400">Mingguan</p>
        </motion.div>
      </div>

      {/* Section Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-label whitespace-nowrap transition-all ${
              activeSection === section.id
                ? "gradient-pink text-white shadow-soft"
                : "bg-white text-gray-500 border border-gray-100 shadow-card"
            }`}
          >
            <span>{section.emoji}</span>
            <span>{section.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          {/* ─── DAILY ROUTINE ─── */}
          {activeSection === "routine" && (
            <div className="space-y-5">
              {/* AM Routine */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-label font-semibold text-gray-500">
                      ☀️ Morning Routine
                    </h3>
                    <span className="text-[10px] font-label text-pink-300">09:00 – 09:15</span>
                  </div>
                  <span className="text-xs font-label text-pink-400">
                    {amCount}/{SKINCARE_AM.length}
                  </span>
                </div>
                <div className="h-1.5 bg-pink-100 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="h-full rounded-full gradient-pink"
                    animate={{ width: `${(amCount / SKINCARE_AM.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="space-y-2">
                  {SKINCARE_AM.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleRoutineItem(item.id, "am")}
                      className={`relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                        completedAM[item.id]
                          ? "bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200"
                          : "bg-white border border-gray-100 hover:border-pink-200"
                      } shadow-card`}
                    >
                      <div className="relative flex-shrink-0">
                        <motion.div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                            completedAM[item.id]
                              ? "bg-pink-500 border-pink-500"
                              : "border-gray-300"
                          }`}
                          animate={completedAM[item.id] ? { scale: [1, 1.2, 1] } : {}}
                        >
                          {completedAM[item.id] && (
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
                        <Sparkle show={sparklingId === item.id} />
                      </div>
                      <p className={`text-sm font-body flex-1 ${completedAM[item.id] ? "line-through text-gray-400" : "text-foreground"}`}>
                        {item.emoji} {item.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* PM Routine */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-label font-semibold text-gray-500">
                      🌙 Night Routine
                    </h3>
                    <span className="text-[10px] font-label text-purple-300">22:30 – 23:00</span>
                  </div>
                  <span className="text-xs font-label text-pink-400">
                    {pmCount}/{SKINCARE_PM.length}
                  </span>
                </div>
                <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="h-full rounded-full gradient-pink-lavender"
                    animate={{ width: `${(pmCount / SKINCARE_PM.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="space-y-2">
                  {SKINCARE_PM.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleRoutineItem(item.id, "pm")}
                      className={`relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                        completedPM[item.id]
                          ? "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
                          : "bg-white border border-gray-100 hover:border-purple-200"
                      } shadow-card`}
                    >
                      <div className="relative flex-shrink-0">
                        <motion.div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                            completedPM[item.id]
                              ? "bg-purple-500 border-purple-500"
                              : "border-gray-300"
                          }`}
                          animate={completedPM[item.id] ? { scale: [1, 1.2, 1] } : {}}
                        >
                          {completedPM[item.id] && (
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
                        <Sparkle show={sparklingId === item.id} />
                      </div>
                      <p className={`text-sm font-body flex-1 ${completedPM[item.id] ? "line-through text-gray-400" : "text-foreground"}`}>
                        {item.emoji} {item.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Daily completion message */}
              <AnimatePresence>
                {routineProgress === 100 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center py-3 px-4 rounded-3xl gradient-pink-lavender text-white font-heading font-bold text-base shadow-glow"
                  >
                    Skincare routine complete! Your skin says thank you 🌸✨
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ─── WEEKLY CARE ─── */}
          {activeSection === "weekly" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-label font-semibold text-gray-500">
                  Minggu ke-{weekNumber} — Perawatan Mingguan
                </h3>
                <span className="text-xs font-label text-pink-400">
                  {weeklyCount}/{WEEKLY_CARE_ITEMS.length}
                </span>
              </div>
              <div className="h-2 bg-pink-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full gradient-pink-lavender"
                  animate={{ width: `${weeklyProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="space-y-2">
                {WEEKLY_CARE_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleWeeklyItem(item.id)}
                    className={`relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                      completedWeekly[item.id]
                        ? "bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200"
                        : "bg-white border border-gray-100 hover:border-pink-200"
                    } shadow-card`}
                  >
                    <div className="relative flex-shrink-0">
                      <motion.div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          completedWeekly[item.id]
                            ? "bg-pink-500 border-pink-500"
                            : "border-gray-300"
                        }`}
                        animate={completedWeekly[item.id] ? { scale: [1, 1.2, 1] } : {}}
                      >
                        {completedWeekly[item.id] && (
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
                      <Sparkle show={sparklingId === item.id + 100} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-body ${completedWeekly[item.id] ? "line-through text-gray-400" : "text-foreground"}`}>
                        {item.emoji} {item.label}
                      </p>
                    </div>
                    <span className="text-[10px] font-label px-2 py-0.5 rounded-full bg-purple-50 text-purple-400 flex-shrink-0">
                      {item.frequency}
                    </span>
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {weeklyProgress === 100 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center py-3 px-4 rounded-3xl gradient-pink text-white font-heading font-bold text-base shadow-glow"
                  >
                    Semua perawatan mingguan selesai! Queen behavior 👑
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ─── SKIN LOG ─── */}
          {activeSection === "skin-log" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-label font-semibold text-gray-500">
                  Kondisi Kulit — 14 Hari Terakhir
                </h3>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSkinForm(!showSkinForm)}
                  className="gradient-pink text-white px-4 py-2 rounded-2xl text-sm font-label shadow-soft"
                >
                  {showSkinForm ? "✕" : "+ Log"}
                </motion.button>
              </div>

              {/* Skin condition mini chart */}
              {skinLogs.length > 0 && (
                <div className="bg-white rounded-3xl p-4 shadow-card">
                  <div className="flex items-end gap-1 justify-center h-16">
                    {skinLogs.slice(0, 14).reverse().map((log, i) => {
                      const conditionIndex = SKIN_CONDITIONS.findIndex((c) => c.value === log.condition);
                      const height = conditionIndex === 0 ? 100 : conditionIndex === 1 ? 75 : conditionIndex === 2 ? 55 : conditionIndex === 3 ? 35 : 20;
                      return (
                        <motion.div
                          key={log.id}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: i * 0.05, duration: 0.3 }}
                          className={`flex-1 rounded-t-lg max-w-[24px] ${
                            conditionIndex <= 1
                              ? "bg-gradient-to-t from-pink-400 to-pink-300"
                              : conditionIndex === 2
                              ? "bg-gradient-to-t from-yellow-400 to-yellow-300"
                              : "bg-gradient-to-t from-orange-400 to-orange-300"
                          }`}
                          title={`${log.date}: ${log.condition}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[9px] font-label text-gray-400">14 hari lalu</span>
                    <span className="text-[9px] font-label text-gray-400">Hari ini</span>
                  </div>
                </div>
              )}

              {/* Skin form */}
              <AnimatePresence>
                {showSkinForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-3xl p-4 shadow-card space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="text-xs font-label text-gray-500 mb-2 block">Kondisi kulit hari ini</label>
                      <div className="flex gap-2 justify-center">
                        {SKIN_CONDITIONS.map((c) => (
                          <motion.button
                            key={c.value}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSkinCondition(c.value)}
                            className={`flex flex-col items-center p-2.5 rounded-2xl transition-all ${
                              skinCondition === c.value
                                ? "bg-pink-50 border-2 border-pink-300 shadow-soft"
                                : "bg-gray-50 border-2 border-transparent"
                            }`}
                          >
                            <span className="text-xl">{c.emoji}</span>
                            <span className="text-[9px] font-label mt-1 text-gray-500">{c.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-label text-gray-500 mb-1 block">Catatan (opsional)</label>
                      <textarea
                        value={skinNote}
                        onChange={(e) => setSkinNote(e.target.value)}
                        placeholder="Ada yang beda hari ini? Produk baru? Breakout?"
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none resize-none"
                      />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={saveSkinLog}
                      className="w-full gradient-pink text-white py-2.5 rounded-2xl font-label text-sm shadow-soft"
                    >
                      Simpan Skin Log ✨
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Skin log entries */}
              {skinLogs.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">🪞</p>
                  <p className="text-sm text-gray-400 font-body">Belum ada log. Yuk mulai track kondisi kulitmu!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {skinLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="bg-white rounded-2xl p-3 shadow-card"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{getConditionEmoji(log.condition)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-label text-gray-400">
                              {new Date(log.date + "T00:00:00").toLocaleDateString("id-ID", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                            <span className="text-[10px] font-label px-2 py-0.5 rounded-full bg-pink-50 text-pink-400 capitalize">
                              {log.condition}
                            </span>
                          </div>
                          {log.note && (
                            <p className="text-sm font-body text-foreground mt-1 whitespace-pre-wrap">
                              {log.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── PRODUCT TRACKER ─── */}
          {activeSection === "products" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-label font-semibold text-gray-500">
                  Produk Aktif ({products.length})
                </h3>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProductForm(!showProductForm)}
                  className="gradient-pink text-white px-4 py-2 rounded-2xl text-sm font-label shadow-soft"
                >
                  {showProductForm ? "✕" : "+ Produk"}
                </motion.button>
              </div>

              {/* Product form */}
              <AnimatePresence>
                {showProductForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-3xl p-4 shadow-card space-y-3 overflow-hidden"
                  >
                    <div>
                      <label className="text-xs font-label text-gray-500 mb-1 block">Nama Produk</label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g. Skintific 5X Ceramide Moisturizer"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-label text-gray-500 mb-1 block">Kategori</label>
                        <select
                          value={productCategory}
                          onChange={(e) => setProductCategory(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none bg-white"
                        >
                          {PRODUCT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-label text-gray-500 mb-1 block">PAO (bulan)</label>
                        <input
                          type="number"
                          value={productExpiryMonths}
                          onChange={(e) => setProductExpiryMonths(parseInt(e.target.value) || 12)}
                          min={1}
                          max={36}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-label text-gray-500 mb-1 block">Tanggal Dibuka</label>
                      <input
                        type="date"
                        value={productOpenedDate}
                        onChange={(e) => setProductOpenedDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-label text-gray-500 mb-1 block">Catatan (opsional)</label>
                      <input
                        type="text"
                        value={productNotes}
                        onChange={(e) => setProductNotes(e.target.value)}
                        placeholder="e.g. Beli di Shopee, cocok banget!"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none"
                      />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={saveProduct}
                      className="w-full gradient-pink text-white py-2.5 rounded-2xl font-label text-sm shadow-soft"
                    >
                      Tambah Produk ✨
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Products list */}
              {products.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">🧪</p>
                  <p className="text-sm text-gray-400 font-body">Belum ada produk. Tambahin produk skincare kamu!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((product, index) => {
                    const expiry = getExpiryStatus(product);
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={`bg-white rounded-2xl p-3 shadow-card ${
                          expiry.urgent ? "border border-orange-200" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-body font-semibold text-foreground">{product.name}</p>
                              <span className={`text-[10px] font-label px-2 py-0.5 rounded-full ${expiry.color}`}>
                                {expiry.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-label px-2 py-0.5 rounded-full bg-purple-50 text-purple-400">
                                {product.category}
                              </span>
                              {product.notes && (
                                <span className="text-[10px] font-body text-gray-400 truncate">{product.notes}</span>
                              )}
                            </div>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => archiveProduct(product.id)}
                            className="text-gray-300 hover:text-red-400 transition-colors p-1"
                            title="Archive product"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Expiry alert */}
              {products.some((p) => getExpiryStatus(p).urgent) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center"
                >
                  <p className="text-sm font-body text-orange-600">
                    ⚠️ Ada produk yang segera expired — cek & restock ya!
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
