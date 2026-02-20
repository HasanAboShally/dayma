// ============================================================
// Ramadan Companion — Confetti Celebration Effect
// Lightweight canvas-free confetti using CSS animations
// ============================================================

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

const COLORS = [
  "#10b981", // emerald
  "#f59e0b", // amber
  "#fbbf24", // gold
  "#34d399", // light emerald
  "#a78bfa", // purple
  "#fb923c", // orange
];

const SHAPES = ["●", "■", "★", "◆", "▲"];

interface Particle {
  id: number;
  x: number;
  color: string;
  shape: string;
  size: number;
  delay: number;
  drift: number;
  rotate: number;
}

function generateParticles(count = 40): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    size: 6 + Math.random() * 10,
    delay: Math.random() * 0.5,
    drift: (Math.random() - 0.5) * 60,
    rotate: Math.random() * 720 - 360,
  }));
}

export function Confetti({ active, duration = 2500 }: ConfettiProps) {
  const [showing, setShowing] = useState(false);
  const [particles, setParticles] = useState(() => generateParticles());

  useEffect(() => {
    if (active) {
      setParticles(generateParticles());
      setShowing(true);
      const timer = setTimeout(() => setShowing(false), duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [active, duration]);

  return (
    <AnimatePresence>
      {showing && (
        <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                opacity: 1,
                x: `${p.x}vw`,
                y: -20,
                rotate: 0,
                scale: 1,
              }}
              animate={{
                opacity: [1, 1, 0],
                y: "110vh",
                x: `${p.x + p.drift}vw`,
                rotate: p.rotate,
                scale: [1, 1.2, 0.6],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2 + Math.random(),
                delay: p.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute"
              style={{
                color: p.color,
                fontSize: p.size,
                lineHeight: 1,
              }}
            >
              {p.shape}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
