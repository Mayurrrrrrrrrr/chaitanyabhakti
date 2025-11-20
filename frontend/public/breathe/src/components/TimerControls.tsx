import { hapticFeedback, vibrate } from "../utils/mobileFeatures";
import clsx from "clsx";
import { ReactNode } from "react";

interface TimerButtonProps {
  label: string;
  onPress: () => void;
  tone?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
  disabled?: boolean;
}

const BUTTON_STYLES: Record<NonNullable<TimerButtonProps["tone"]>, string> = {
  primary:
    "bg-emerald-600 text-white shadow-lg shadow-emerald-900/25 active:bg-emerald-700",
  secondary:
    "bg-white text-emerald-900 border border-emerald-200 active:bg-emerald-50",
  ghost: "bg-transparent text-emerald-700",
};

export const TimerButton = ({
  label,
  onPress,
  tone = "primary",
  icon,
  disabled,
}: TimerButtonProps) => {
  return (
    <button
      className={clsx(
        "flex-1 min-h-touch rounded-2xl px-5 py-3 font-medium text-base tracking-tight flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97]",
        disabled ? "opacity-40 pointer-events-none" : BUTTON_STYLES[tone]
      )}
      onClick={() => {
        hapticFeedback("medium");
        vibrate(50);
        onPress();
      }}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {label}
    </button>
  );
};

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  disableReset?: boolean;
}

export const TimerControls = ({
  isRunning,
  onStart,
  onPause,
  onReset,
  disableReset,
}: TimerControlsProps) => {
  return (
    <div className="w-full max-w-mobile mx-auto flex flex-col items-center gap-3">
      <div className="w-full flex gap-3">
        {isRunning ? (
          <TimerButton label="Pause" onPress={onPause} tone="secondary" />
        ) : (
          <TimerButton label="Start" onPress={onStart} tone="primary" />
        )}
        <TimerButton
          label="Reset"
          onPress={onReset}
          tone="ghost"
          disabled={disableReset}
        />
      </div>
    </div>
  );
};
