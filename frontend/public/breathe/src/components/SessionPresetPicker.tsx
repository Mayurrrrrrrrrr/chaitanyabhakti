import { useMemo } from "react";
import clsx from "clsx";
import type { BreathSessionPreset } from "@/data/sessionPresets";

interface SessionPresetPickerProps {
  presets: BreathSessionPreset[];
  activePresetId: string;
  onSelect: (presetId: string) => void;
}

export const SessionPresetPicker = ({
  presets,
  activePresetId,
  onSelect,
}: SessionPresetPickerProps) => {
  const activePreset = useMemo(
    () => presets.find((preset) => preset.id === activePresetId),
    [presets, activePresetId]
  );

  return (
    <div className="w-full max-w-mobile mx-auto">
      <div className="rounded-3xl border border-white/50 bg-white/70 px-4 py-5 backdrop-blur-sm shadow-lg shadow-emerald-900/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-900/70">
              Session
            </p>
            <h2 className="text-xl font-medium text-emerald-950">
              {activePreset?.name}
            </h2>
            <p className="mt-1 text-sm text-emerald-900/70">
              {activePreset?.description}
            </p>
          </div>
          <div className="text-right text-sm font-medium text-emerald-900/70">
            <p>
              Inhale <span className="text-emerald-900">{activePreset?.inhale}s</span>
            </p>
            <p>
              Hold <span className="text-emerald-900">{activePreset?.hold}s</span>
            </p>
            <p>
              Exhale <span className="text-emerald-900">{activePreset?.exhale}s</span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {presets.map((preset) => {
            const isActive = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.97]",
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                    : "bg-emerald-50 text-emerald-700"
                )}
                onClick={() => onSelect(preset.id)}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
