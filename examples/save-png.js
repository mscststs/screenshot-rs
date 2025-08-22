import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { captureScreenshotBlob, listScreens, captureScreenshotByScreenId } from "../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Capture primary screen and save
  const blob = await captureScreenshotBlob();
  const arrayBuffer = await blob.arrayBuffer();
  writeFileSync(join(__dirname, "screenshot.png"), Buffer.from(arrayBuffer));

  // List screens and capture by id (if available)
  const screens = await listScreens();
  if (screens.length > 0) {
    for (const screen of screens) {
      const byIdBlob = await captureScreenshotByScreenId(screen.id);
      const byIdArrayBuffer = await byIdBlob.arrayBuffer();
      writeFileSync(join(__dirname, `screenshot_by_id_${screen.id}.png`), Buffer.from(byIdArrayBuffer));
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 