# Installation Guide

This package compiles native modules during installation. Follow these steps to install successfully.

## Prerequisites

### 1. Install Rust Toolchain

Visit [https://rustup.rs/](https://rustup.rs/) and follow the installation instructions for your platform.

Verify installation:

```bash
rustc --version
cargo --version
```

### 2. Internet Connection

Ensure you have internet connection for npx to download @napi-rs/cli during installation.

## Installation

Once prerequisites are installed, simply run:

```bash
npm install screenshot-rs
```

The package will automatically:

1. Download Rust dependencies
2. Compile the native module for your platform
3. Place the binary in the correct location

## Troubleshooting

### Common Issues

#### "Rust toolchain not found"

- Install Rust from https://rustup.rs/
- Ensure `rustc` and `cargo` are in your PATH

#### "napi-rs CLI not found"

- Ensure you have internet connection
- The package will automatically download @napi-rs/cli via npx

#### Build failures on Linux

- Install build essentials: `sudo apt-get install build-essential` (Ubuntu/Debian)
- Install build tools: `sudo yum groupinstall "Development Tools"` (CentOS/RHEL)

#### Build failures on macOS

- Install Xcode Command Line Tools: `xcode-select --install`

#### Build failures on Windows

- Install Visual Studio Build Tools
- Ensure you have the MSVC toolchain: `rustup default stable-msvc`

### Manual Build

If automatic installation fails, you can build manually:

```bash
# Clone the repository
git clone <repository-url>
cd screenshot-rs

# Install dependencies
npm install

# Build manually
napi build --release
```

### Skip Postinstall

To skip the postinstall build (e.g., in CI environments):

```bash
SKIP_POSTINSTALL=1 npm install
```

## Platform Support

- ✅ macOS (x64, arm64)
- ✅ Windows (x64)
- ✅ Linux (x64, arm64)

## Performance

The first installation may take longer due to Rust compilation. Subsequent installations will be faster as dependencies are cached.
