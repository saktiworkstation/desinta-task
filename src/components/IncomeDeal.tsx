"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, USER_ID } from "@/lib/supabase";
import { INCOME_SOURCES, IncomeEntry, formatRupiah, getTodayString } from "@/lib/constants";
import LoadingSkeleton from "./LoadingSkeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MONTHLY_TARGET = 3000000;

export default function IncomeDeal() {
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [allIncomes, setAllIncomes] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState(getTodayString());
  const [formSource, setFormSource] = useState(INCOME_SOURCES[0]);
  const [formAmount, setFormAmount] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

      const [monthRes, allRes] = await Promise.all([
        supabase
          .from("income_log")
          .select("*")
          .eq("user_id", USER_ID)
          .gte("date", monthStart)
          .order("date", { ascending: false }),
        supabase
          .from("income_log")
          .select("*")
          .eq("user_id", USER_ID)
          .order("date", { ascending: false }),
      ]);

      if (monthRes.data) setIncomes(monthRes.data);
      if (allRes.data) setAllIncomes(allRes.data);
    } catch (err) {
      console.error("Error fetching incomes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addIncome = async () => {
    if (!formAmount || parseInt(formAmount) <= 0) return;

    try {
      const { data } = await supabase
        .from("income_log")
        .insert({
          user_id: USER_ID,
          date: formDate,
          source: formSource,
          amount: parseInt(formAmount),
          description: formDesc,
        })
        .select()
        .single();

      if (data) {
        setIncomes((prev) => [data, ...prev]);
        setAllIncomes((prev) => [data, ...prev]);

        // Update stats
        const { data: stats } = await supabase
          .from("stats")
          .select("total_earnings, total_brand_deals")
          .eq("user_id", USER_ID)
          .single();

        if (stats) {
          await supabase
            .from("stats")
            .update({
              total_earnings: stats.total_earnings + parseInt(formAmount),
              total_brand_deals: stats.total_brand_deals + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", USER_ID);
        }
      }

      setShowForm(false);
      setFormAmount("");
      setFormDesc("");
    } catch (err) {
      console.error("Error adding income:", err);
    }
  };

  const monthlyTotal = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalAll = allIncomes.reduce((sum, i) => sum + i.amount, 0);
  const avgPerDeal = allIncomes.length > 0 ? Math.round(totalAll / allIncomes.length) : 0;
  const monthlyProgress = Math.min((monthlyTotal / MONTHLY_TARGET) * 100, 100);

  // Chart data: last 6 months
  const getChartData = () => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("id-ID", { month: "short" });
      months[key] = 0;
      // We'll use label later
      void label;
    }

    allIncomes.forEach((inc) => {
      const key = inc.date.substring(0, 7);
      if (key in months) {
        months[key] += inc.amount;
      }
    });

    return Object.entries(months).map(([key, total]) => {
      const [y, m] = key.split("-");
      const d = new Date(parseInt(y), parseInt(m) - 1);
      return {
        name: d.toLocaleDateString("id-ID", { month: "short" }),
        total,
      };
    });
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="px-4 pb-4 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-heading font-bold gradient-text">Income & Deals 💰</h1>
          <p className="text-sm text-gray-500 font-body mt-0.5">Track penghasilan kontenmu</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="gradient-pink text-white px-4 py-2 rounded-2xl text-sm font-label shadow-soft"
        >
          {showForm ? "✕" : "+ Tambah"}
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
            <div>
              <label className="text-xs font-label text-gray-500 mb-1 block">Sumber</label>
              <select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none"
              >
                {INCOME_SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-label text-gray-500 mb-1 block">Jumlah (Rp)</label>
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="500000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-label text-gray-500 mb-1 block">Deskripsi</label>
              <input
                type="text"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Endorse produk skincare..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-body focus:border-pink-300 focus:outline-none"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={addIncome}
              className="w-full gradient-pink text-white py-2.5 rounded-2xl font-label text-sm shadow-soft"
            >
              Simpan Income 💰
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3 shadow-card text-center">
          <p className="text-xs font-label text-gray-400 mb-1">Bulan ini</p>
          <p className="text-sm font-heading font-bold text-pink-500">{formatRupiah(monthlyTotal)}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-card text-center">
          <p className="text-xs font-label text-gray-400 mb-1">Total</p>
          <p className="text-sm font-heading font-bold text-pink-500">{formatRupiah(totalAll)}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-card text-center">
          <p className="text-xs font-label text-gray-400 mb-1">Avg/Deal</p>
          <p className="text-sm font-heading font-bold text-pink-500">{formatRupiah(avgPerDeal)}</p>
        </div>
      </div>

      {/* Monthly target */}
      <div className="bg-white rounded-3xl p-4 shadow-card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-label text-gray-500">Target Bulan Ini</span>
          <span className="text-sm font-heading font-bold text-pink-500">
            {formatRupiah(monthlyTotal)} / {formatRupiah(MONTHLY_TARGET)}
          </span>
        </div>
        <div className="h-3 bg-pink-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-pink"
            initial={{ width: 0 }}
            animate={{ width: `${monthlyProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-gray-400 font-body mt-1 text-right">
          {Math.round(monthlyProgress)}% tercapai
        </p>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-3xl p-4 shadow-card">
        <h3 className="text-sm font-label font-semibold text-gray-500 mb-3">Income 6 Bulan Terakhir</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
              />
              <Tooltip
                formatter={(value) => [formatRupiah(Number(value)), "Income"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #fce7f3",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="total" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#f9a8d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income list this month */}
      <div>
        <h3 className="text-sm font-label font-semibold text-gray-500 mb-3">Transaksi Bulan Ini</h3>
        {incomes.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">💸</p>
            <p className="text-sm text-gray-400 font-body">Belum ada income bulan ini</p>
          </div>
        ) : (
          <div className="space-y-2">
            {incomes.map((inc, index) => (
              <motion.div
                key={inc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white rounded-2xl p-3 shadow-card flex justify-between items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-body font-semibold text-foreground truncate">
                    {inc.description || inc.source}
                  </p>
                  <p className="text-xs text-gray-400 font-label">
                    {inc.source} • {inc.date}
                  </p>
                </div>
                <p className="text-sm font-heading font-bold text-green-500 ml-3 flex-shrink-0">
                  +{formatRupiah(inc.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
