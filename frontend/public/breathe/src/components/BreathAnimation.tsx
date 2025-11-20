import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BreathPhaseKey } from "@/data/sessionPresets";

const PHASE_COLORS: Record<BreathPhaseKey, string> = {
  inhale: "from-emerald-400 to-emerald-500",
  hold: "from-teal-300 to-teal-400",
  exhale: "from-cyan-300 to-cyan-400",
};

const PHASE_COPY: Record<BreathPhaseKey, string> = {
  inhale: "Breathe in",
  hold: "Hold gently",
  exhale: "Release slowly",
};

export interface BreathAnimationProps {
  phase: BreathPhaseKey;
  secondsRemaining: number;
  phaseDuration: number;
}

export const BreathAnimation = ({
  phase,
  secondsRemaining,
  phaseDuration,
}: BreathAnimationProps) => {
  const progress = useMemo(() => {
    if (phaseDuration === 0) return 0;
    return (phaseDuration - secondsRemaining) / phaseDuration;
  }, [phaseDuration, secondsRemaining]);

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={phase}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.35, ease: [0.22, 0.68, 0, 1] }}
          className="text-center"
        >
          <p className="text-sm tracking-wide uppercase text-teal-700/80">
            {PHASE_COPY[phase]}
          </p>
          <p className="text-3xl font-light text-emerald-950 mt-2">
            {secondsRemaining}s
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="relative w-60 h-60 mobile-lg:w-64 mobile-lg:h-64">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-200 to-slate-100" />
        <motion.div
          key={`${phase}-${secondsRemaining}`}
          initial={{ scale: 0.75, opacity: 0.6 }}
          animate={{
            scale: phase === "inhale" ? 1 : phase === "hold" ? 0.9 : 0.75,
            opacity: 1,
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-6 rounded-full bg-gradient-to-br shadow-xl shadow-emerald-900/10 border border-white/40"
          style={{
            backgroundClip: "padding-box",
          }}
        />
        <motion.div
          className="absolute inset-6 rounded-full overflow-hidden"
          initial={false}
          animate={{
            background: `linear-gradient(135deg, rgba(134, 239, 172, ${0.3 + progress * 0.5}), rgba(45, 212, 191, ${0.2 + progress * 0.4}))`,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            data-phase={phase}
            style={{
              backgroundImage: `var(--phase-gradient-${phase})`,
            }}
          />
          <div className="absolute inset-[18%] rounded-full bg-white/60 backdrop-blur-sm" />
        </motion.div>
        <div className="absolute inset-[42%] rounded-full bg-white" />
      </div>
    </div>
  );
};

export const breathPhaseGradients = {
  "--phase-gradient-inhale": "linear-gradient(135deg, rgba(134,239,172,0.85), rgba(52,211,153,0.9))",
  "--phase-gradient-hold": "linear-gradient(135deg, rgba(94,234,212,0.85), rgba(45,212,191,0.9))",
  "--phase-gradient-exhale": "linear-gradient(135deg, rgba(103,232,249,0.82), rgba(14,165,233,0.88))",
};
