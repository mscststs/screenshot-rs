#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 检查是否在 CI 环境中，如果是则跳过构建
if (process.env.CI || process.env.SKIP_POSTINSTALL) {
  console.log('Skipping postinstall build in CI environment');
  process.exit(0);
}

// 检查是否已经存在二进制文件
const bindingPath = join(projectRoot, 'screenshot_rs.node');
if (existsSync(bindingPath)) {
  console.log('Native module already exists, skipping build');
  process.exit(0);
}

console.log('Building native module...');

// 检查是否有 Rust 工具链
function checkRustToolchain() {
  return new Promise((resolve, reject) => {
    const rustc = spawn('rustc', ['--version'], { stdio: 'pipe' });
    let output = '';
    
    rustc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    rustc.on('close', (code) => {
      if (code === 0) {
        console.log('Rust toolchain found:', output.trim());
        resolve(true);
      } else {
        reject(new Error('Rust toolchain not found. Please install Rust from https://rustup.rs/'));
      }
    });
    
    rustc.on('error', () => {
      reject(new Error('Rust toolchain not found. Please install Rust from https://rustup.rs/'));
    });
  });
}

// 使用 npx 运行 napi-rs CLI
function runNapiBuild() {
  return new Promise((resolve, reject) => {
    console.log('Starting native module build with npx...');
    
    const build = spawn('npx', ['@napi-rs/cli', 'build', '--release'], {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    build.on('close', (code) => {
      if (code === 0) {
        console.log('Native module built successfully!');
        resolve();
      } else {
        reject(new Error(`Build failed with exit code ${code}`));
      }
    });
    
    build.on('error', (err) => {
      reject(new Error(`Build process error: ${err.message}`));
    });
  });
}

// 主函数
async function main() {
  try {
    await checkRustToolchain();
    await runNapiBuild();
  } catch (error) {
    console.error('Postinstall failed:', error.message);
    console.error('');
    console.error('To fix this issue:');
    console.error('1. Install Rust: https://rustup.rs/');
    console.error('2. Ensure you have internet connection for npx to download @napi-rs/cli');
    console.error('3. Run: npm install');
    process.exit(1);
  }
}

main(); 