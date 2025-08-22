#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Skip conditions
if (process.env.CI || process.env.SKIP_POSTINSTALL) {
  console.log('Skipping postinstall build in CI environment');
  process.exit(0);
}

const bindingPath = join(projectRoot, 'screenshot_rs.node');
if (existsSync(bindingPath)) {
  console.log('Native module already exists, skipping build');
  process.exit(0);
}

console.log('Building native module...');

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...options });
    child.on('close', (code) => {
      if (code === 0) return resolve(0);
      reject(Object.assign(new Error(`${cmd} exited with code ${code}`), { code }));
    });
    child.on('error', (err) => reject(err));
  });
}

async function checkRustToolchain() {
  try {
    await run('rustc', ['--version'], { stdio: 'pipe' });
    console.log('Rust toolchain found');
  } catch (_) {
    throw new Error('Rust toolchain not found. Please install Rust from https://rustup.rs/');
  }
}

async function tryLocalNapi() {
  const localBin = join(projectRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'napi.cmd' : 'napi');
  if (existsSync(localBin)) {
    console.log('Using local @napi-rs/cli');
    await run(localBin, ['build', '--release'], { cwd: projectRoot });
    return true;
  }
  return false;
}

async function tryNpxNapi() {
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  console.log('Falling back to npx @napi-rs/cli');
  await run(npxCmd, ['-y', '@napi-rs/cli', 'build', '--release'], { cwd: projectRoot });
}

async function main() {
  try {
    await checkRustToolchain();

    // Prefer local CLI if present (works with npm/yarn/pnpm/tnpm installing deps)
    const usedLocal = await tryLocalNapi();
    if (!usedLocal) {
      await tryNpxNapi();
    }

    console.log('Native module built successfully!');
  } catch (error) {
    console.error('Postinstall failed:', error && error.message ? error.message : String(error));
    console.error('');
    console.error('To fix this issue:');
    console.error('1. Install Rust: https://rustup.rs/');
    console.error('2. Ensure internet connectivity (npx may download @napi-rs/cli)');
    console.error('3. Re-run installation');
    process.exit(1);
  }
}

main(); 