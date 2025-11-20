import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BreathPhaseKey, BreathSessionPreset } from "../data/sessionPresets";
import { vibrate, hapticFeedback } from "../utils/mobileFeatures";
import type { VibrationSettings } from "../components/VibrationSettingsSheet";

export interface BreathTimerState {
  phase: BreathPhaseKey;
  secondsRemaining: number;
  phaseDuration: number;
  totalSecondsRemaining: number;
  currentCycle: number;
  isRunning: boolean;
}

const PHASE_ORDER: BreathPhaseKey[] = ["inhale", "hold", "exhale"];

const calculatePhaseDuration = (
  preset: BreathSessionPreset,
  phase: BreathPhaseKey
) => {
  switch (phase) {
    case "inhale":
      return preset.inhale;
    case "hold":
      return preset.hold;
    case "exhale":
      return preset.exhale;
  }
};

const totalDuration = (preset: BreathSessionPreset) =>
  (preset.inhale + preset.hold + preset.exhale) * preset.cycles;

export const useBreathTimer = (
  preset: BreathSessionPreset,
  vibrationSettings: VibrationSettings
) => {
  const intervalRef = useRef<number | null>(null);
  const lastIntervalVibrationAt = useRef<number>(0);

  const [state, setState] = useState<BreathTimerState>(() => ({
    phase: "inhale",
    secondsRemaining: preset.inhale,
    phaseDuration: preset.inhale,
    totalSecondsRemaining: totalDuration(preset),
    currentCycle: 1,
    isRunning: false,
  }));

  const resetTimer = useCallback(() => {
    setState({
      phase: "inhale",
      secondsRemaining: preset.inhale,
      phaseDuration: preset.inhale,
      totalSecondsRemaining: totalDuration(preset),
      currentCycle: 1,
      isRunning: false,
    });
    lastIntervalVibrationAt.current = 0;
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [preset]);

  const triggerPhaseFeedback = useCallback(
    (phase: BreathPhaseKey) => {
      const feedbackType =
        phase === "inhale" ? "light" : phase === "hold" ? "medium" : "heavy";
      hapticFeedback(feedbackType);
      vibrate(phase === "exhale" ? [120, 50, 100] : [80, 40, 80]);
    },
    []
  );

  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    setState((prev) => ({ ...prev, isRunning: true }));
    triggerPhaseFeedback(state.phase);

    intervalRef.current = window.setInterval(() => {
      setState((prev) => {
        const nextSeconds = prev.secondsRemaining - 1;
        const totalSeconds = prev.totalSecondsRemaining - 1;

        const shouldTriggerIntervalVibration =
          vibrationSettings.enabled &&
          totalSeconds >= 0 &&
          vibrationSettings.intervalSeconds > 0 &&
          (totalDuration(preset) - totalSeconds) - lastIntervalVibrationAt.current >=
            vibrationSettings.intervalSeconds; // seconds elapsed since last interval

        if (shouldTriggerIntervalVibration) {
          vibrate(vibrationSettings.pattern);
          lastIntervalVibrationAt.current = totalDuration(preset) - totalSeconds;
        }

        if (nextSeconds > 0) {
          return {
            ...prev,
            secondsRemaining: nextSeconds,
            totalSecondsRemaining: totalSeconds,
          };
        }

        const currentPhaseIndex = PHASE_ORDER.indexOf(prev.phase);
        const isLastPhase = currentPhaseIndex === PHASE_ORDER.length - 1;

        if (isLastPhase) {
          const nextCycle = prev.currentCycle + 1;
          if (nextCycle > preset.cycles || totalSeconds <= 0) {
            window.clearInterval(intervalRef.current!);
            hapticFeedback("heavy");
            vibrate([120, 80, 120, 80, 150]);
            return {
              ...prev,
              secondsRemaining: 0,
              phaseDuration: prev.phaseDuration,
              totalSecondsRemaining: 0,
              isRunning: false,
            };
          }

          const nextPhase: BreathPhaseKey = "inhale";
          const nextDuration = calculatePhaseDuration(preset, nextPhase);
          triggerPhaseFeedback(nextPhase);
          return {
            ...prev,
            phase: nextPhase,
            secondsRemaining: nextDuration,
            phaseDuration: nextDuration,
            totalSecondsRemaining: totalSeconds,
            currentCycle: nextCycle,
          };
        }

        const nextPhase = PHASE_ORDER[currentPhaseIndex + 1];
        const nextDuration = calculatePhaseDuration(preset, nextPhase);
        triggerPhaseFeedback(nextPhase);

        return {
          ...prev,
          phase: nextPhase,
          secondsRemaining: nextDuration,
          phaseDuration: nextDuration,
          totalSecondsRemaining: totalSeconds,
        };
      });
    }, 1000);
  }, [preset, triggerPhaseFeedback, vibrationSettings, state.phase]);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    resetTimer();
  }, [preset, resetTimer]);

  return useMemo(
    () => ({
      ...state,
      startTimer,
      pauseTimer,
      resetTimer,
    }),
    [state, startTimer, pauseTimer, resetTimer]
  );
};
