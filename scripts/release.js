#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute: ${command}`);
    process.exit(1);
  }
}

function updateVersion(type) {
  const currentVersion = packageJson.version;
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  let newVersion;
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    default:
      console.error('Invalid version type. Use: major, minor, or patch');
      process.exit(1);
  }
  
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log(`Version updated from ${currentVersion} to ${newVersion}`);
  return newVersion;
}

function createGitTag(version) {
  const tag = `v${version}`;
  runCommand(`git add .`);
  runCommand(`git commit -m "chore: release ${tag}"`);
  runCommand(`git tag ${tag}`);
  runCommand(`git push origin main --tags`);
}

function main() {
  const args = process.argv.slice(2);
  const versionType = args[0];
  
  if (!versionType || !['major', 'minor', 'patch'].includes(versionType)) {
    console.log('Usage: node scripts/release.js <major|minor|patch>');
    process.exit(1);
  }
  
  console.log('🚀 Starting release process...');
  
  // Update version
  const newVersion = updateVersion(versionType);
  
  // Build for all platforms
  console.log('🔨 Building for all platforms...');
  runCommand('npm run build:all');
  
  // Create git tag and push
  console.log('🏷️  Creating git tag...');
  createGitTag(newVersion);
  
  console.log(`✅ Release ${newVersion} is ready!`);
  console.log('📦 The GitHub Action will automatically publish to npm when the tag is pushed.');
}

main(); 