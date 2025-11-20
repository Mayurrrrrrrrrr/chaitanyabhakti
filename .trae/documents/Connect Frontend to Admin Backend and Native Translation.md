## Overview
- Replace placeholder pages with live data from backend so admin updates reflect on the frontend.
- Keep existing CSS untouched; only wire data and improve flows.
- Implement language-aware delivery for dynamic content using the app’s language setting and existing multilingual DB fields.
- Ensure user management is simpler for admins and consistent for users.

## Backend Adjustments
- Add event update endpoint: add `PUT /api/events/:event_id` to `backend/routes/events.js` to match calendar usage (`frontend/src/components/Calendar.jsx:118-124`).
- Normalize medicines endpoints or align frontend:
  - Option A: add `GET /api/medicines/logs/today` and `POST /api/medicines/logs/:id/update` to `backend/routes/medicines.js` to match `frontend/src/components/Medicines.jsx:25,37`.
  - Option B (preferred for minimal backend changes): update frontend to use existing `GET /api/medicines/logs?date=YYYY-MM-DD` and `POST /api/medicines/logs` with `{ medicine_id, status, scheduled_time }` (see `backend/routes/medicines.js:106-141`).
- Language-aware responses:
  - Read `Accept-Language` (e.g. `hi`, `en`) and return appropriate fields with fallback.
  - Update queries in:
    - Scriptures: select `title`/`description` and fall back to `title_en` when needed (`backend/routes/scriptures.js:11-22`).
    - Media: pick `title` vs `title_en` (`backend/routes/media.js:71-111`).
  - No schema change needed initially if we use existing `*_en` columns and default language columns.

## Frontend Wiring
- Scripture Library (`frontend/src/components/ScriptureLibrary.jsx:13-54`):
  - Replace static `SAMPLE_BOOKS` with fetch from `/api/scriptures` (already public).
  - Render `cover_url`, open `content_url` (PDF) in a new tab, play `audio_url` inline.
  - Keep TTS for text only when `description` is present.
- Satsang (`frontend/src/components/Satsang.jsx:12-25`):
  - Fetch videos from `/api/media/videos` and audios from `/api/media/audio`.
  - Use `youtube_id` for embeds and `file_url` for audio player; support family filter via `?family_id=<id>` if on a family page.
- Calendar (`frontend/src/components/Calendar.jsx:49-77`):
  - Continue merging static defaults with `/api/events`.
  - On save, call `PUT /api/events/:event_id` (after backend update) or create new via `POST /api/events`.
- Dashboard (`frontend/src/components/Dashboard.jsx:15-30, 79-151`):
  - Replace static “Temple Updates/Blogs” with a list from `/api/community/satsang` for global posts (already available; `backend/routes/community.js:29-47`).
  - Keep festivals using existing merge logic.
- Medicines (`frontend/src/components/Medicines.jsx:25,37`):
  - Align API calls with backend (Option B above): use `GET /medicines/logs?date=<today ISO>` and `POST /medicines/logs` to update status.
- Family Detail (`frontend/src/components/FamilyDetail.jsx` currently shows Japa code):
  - Replace with real family detail view: fetch `/api/families/:family_id` and posts from `/api/community/family/:family_id` (see `backend/routes/families.js:31-47` and `backend/routes/community.js:9-27`).
  - Include `CommunityPost` and `CommunityPostForm` for reading/creating posts.
- Admin: Temple Updates Management (`frontend/src/components/admin/TempleUpdatesManagement.jsx:14-41`):
  - Post global text updates via `/api/community` with `family_id` omitted and `post_type='text'`; list them via `/api/community/satsang`.
- Language header:
  - Add `Accept-Language` to Axios in `frontend/src/services/api.js:14-26` based on `LanguageContext` so backend can return localized fields.

## User Management Improvements
- Admin Users (`frontend/src/components/admin/UserManagement.jsx:82-169` and `backend/routes/admin.js:18-87`):
  - Add search/filter and inline activate/deactivate toggle for faster updates.
  - Add “reset password” (sets hashed password) via `PUT /api/admin/users/:id/password` in `backend/routes/admin.js`.
  - Show `is_active` and `is_super_admin` clearly (already returned from backend).

## Translation Strategy
- UI text: continue using `LanguageContext` and `translations.js` (already present: `frontend/src/context/LanguageContext.js:6-26`, `frontend/src/utils/translations.js`).
- Dynamic content: prefer serving language-specific fields from backend using `Accept-Language` and existing columns (`title`, `title_en`).
- Fallbacks: if requested language content missing, return default language field.
- Future extension (optional): add more columns (`title_hi`, `description_hi`) in DB for richer multilingual content.

## Data Model and SQL
- Confirm DB name `vaishnavbhakti` in `.env` (matches your note and `backend/server.js:54-62`).
- Tables already covered by existing routes: `users`, `user_preferences`, `scriptures`, `audio_files`, `video_links`, `community_posts`, `global_events`, `families`, `family_members`, `medicines`, `medicine_logs`, `reading_list`, `otp_verifications`.
- Add indices where helpful: `community_posts(family_id, created_at)`, `video_links(is_public, added_at)`, `audio_files(is_public, uploaded_at)` for faster feeds.

## Verification
- Run backend and frontend locally; log in as admin; perform:
  - Create/edit/delete an event → verify in Calendar and Dashboard.
  - Upload scripture (cover/pdf/audio) → verify in Library rendering.
  - Add media (audio/video) → verify in Satsang lists and playback.
  - Create a global text post → verify on Dashboard and Satsang.
  - Medicines: add and mark taken/skip → verify log updates.
  - Switch language → verify labels change and dynamic titles/descriptions localize with fallback.

## Rollout & Safety
- No CSS changes; only JS updates and minimal backend route additions.
- Use feature-by-feature wiring; test each route in isolation.
- Keep existing tokens/guards (`backend/server.js:126-155`) intact.
- Provide a short checklist for admin users to validate each section after changes.
