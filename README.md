# screenshot-rs

Rust-based screen capture exposed to Node via N-API. Provides a single async API that returns a PNG `Blob`.

## Installation

```bash
npm install screenshot-rs
```

**Note**: This package includes pre-compiled binaries for the following platforms:

- macOS (x64, arm64)
- Windows (x64)
- Linux (x64, arm64)

No compilation required on supported platforms!

## Prerequisites

- Node.js >= 16.17
- macOS, Windows, or Linux with display access

## Development Setup

### Install dev deps

```bash
cd /Users/jiangzhe/repo/github/screenshot-rs
npm install
```

### Build

```bash
cd /Users/jiangzhe/repo/github/screenshot-rs
npm run build
```

This produces a platform-specific `.node` binary in the package directory.

### Build for all platforms

```bash
npm run build:all
```

This builds binaries for all supported platforms.

## Usage

### ES Modules

```js
import {
  captureScreenshotBlob,
  listScreens,
  captureScreenshotByScreenId,
} from "screenshot-rs";

// Capture primary screen
const blob = await captureScreenshotBlob();
console.log("Got blob:", blob.type, blob.size);

// List all screens
const screens = await listScreens();
console.log("Available screens:", screens);

// Capture specific screen
if (screens.length > 0) {
  const screenBlob = await captureScreenshotByScreenId(screens[0].id);
  console.log("Screen blob:", screenBlob.type, screenBlob.size);
}
```

### CommonJS

```js
const {
  captureScreenshotBlob,
  listScreens,
  captureScreenshotByScreenId,
} = require("screenshot-rs");

(async () => {
  const blob = await captureScreenshotBlob();
  console.log("Got blob:", blob.type, blob.size);
})();
```

## Example: save PNG to disk

See full-path example at:
`/Users/jiangzhe/repo/github/screenshot-rs/examples/save-png.js`

Run:

```bash
node /Users/jiangzhe/repo/github/screenshot-rs/examples/save-png.js
```

## API

### Functions

- `async captureScreenshotBlob(): Promise<Blob>`

  - Captures the primary display and returns a PNG `Blob`.

- `async listScreens(): Promise<ScreenInfo[]>`

  - Returns information about all available screens.

- `async captureScreenshotByScreenId(screenId: number): Promise<Blob>`
  - Captures a specific screen by ID and returns a PNG `Blob`.

### Types

```typescript
interface ScreenInfo {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleFactor: number;
  frequency: number;
  isPrimary: boolean;
}
```

## Platform Support

- ✅ macOS (x64, arm64)
- ✅ Windows (x64)
- ✅ Linux (x64, arm64)

## Permissions

### macOS

On macOS, you may need to grant screen recording permissions:

1. Go to System Preferences > Security & Privacy > Privacy > Screen Recording
2. Add your application to the list of allowed apps

### Linux

On Linux, ensure your display server (X11/Wayland) is properly configured.

### Windows

On Windows, no additional permissions are typically required.

## License

MIT
