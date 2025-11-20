## Overview
- Add a new Breath Exercise feature using the existing files from `D:\breathe`.
- Keep your site’s CSS untouched by embedding the exercise as-is.
- Make it accessible from the Dashboard and the app navigation.

## Integration Strategy
- Use an iframe-based embed to avoid CSS conflicts and keep the breath module visually intact.
- Place the breath files in `frontend/public/breathe/` so they are served statically by the frontend app.
- Add a dedicated route `/breathe` that shows a full-height page with the embedded exercise.
- Add a Dashboard quick-action tile linking to `/breathe`.

## Frontend Changes
- Create `frontend/src/components/Breathe.jsx`:
  - Fullscreen card with a responsive iframe pointing to `/breathe/index.html`.
  - Optional instructions banner at the top (no CSS edits to app-wide styles).
- Update `frontend/src/App.js`:
  - Add route: `<Route path="breathe" element={<Breathe />} />` under protected routes.
- Update `frontend/src/components/Dashboard.jsx`:
  - Add a new Quick Action card (e.g., 📿 → Breathing) linking to `/breathe`.
- Update `frontend/src/components/layout/Sidebar.jsx` (optional):
  - Add a navigation item “Breathe” that routes to `/breathe` if desired.

## Static Assets Import
- Copy the entire contents of `D:\breathe` into `frontend/public/breathe/`.
- Keep original folder structure and asset references so the exercise works without changes.
- If any assets use absolute file paths, convert them to relative paths within `/breathe/`.

## Optional Enhancements (Non-breaking)
- Add translations keys for the menu label (e.g., "breathe": "Breath Exercise") to match app language.
- Provide a top bar with a "Start/Pause" control that forwards events to the iframe (only if the existing module supports it).
- Persist preferred duration/frequency in `localStorage` per user to avoid backend changes.

## Verification
- Open `/breathe` and confirm the exercise loads and runs correctly.
- Check Dashboard quick action navigates to `/breathe`.
- Confirm mobile usability: full-height iframe, no overflow, and no CSS shifts elsewhere.
- Ensure language selection and authentication do not interfere with the static embed.

## Safety & Scope
- No changes to existing CSS.
- No backend changes required; served entirely from frontend static assets.
- If the breath module requires backend endpoints, we will proxy via the existing frontend API base or add a small static file route later without touching current APIs.
