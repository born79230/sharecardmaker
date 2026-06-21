# App Readiness Plan

## Direction

Share Card Maker should stay a focused capture tool, but the code should be shaped as a portable product:

- Keep React as the shared UI layer for web, desktop shells, and webview-based mobile shells.
- Keep export, clipboard, file picker, and geolocation behind platform adapters.
- Keep design presets, aspect ratios, initial content, and formatting rules free of browser APIs.
- Keep output rendering deterministic so native wrappers can call the same capture surface.

## Recommended Path

1. **PWA first**
   - Add a manifest, icons, service worker, and install prompt.
   - This gives mobile home-screen install with the smallest architecture change.

2. **Desktop shell**
   - Prefer Tauri if the app stays lightweight.
   - Prefer Electron if deeper OS clipboard, tray, or native capture workflows become important.
   - Replace `src/platform/browser.js` with a desktop adapter for clipboard and file saving.

3. **Mobile shell**
   - Prefer Capacitor if this React UI remains the product surface.
   - Use native plugins for geolocation, share sheet, image save, and file import.
   - Keep the capture surface in webview until there is a clear reason for a fully native renderer.

4. **Native rewrite only if needed**
   - React Native becomes worthwhile if the app grows into a long-lived editor with native gestures, local files, and offline libraries.

## Code Preparation Done

- Presets and initial content live in `src/presets.js`.
- Browser-only APIs live in `src/platform/browser.js`.
- Preview scaling lives in `src/hooks/usePreviewScale.js`.
- Pure formatting and list helpers live in `src/lib/formatters.js`.
- Watermark item construction lives in `src/lib/watermark.js`.
- Minimal PWA metadata lives in `public/manifest.webmanifest` and `public/icon.svg`.

## Next Technical Steps

- Add persistent project state with a versioned schema.
- Add export profiles for social platforms.
- Add a platform adapter interface for native share, save, and file import.
- Add automated visual checks for mobile `No pad`, watermark, and export flows.
