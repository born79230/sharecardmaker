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
- Versioned, normalized project state lives in `src/model/project.js`.
- Project state updates and cross-field invariants live in `src/hooks/useProjectState.js`.
- Browser-only APIs live in `src/platform/browser.js`.
- Platform adapters are validated by `src/platform/contract.js` before the UI uses them.
- Preview scaling lives in `src/hooks/usePreviewScale.js`.
- Pure formatting and list helpers live in `src/lib/formatters.js`.
- Watermark item construction lives in `src/lib/watermark.js`.
- Minimal PWA metadata lives in `public/manifest.webmanifest` and `public/icon.svg`.
- `npm run build:app` produces relative asset paths for native webview shells.
- Node tests cover project normalization, persistence safety, No pad invariants, watermark output, and platform contracts.

## Architecture Boundary

```text
React UI
  -> useProjectState
    -> versioned Project model (portable, pure JavaScript)
  -> platform adapter contract
    -> browserPlatform today
    -> capacitorPlatform later
    -> tauriPlatform later
```

The UI should never import Capacitor, Tauri, Electron, or native plugins directly. A host app supplies an adapter with these methods:

- `exportCaptureImage(node, action)`
- `getCurrentCoordinates()`
- `readImageFile(file)`
- `loadProject()`
- `saveProject(project)`

This keeps rendering and editor behavior shared while storage, permissions, clipboard, and file APIs remain platform-specific.

## Project Data Strategy

- Every saved project contains `schemaVersion`.
- Loaded data is normalized against current presets and numeric limits.
- Unknown or corrupt stored values fall back safely instead of breaking rendering.
- No pad always enforces `radius = 0` in the model, not only in one UI control.
- Inline uploaded image data is intentionally excluded from localStorage serialization.
- Web should move images to IndexedDB; mobile and desktop shells should store file references in their native sandbox.

## Delivery Phases

1. **Web / PWA hardening**
   - Add a service worker with explicit cache versioning.
   - Add PNG app icons and iOS-specific install metadata.
   - Add visual regression tests for 320 px, 390 px, tablet, and desktop layouts.

2. **Capacitor mobile app**
   - Use `npm run build:app` as the web asset input.
   - Implement geolocation, share sheet, photo save, file picker, and project storage in `capacitorPlatform`.
   - Keep the React capture surface and Project schema unchanged.

3. **Tauri desktop app**
   - Reuse the same app build and Project schema.
   - Implement native save dialogs, clipboard image writing, recent projects, and filesystem-backed assets in `tauriPlatform`.

4. **Optional account sync**
   - Sync versioned Project JSON separately from binary image assets.
   - Add conflict metadata before introducing collaboration or multi-device editing.
   - Keep cloud sync outside the reducer so offline editing remains functional.

## Next Technical Steps

- Add export profiles for social platforms.
- Add automated visual checks for mobile `No pad`, watermark, and export flows.
- Move uploaded images to IndexedDB before expanding project libraries.
- Split the remaining large UI file into editor, preview, and controls feature modules when those areas begin evolving independently.
