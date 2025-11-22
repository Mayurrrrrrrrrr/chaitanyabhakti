## Overview
- Implement three modules without breaking existing functionality:
  1) Kundli Generation API + React UI
  2) Live Chat via Django Channels + React WebSocket client
  3) Vastu Compass with Google Maps + Places Autocomplete and grid overlay
- Follow DRF class-based views with serializers and React functional components using hooks and Tailwind.

## Task A — Kundli Generation
### Backend (Django DRF)
1. Create `backend/kundli/serializers.py`:
   - `KundliRequestSerializer` with fields: `date` (YYYY-MM-DD), `time` (HH:MM), `timezone` (IANA TZ string, optional), `place_name` (string), `latitude` (float, optional), `longitude` (float, optional).
   - Validation: require either `place_name` or both `latitude`+`longitude`.
2. Implement `backend/kundli/views.py`:
   - `class KundliGenerateView(APIView)` with `post(self, request)`.
   - Use `KundliRequestSerializer` to validate input.
   - Call `consultation/utils.py` VedicAstroAPI function (e.g., `fetch_chart(date, time, tz, lat, lon, place_name)`) to get chart data.
   - Normalize response to include: ascendant, houses, planetary positions (name, sign, degree, nakshatra), and any metadata from the API.
   - Return JSON with `status`, `data`, and `errors` on failure.
3. Add `backend/kundli/urls.py`:
   - `path('api/kundli/generate/', KundliGenerateView.as_view(), name='kundli_generate')`.
4. Wire up in `backend/config/urls.py`:
   - `path('', include('kundli.urls'))` ensuring `/api/kundli/generate/` is reachable.
5. Optional safeguards:
   - Rate limiting per IP (basic in-view count or throttling class if DRF throttling is enabled).
   - Logging around external API errors and timeouts.

### Frontend (React Vite)
1. Create `frontend/src/features/kundli/KundliForm.jsx`:
   - Controlled inputs for `date`, `time`, `place_name` (and optional `lat/lon`).
   - Submit via Axios `POST /api/kundli/generate/` using `vite.config.js` proxy.
   - Loading and error states; disable submit while loading.
2. Create `frontend/src/features/kundli/KundliResults.jsx`:
   - Render planetary positions as a Tailwind table:
     - Columns: Planet, Sign, Degree, Nakshatra, House.
   - Handle empty states and API error messages.
3. Integrate in `frontend/src/App.jsx`:
   - Add route `/kundli` that displays form + results.
4. UX niceties:
   - Basic validation (require fields).
   - Toast or inline error message area.

### Testing & Validation
- Backend: hit `/api/kundli/generate/` with sample payloads; simulate API errors in `utils.py`.
- Frontend: manual tests for form submission and result rendering; verify proxy to avoid CORS.

## Task B — Live Chat System (Django Channels)
### Backend (Channels)
1. Create `backend/consultation/consumers.py`:
   - `class ChatConsumer(AsyncWebsocketConsumer)`.
   - `connect`: parse `room_id` from URL route; add to group; accept connection.
   - `receive`: expect JSON `{type: 'chat.message', message, sender}`; broadcast to group.
   - `chat_message` handler: send JSON to clients.
   - `disconnect`: leave group.
   - Optional: simple token auth via querystring or header (validate JWT or session user).
2. Create `backend/consultation/routing.py`:
   - `websocket_urlpatterns = [path('ws/chat/<room_id>/', ChatConsumer.as_asgi())]`.
3. Update `backend/config/asgi.py`:
   - Use `ProtocolTypeRouter` with `http: get_asgi_application()` and `websocket: AuthMiddlewareStack(URLRouter(consultation.routing.websocket_urlpatterns))`.
4. Settings (confirm already present):
   - `CHANNEL_LAYERS` (for dev, can use `InMemoryChannelLayer`; for prod, plan for Redis when needed).
   - Ensure app `consultation` is in `INSTALLED_APPS` and Channels is installed/active.

### Frontend (React)
1. Create `frontend/src/components/ChatWindow.jsx`:
   - Props: `roomId`, `currentUser`.
   - `useEffect` to open `new WebSocket(wsBase + '/ws/chat/' + roomId + '/')`.
   - Maintain `messages` state; append on `onmessage` (parse JSON).
   - Input box + send button to send JSON messages with type `chat.message`.
   - Auto-reconnect approach (basic backoff) if connection drops.
   - Use Tailwind for chat layout (message list, input area).
2. Environment handling:
   - Dev: `ws://127.0.0.1:8000`.
   - Prod: `wss://<your-backend-domain>`; derive from `import.meta.env.VITE_WS_BASE`.

### Testing & Validation
- Open two browser tabs with same `roomId` and exchange messages; confirm real-time updates.
- Verify unauthorized connections are rejected if auth is enabled.

## Task C — Vastu Compass (Google Maps + Grid Overlay)
### Frontend Only
1. Enhance `frontend/src/components/VastuMap.jsx`:
   - Load Google Maps JS API via `<script>` tag in `index.html` using `VITE_GOOGLE_MAPS_API_KEY`.
   - Initialize map centered on user-selected place or current location.
   - Add Places Autocomplete to search input; on selection, center map and place marker.
   - Overlay Vastu grid (e.g., 9x9) using a transparent CSS grid atop the map container; allow toggling visibility.
   - Add compass/heading indicator using `DeviceOrientationEvent` (mobile) with fallback instructions for desktop.
   - Provide UI controls: toggle grid, toggle satellite view, recenter to selected place.
2. No extra NPM packages:
   - Use vanilla Google Maps JS API and DOM overlays.
3. Styling:
   - Tailwind classes for layout and controls.

### Testing & Validation
- Verify autocomplete suggestions, map centering, and grid overlay alignment.
- Mobile test for compass orientation; ensure permissions are handled.

## Environment & Configuration
- Backend (Prod): PostgreSQL connection and JWT secret; keep `/api/accounts/demo-profile/` working.
- Frontend (Dev): `vite.config.js` proxy `/api -> http://127.0.0.1:8000` retained.
- Frontend (Prod): use `VITE_API_BASE` for Axios; use `VITE_WS_BASE` for WebSockets; use `VITE_GOOGLE_MAPS_API_KEY` for Maps.

## Error Handling & Resilience
- DRF views wrap external API calls with try/except, return 4xx/5xx with clear `detail`.
- React Axios calls use try/catch and show friendly messages; loading states and disabled buttons during requests.
- WebSocket client shows connection status and retries with exponential backoff.

## Deliverables
- Backend: serializers, views, urls for kundli; Channels consumer and routing, ASGI integration.
- Frontend: Kundli form/results components and route; ChatWindow component; Enhanced VastuMap component.
- Documentation: README additions and environment variable samples.

## Rollout Plan
1) Implement and test Task A end-to-end in dev.
2) Implement and test Task B with local Channels setup.
3) Implement Task C and validate on mobile and desktop.
4) Prepare environment variables and small deployment notes for prod.

Confirm to begin implementation, and I will proceed with the code changes.