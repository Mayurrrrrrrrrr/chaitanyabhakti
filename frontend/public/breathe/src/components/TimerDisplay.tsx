import { motion } from "framer-motion";

interface TimerDisplayProps {
  currentCycle: number;
  totalCycles: number;
  totalSecondsRemaining: number;
  isRunning: boolean;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const TimerDisplay = ({
  currentCycle,
  totalCycles,
  totalSecondsRemaining,
  isRunning,
}: TimerDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <motion.div
        className="rounded-full border border-white/70 bg-white/60 px-5 py-1 backdrop-blur-sm"
        animate={{ opacity: isRunning ? 1 : 0.75 }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-emerald-900/70">
          Cycle {currentCycle} / {totalCycles}
        </p>
      </motion.div>
      <motion.div
        key={totalSecondsRemaining}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="text-[56px] font-light leading-none text-emerald-950 mobile-lg:text-[64px]"
      >
        {formatTime(totalSecondsRemaining)}
      </motion.div>
    </div>
  );
};
