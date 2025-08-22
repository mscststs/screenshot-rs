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
  // 首先尝试加载预编译的二进制文件
  binding = loadBinding(__dirname, "screenshot-rs", "screenshot_rs");
} catch (e) {
  // 如果预编译文件不存在，尝试加载本地编译的文件
  try {
    binding = require(join(__dirname, "screenshot_rs.node"));
  } catch (localError) {
    throw new Error(`Failed to load screenshot-rs native module: ${e.message}. Please ensure you have the correct binary for your platform or run 'tnpm run build' to compile from source.`);
  }
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