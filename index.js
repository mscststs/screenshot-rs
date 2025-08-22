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
  // 尝试加载特定平台的预编译文件
  const platform = process.platform;
  const arch = process.arch;
  
  let platformName;
  let archName;
  
  if (platform === 'darwin') {
    platformName = 'darwin';
    archName = arch === 'arm64' ? 'arm64' : 'x64';
  } else if (platform === 'linux') {
    platformName = 'linux';
    archName = arch === 'arm64' ? 'arm64' : 'x64';
  } else if (platform === 'win32') {
    platformName = 'win32';
    archName = 'x64';
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  
  const nodeFileName = `screenshot_rs.${platformName}-${archName}.node`;
  try {
    binding = require(join(__dirname, nodeFileName));
  } catch (platformError) {
    throw new Error(`Failed to load screenshot-rs native module for ${platform}-${arch}. Tried: ${e.message}, ${platformError.message}. Please ensure you have the correct binary for your platform.`);
  }
}

async function captureScreenshot() {
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

export { captureScreenshot, listScreens, captureScreenshotByScreenId }; 