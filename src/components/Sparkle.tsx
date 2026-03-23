"use client";

import { motion, AnimatePresence } from "framer-motion";

interface SparkleProps {
  show: boolean;
}

export default function Sparkle({ show }: SparkleProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-yellow-300 pointer-events-none select-none"
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                x: [0, (i - 1) * 20],
                y: [0, -15 - i * 8],
              }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{ fontSize: "12px" }}
            >
              ✦
            </motion.span>
          ))}
        </>
      )}
    </AnimatePresence>
  );
}
