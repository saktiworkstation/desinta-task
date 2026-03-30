"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TabNavigation from "@/components/TabNavigation";
import BlobBackground from "@/components/BlobBackground";
import TodayGlow from "@/components/TodayGlow";
import WeeklyGoals from "@/components/WeeklyGoals";
import ContentPlanner from "@/components/ContentPlanner";
import IncomeDeal from "@/components/IncomeDeal";
import SelfBodyCare from "@/components/SelfBodyCare";
import JournalMilestones from "@/components/JournalMilestones";

const tabs = [TodayGlow, WeeklyGoals, ContentPlanner, IncomeDeal, SelfBodyCare, JournalMilestones];

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleTabChange = (newTab: number) => {
    setDirection(newTab > activeTab ? 1 : -1);
    setActiveTab(newTab);
  };

  const ActiveComponent = tabs[activeTab];

  return (
    <main className="min-h-screen max-w-lg mx-auto relative">
      <BlobBackground />

      {/* Content area */}
      <div className="pt-6 pb-24">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </main>
  );
}
