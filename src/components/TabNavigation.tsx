"use client";

import { motion } from "framer-motion";

const tabs = [
  { id: 0, icon: "🏠", label: "Today" },
  { id: 1, icon: "📅", label: "Weekly" },
  { id: 2, icon: "🎬", label: "Content" },
  { id: 3, icon: "💰", label: "Income" },
  { id: 4, icon: "🧖‍♀️", label: "Body Care" },
  { id: 5, icon: "📓", label: "Journal" },
];

interface TabNavigationProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-pink-100">
      <div className="max-w-lg mx-auto flex justify-around items-center py-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center py-2 px-2 min-w-0 flex-1"
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(236,72,153,0.12) 0%, transparent 70%)",
                }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              />
            )}
            <span className="text-lg relative z-10">{tab.icon}</span>
            <span
              className={`text-[9px] font-label relative z-10 mt-0.5 transition-colors ${
                activeTab === tab.id ? "text-pink-500 font-semibold" : "text-gray-400"
              }`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
      {/* Safe area for mobile */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
