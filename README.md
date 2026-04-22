# Playwright PDF Downloader Demo

A JavaScript Playwright demo that downloads a PDF from a remote URL. The project can also produce a standalone **Windows 10 executable** (no Node.js required on the target machine).

---

## Features

- Downloads `sample-local-pdf.pdf` from [ontheline.trincoll.edu](https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf)
- Two download modes:
  - **HTTP Request** (default, lightweight) — uses Playwright's `APIRequestContext`
  - **Browser** — launches a headless Chromium browser and intercepts the download
- Playwright test suite with both modes covered
- Produces a standalone Windows 10 `.exe` via [`@yao-pkg/pkg`](https://github.com/yao-pkg/pkg)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v8 or later

---

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers (required for browser mode and tests)
npx playwright install chromium
```

---

## Usage

### Run the downloader (HTTP request mode)

```bash
npm run download
```

The PDF is saved to `downloads/sample-local-pdf.pdf`.

### Run the downloader (browser mode)

```bash
npm run download:browser
```

### Download a custom URL

```bash
node download-pdf.js --url=https://example.com/file.pdf
node download-pdf.js --url=https://example.com/file.pdf --browser
```

---

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run tests with visible browser
npm run test:headed
```

The test suite covers:
1. Downloading the PDF via Playwright's HTTP request API
2. Navigating to the PDF URL with a headless browser

---

## Building a Windows 10 Executable

```bash
npm run build:exe
```

This produces `dist/pdf-downloader.exe` — a self-contained executable for **Windows 10 (x64)**.

> **Note:** Playwright's browser-based mode (`--browser`) requires Chromium to be installed on the target machine. Run `npx playwright install chromium` on Windows before using `--browser`. The default HTTP request mode works without a browser.

To build executables for all platforms at once:

```bash
npm run build:exe:all
```

This produces:
- `dist/pdf-downloader-win.exe` — Windows 10 x64
- `dist/pdf-downloader-linux` — Linux x64
- `dist/pdf-downloader-macos` — macOS x64

---

## Project Structure

```
Playwright-demo/
├── download-pdf.js           # Standalone download script (entry point for executable)
├── playwright.config.js      # Playwright test configuration
├── tests/
│   └── download-pdf.spec.js  # Playwright test suite
├── downloads/                # Downloaded PDFs (git-ignored)
├── dist/                     # Built executables (git-ignored)
├── package.json
└── README.md
```
