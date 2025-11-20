## What’s Breaking
- The embedded page `/breathe/index.html` loads raw source `type="module" src="/src/main.tsx"` which browsers cannot run without bundling.
- `main.tsx` imports `./index.css` but the file present is `indexs.css`, causing a missing stylesheet error.
- The icon reference `/icon-192.png` doesn’t exist in the app; only `logo192.png` is present.

## Plan to Make It Work
1. Rename stylesheet to match import
   - Change `frontend/public/breathe/src/indexs.css` → `index.css` OR update the import to `./indexs.css`.
2. Build the Breath app with Vite
   - In `frontend/public/breathe/`: run `npm ci` and `npm run build`.
   - This produces a `dist/` folder with `index.html` and bundled assets under `assets/`.
3. Update the iframe to point at the built app
   - Change `Breathe.jsx` iframe src to `/breathe/dist/index.html` so it uses the compiled bundle.
4. Optional: icon path clean-up
   - If needed, update breath `index.html` to use `/logo192.png` or copy `icon-192.png` into `frontend/public/`.

## Verification Checklist
- Open `/breathe` → page should load without 404s and run timers/animations.
- Browser console shows no missing files (`/src/main.tsx`, CSS, images).
- Mobile view: exercise fills the available height and doesn’t overflow.
- Dashboard quick action and Sidebar link correctly navigate to `/breathe`.

## Safety
- No app-wide CSS changes.
- Breath feature remains sandboxed via iframe; no conflicts with existing styles.

## If Build Isn’t Desired
- Alternative: integrate breath TSX components directly into `/src/components/Breathe` and wire styles locally. This is larger in scope and risks CSS/tooling changes (Tailwind). The bundled-iframe approach is safer and faster.