# Gentle Breaths Mobile App Guide

This document captures the current state and operating instructions for the Gentle Breaths meditation timer project. Keep it updated as features evolve.

## Project Overview

- **App Purpose**: Calm, minimalist mobile meditation timer guiding mindful breathing with haptic intervals
- **Technology Stack**: React 18 + TypeScript + Vite 7 + Tailwind CSS 3 (mobile-first configuration)
- **Entry Points**: `src/main.tsx` (bootstraps React), `src/App.tsx` (root layout with safe-area container)
- **Design Pillars**: Touch-first interactions (≥44px targets), soft gradients, focus on legibility, mindful motion

## Core Features Implemented

1. **Breathing Timer Experience**
   - Session presets stored in `src/data/sessionPresets.ts` (equal, extended exhale, deep restore, box)
   - `useBreathTimer` hook orchestrates inhale/hold/exhale phases, cycle counts, total countdown, and haptic cues
   - `TimerDisplay`, `BreathAnimation`, and `TimerControls` render the core flow with subtle motion via Framer Motion

2. **Vibration & Haptics Settings**
   - `VibrationSettingsSheet` bottom sheet lets users toggle interval alerts, adjust cadence, and select feel presets
   - Preferences persist in localStorage (`meditation_vibration_settings`) and sync live with the timer
   - Haptic feedback and vibrations are routed through `mobileFeatures.ts` to remain WebView-safe

3. **Mobile-First Layout & Styling**
   - Safe-area aware container with gradient background and scrollable content region for smaller screens
   - Tailwind utility styling referencing semantic color decisions (emerald/teal spectrum) for calm mood
   - Animation tokens control entry/scale transitions; breathing orb adapts visual feedback per phase

## Architecture Notes

- **Alias & Paths**: Vite config defines `@` → `src`. Paths are referenced accordingly throughout components and hooks.
- **Component Structure**:
  - `src/pages/TimerPage.tsx`: Assembles header, preset picker, timer surfaces, and vibration sheet
  - `src/components/*`: Reusable UI pieces (animation, controls, timers, sheet)
  - `src/hooks/useBreathTimer.ts`: Stateful timer logic + vibration cadence handling
  - `src/utils/mobileFeatures.ts`: Mandatory abstraction for haptics/vibration; never call `navigator.vibrate` directly
- **State Persistence**: Only vibration settings persist (localStorage). Session presets currently static; future extensions can add editing.

## Commands

- Install deps: `npm install`
- Run dev server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## Mobile Requirements & Best Practices

- Always wrap screens with safe-area padding using `env(safe-area-inset-*)`
- All interactive controls must go through `hapticFeedback`/`vibrate` helpers for consistent device behavior
- Maintain ≥44px touch targets and avoid hover-dependent interactions
- Keep gradients and shadows subtle to preserve the calm visual tone
- Validate builds after significant changes (`npm run build`) to catch alias or type issues early

## Future Enhancements

- Session preset editor with persistence (extend the presets data module + storage)
- Ambient sound toggles with reduced motion accessibility and alternate color themes
- Optional backend sync via Youware Backend when cross-device data is required

Keep this document aligned with actual implementation status so future contributors can onboard quickly.
