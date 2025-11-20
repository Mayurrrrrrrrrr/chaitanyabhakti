## Current Setup
- Frontend serves on port `3000` via CRA (`frontend/package.json:21`).
- Backend Express serves APIs on port `5000` (`backend/server.js:197-200`).
- `/breathe` is a client-side route in React Router (`frontend/src/App.js:84`).
- The Breathe page renders an iframe to static content at `/breathe/dist/index.html` (`frontend/src/components/Breathe.jsx:21-26`).
- Static assets for the breathe app exist under `frontend/public/breathe/dist/index.html` and related files (`frontend/public/breathe/dist/index.html`).

## Verification Steps
1. Confirm React route:
   - Open `frontend/src/App.js` and verify `<Route path="breathe" element={<Breathe />} />` (`frontend/src/App.js:84`).
2. Confirm component renders HTML:
   - Open `frontend/src/components/Breathe.jsx` and verify the iframe source `src="/breathe/dist/index.html"` (`frontend/src/components/Breathe.jsx:23`).
3. Confirm server ports:
   - Frontend dev server should run on `3000` (CRA default) (`frontend/package.json:21`).
   - Backend runs on `5000` (`backend/server.js:197-200`).
4. Assets exist and are served:
   - Ensure `frontend/public/breathe/dist/index.html` and `assets/*` exist (`frontend/public/breathe/dist/index.html`). CRA serves `public` at the root, so `/breathe/...` is available.
5. Middleware interception check:
   - Backend applies auth only to `/api/*` routes (`backend/server.js:180-191`); `/breathe` is unaffected.
   - Frontend catch-all is present but `/breathe` is explicitly registered (`frontend/src/App.js:110-111`).
6. Logs:
   - Access `http://localhost:3000/breathe/` and watch the frontend dev server terminal for any errors; the backend logs will not show requests to port `3000`.

## Minimal Code Adjustments (no new packages)
- Add robust error handling to the iframe in `Breathe.jsx`:
  - Handle `onError` to show a friendly message if `/breathe/dist/index.html` fails to load and optionally link to `/breathe/index.html` fallback.
- Optional: ensure trailing slash compatibility by adding `<Route path="breathe/*" element={<Breathe />} />` if needed. React Router v6 typically matches `/breathe/` to `"breathe"`, so this is only if a mismatch is observed.

## Testing Instructions
- Browser navigation:
  - Log in, then visit `http://localhost:3000/breathe/` and confirm the Breathe UI loads in the iframe.
- Direct file access:
  - Open `http://localhost:3000/breathe/dist/index.html` to verify static content is served (no auth required).
- cURL/Postman:
  - `curl -i http://localhost:3000/breathe/` should return the CRA HTML shell; the app renders in a browser, not in cURL.
  - `curl -i http://localhost:3000/breathe/dist/index.html` should return `200` with HTML content.
- Console logs:
  - Check the browser console for resource load errors and the terminal where `npm start` runs for CRA warnings.

## Error Handling
- Implement `onError` on the iframe to:
  - Display a fallback message and guidance to ensure files exist under `frontend/public/breathe/dist/`.
  - Optionally log a console error for easier debugging.
- No changes to Express error middleware are required for this endpoint since it is served by the frontend.

## Acceptance Criteria
- Visiting `http://localhost:3000/breathe/` while authenticated renders the Breathe page with embedded content.
- Static assets at `/breathe/dist/*` resolve with status `200`.
- No backend middleware intercepts or blocks the route; backend logs remain idle for port `3000` requests.
- Friendly error message appears if the iframe source fails to load, without adding any new dependencies.