import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BreathAnimation, breathPhaseGradients } from "../components/BreathAnimation";
import { TimerDisplay } from "../components/TimerDisplay";
import { TimerControls } from "../components/TimerControls";
import {
  VibrationSettingsSheet,
  VibrationSettings,
  loadVibrationSettings,
} from "../components/VibrationSettingsSheet";
import { SessionPresetPicker } from "../components/SessionPresetPicker";
import {
  sessionPresets,
  defaultSessionPreset,
  BreathSessionPreset,
} from "../data/sessionPresets";
import { useBreathTimer } from "../hooks/useBreathTimer";
import { hapticFeedback } from "../utils/mobileFeatures";

export const TimerPage = () => {
  const [activePreset, setActivePreset] = useState<BreathSessionPreset>(
    defaultSessionPreset
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [vibrationSettings, setVibrationSettings] = useState<VibrationSettings>(
    () => loadVibrationSettings()
  );

  const timer = useBreathTimer(activePreset, vibrationSettings);

  const handlePresetSelect = useCallback((presetId: string) => {
    const nextPreset = sessionPresets.find((preset) => preset.id === presetId);
    if (nextPreset) {
      hapticFeedback("light");
      setActivePreset(nextPreset);
    }
  }, []);

  const totalSecondsInitial = useMemo(
    () =>
      (activePreset.inhale + activePreset.hold + activePreset.exhale) *
      activePreset.cycles,
    [activePreset]
  );

  const showSettings = useCallback(() => {
    hapticFeedback("light");
    setIsSettingsOpen(true);
  }, []);

  return (
    <div
      className="relative flex h-full w-full flex-col items-center overflow-hidden"
      style={breathPhaseGradients}
    >
      <motion.div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-[#f6f8f6] via-[#f0f8f7] to-[#ecf5f3]"
        animate={{ opacity: timer.isRunning ? 1 : 0.95 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <header className="w-full max-w-mobile px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <motion.p
              className="text-[10px] uppercase tracking-[0.36em] text-emerald-900/60"
              animate={{ opacity: timer.isRunning ? 1 : 0.8 }}
            >
              Gentle Breaths
            </motion.p>
            <h1 className="mt-2 text-2xl font-semibold text-emerald-950">
              Calm Timer
            </h1>
          </div>
          <button
            className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur-sm active:scale-[0.97]"
            onClick={showSettings}
          >
            Vibration
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto px-5 pb-6">
        <SessionPresetPicker
          presets={sessionPresets}
          activePresetId={activePreset.id}
          onSelect={handlePresetSelect}
        />

        <TimerDisplay
          currentCycle={timer.currentCycle}
          totalCycles={activePreset.cycles}
          totalSecondsRemaining={timer.totalSecondsRemaining || totalSecondsInitial}
          isRunning={timer.isRunning}
        />

        <BreathAnimation
          phase={timer.phase}
          secondsRemaining={timer.secondsRemaining}
          phaseDuration={timer.phaseDuration}
        />

        <div className="mt-auto w-full pb-5">
          <TimerControls
            isRunning={timer.isRunning}
            onStart={timer.startTimer}
            onPause={timer.pauseTimer}
            onReset={timer.resetTimer}
            disableReset={
              !timer.isRunning &&
              timer.totalSecondsRemaining === totalSecondsInitial
            }
          />
        </div>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <VibrationSettingsSheet
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onChange={setVibrationSettings}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
