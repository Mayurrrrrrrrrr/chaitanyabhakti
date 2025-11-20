import { useEffect, useState } from "react";
import { hapticFeedback, vibrate } from "../utils/mobileFeatures";

export interface VibrationSettings {
  intervalSeconds: number;
  pattern: number | number[];
  enabled: boolean;
}

const STORAGE_KEY = "meditation_vibration_settings";

const defaultSettings: VibrationSettings = {
  intervalSeconds: 60,
  pattern: [100, 50, 200],
  enabled: true,
};

const PRESETS: Array<{ label: string; pattern: number | number[] }> = [
  { label: "Soft pulse", pattern: 120 },
  { label: "Gentle wave", pattern: [70, 50, 140] },
  { label: "Double tap", pattern: [90, 40, 90] },
];

interface VibrationSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onChange: (settings: VibrationSettings) => void;
}

export const VibrationSettingsSheet = ({
  isOpen,
  onClose,
  onChange,
}: VibrationSettingsSheetProps) => {
  const [settings, setSettings] = useState<VibrationSettings>(defaultSettings);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch (error) {
        console.warn("Failed to parse vibration settings", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!settings) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    onChange(settings);
  }, [settings, onChange]);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto w-full max-w-mobile rounded-t-3xl bg-white shadow-[0_-10px_40px_rgba(15,118,110,0.12)] px-5 pt-5 pb-8">
        <div className="mx-auto mb-6 flex w-12 justify-center">
          <span className="h-1.5 w-12 rounded-full bg-teal-200" />
        </div>
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-emerald-950">Vibration</h2>
            <p className="text-sm text-emerald-900/70">
              Interval haptics guide your breathing rhythm.
            </p>
          </div>
          <button
            className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-emerald-700 active:bg-teal-100"
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
          >
            Done
          </button>
        </header>

        <div className="mt-6 space-y-6">
          <section>
            <label className="flex items-center justify-between text-sm text-emerald-900/80">
              <span>Enable interval vibrations</span>
              <input
                type="checkbox"
                className="h-6 w-10 cursor-pointer appearance-none rounded-full bg-emerald-100 transition-all duration-200 checked:bg-emerald-500"
                checked={settings.enabled}
                onChange={(event) => {
                  const next = event.target.checked;
                  hapticFeedback(next ? "medium" : "light");
                  setSettings((prev) => ({ ...prev, enabled: next }));
                }}
              />
            </label>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between text-sm text-emerald-900/80">
              <span>Interval (seconds)</span>
              <span className="text-base font-semibold text-emerald-950">
                {settings.intervalSeconds}s
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={180}
              step={10}
              value={settings.intervalSeconds}
              onChange={(event) => {
                const value = Number(event.target.value);
                vibrate(40);
                setSettings((prev) => ({ ...prev, intervalSeconds: value }));
              }}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-emerald-100 accent-emerald-500"
            />
          </section>

          <section className="space-y-3">
            <p className="text-sm font-medium text-emerald-900/80">Pattern</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
              {PRESETS.map(({ label, pattern }) => {
                const active = JSON.stringify(pattern) === JSON.stringify(settings.pattern);
                return (
                  <button
                    key={label}
                    className={`rounded-2xl border px-4 py-4 text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                      active
                        ? "border-emerald-400 bg-emerald-50 text-emerald-900 shadow-md"
                        : "border-emerald-100 bg-white text-emerald-700"
                    }`}
                    onClick={() => {
                      vibrate(pattern);
                      hapticFeedback("medium");
                      setSettings((prev) => ({ ...prev, pattern }));
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="text-xs text-emerald-900/60">
              Interval vibrations play alongside visuals so you can close your eyes
              and stay in rhythm. These preferences stay on device.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const loadVibrationSettings = (): VibrationSettings => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (error) {
      console.warn("Failed to parse vibration settings", error);
    }
  }
  return defaultSettings;
};
