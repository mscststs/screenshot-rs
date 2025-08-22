# screenshot-rs

Rust-based screen capture exposed to Node via N-API. Provides a single async API that returns a PNG `Blob`.

## Prerequisites

- Rust toolchain (stable)
- Node.js >= 16.17
- macOS, Windows, or Linux with display access

## Install dev deps

```bash
cd /Users/jiangzhe/repo/github/screenshot-rs
TNPM_REGISTRY=https://registry.npmmirror.com tnpm i
```

## Build

```bash
cd /Users/jiangzhe/repo/github/screenshot-rs
tnpm run build
```

This produces a platform-specific `.node` binary in the package directory.

## Usage

```js
const { captureScreenshotBlob } = require("screenshot-rs");

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

- `async captureScreenshotBlob(): Promise<Blob>`
  - Captures the primary display and returns a PNG `Blob`.

## License

MIT
