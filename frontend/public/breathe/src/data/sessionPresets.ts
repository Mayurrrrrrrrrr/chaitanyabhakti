export type BreathPhaseKey = "inhale" | "hold" | "exhale";

export interface BreathSessionPreset {
  id: string;
  name: string;
  inhale: number; // seconds
  hold: number; // seconds
  exhale: number; // seconds
  cycles: number;
  description: string;
}

export const sessionPresets: BreathSessionPreset[] = [
  {
    id: "gentle-4-4-4",
    name: "Gentle Equal",
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 6,
    description: "Even 4-second rhythm to settle into mindful breathing.",
  },
  {
    id: "focus-4-2-6",
    name: "Focus Flow",
    inhale: 4,
    hold: 2,
    exhale: 6,
    cycles: 8,
    description: "Elongated exhale to activate parasympathetic calm.",
  },
  {
    id: "deep-5-5-7",
    name: "Deep Restore",
    inhale: 5,
    hold: 5,
    exhale: 7,
    cycles: 5,
    description: "Slower cadence to soften the nervous system.",
  },
  {
    id: "box-4",
    name: "Box Breathe",
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 4,
    description: "Classic box method for quick resets.",
  },
];

export const defaultSessionPreset = sessionPresets[0];
