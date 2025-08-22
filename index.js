"use strict";

import helper from "@node-rs/helper";
import { join } from "path";
import { Blob } from "buffer";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const { loadBinding } = helper;

let binding;
try {
  binding = loadBinding(__dirname, "screenshot-rs", "screenshot_rs");
} catch (e) {
  binding = require(join(__dirname, "screenshot_rs.node"));
}

async function captureScreenshotBlob() {
  const nativeFn = binding.captureScreenshot || binding.capture_screenshot;
  if (typeof nativeFn !== "function") {
    throw new Error("Native module does not export captureScreenshot/capture_screenshot");
  }
  const pngBuffer = await nativeFn();
  return new Blob([pngBuffer], { type: "image/png" });
}

async function listScreens() {
  if (typeof binding.listScreens !== "function") {
    throw new Error("Native module does not export listScreens");
  }
  return binding.listScreens();
}

async function captureScreenshotByScreenId(screenId) {
  const nativeFn = binding.captureScreenshotByScreenId || binding.capture_screenshot_by_screen_id;
  if (typeof nativeFn !== "function") {
    throw new Error("Native module does not export captureScreenshotByScreenId/capture_screenshot_by_screen_id");
  }
  const pngBuffer = await nativeFn(screenId);
  return new Blob([pngBuffer], { type: "image/png" });
}

export { captureScreenshotBlob, listScreens, captureScreenshotByScreenId }; 