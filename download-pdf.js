#!/usr/bin/env node
/**
 * Playwright PDF Downloader
 *
 * Downloads a PDF from a URL using Playwright's APIRequestContext.
 * This script can be packaged as a Windows 10 executable using:
 *   npm run build:exe
 */

'use strict';

const { chromium, request } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PDF_URL = 'https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf';

function getDownloadDir() {
  const downloadsDir = path.join(process.cwd(), 'downloads');
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }
  return downloadsDir;
}

async function downloadPdfWithRequest(url, outputPath) {
  console.log(`[Playwright] Downloading PDF via HTTP request...`);
  const context = await request.newContext();
  try {
    const response = await context.get(url);
    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }
    const buffer = await response.body();
    fs.writeFileSync(outputPath, buffer);
    console.log(`[Playwright] PDF saved to: ${outputPath}`);
    console.log(`[Playwright] File size: ${fs.statSync(outputPath).size} bytes`);
  } finally {
    await context.dispose();
  }
}

async function downloadPdfWithBrowser(url, outputPath) {
  console.log(`[Playwright] Launching browser to download PDF...`);
  const downloadDir = path.dirname(outputPath);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    acceptDownloads: true,
  });
  const page = await context.newPage();

  try {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 30000 }).catch(() => null),
      page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }),
    ]);

    if (download) {
      await download.saveAs(outputPath);
      console.log(`[Browser] PDF saved to: ${outputPath}`);
      console.log(`[Browser] File size: ${fs.statSync(outputPath).size} bytes`);
    } else {
      console.log(`[Browser] PDF may have been rendered inline in the browser.`);
      console.log(`[Browser] Try the HTTP request method instead.`);
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const useBrowser = args.includes('--browser');
  const url = args.find((a) => a.startsWith('--url='))?.split('=')[1] || PDF_URL;

  const downloadDir = getDownloadDir();
  const fileName = path.basename(url.split('?')[0]) || 'downloaded.pdf';
  const outputPath = path.join(downloadDir, fileName);

  console.log('=== Playwright PDF Downloader ===');
  console.log(`URL:         ${url}`);
  console.log(`Output:      ${outputPath}`);
  console.log(`Mode:        ${useBrowser ? 'Browser' : 'HTTP Request (default)'}`);
  console.log('');

  try {
    if (useBrowser) {
      await downloadPdfWithBrowser(url, outputPath);
    } else {
      await downloadPdfWithRequest(url, outputPath);
    }
    console.log('\n✓ Download complete!');
  } catch (err) {
    console.error('\n✗ Download failed:', err.message);
    process.exit(1);
  }
}

main();
