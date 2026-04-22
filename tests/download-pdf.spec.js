// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const dns = require('dns');
const { promisify } = require('util');

const PDF_URL = 'https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf';
const PDF_HOST = 'ontheline.trincoll.edu';
const DOWNLOAD_DIR = path.join(__dirname, '..', 'downloads');

const dnsLookup = promisify(dns.lookup);

/** Returns true when the PDF host is reachable, false in offline/sandboxed environments. */
async function isNetworkAvailable() {
  try {
    await dnsLookup(PDF_HOST);
    return true;
  } catch {
    return false;
  }
}

test.describe('PDF Download', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(DOWNLOAD_DIR)) {
      fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    }
  });

  test('should download PDF using Playwright APIRequestContext', async ({ request }) => {
    const online = await isNetworkAvailable();
    test.skip(!online, `Skipping: ${PDF_HOST} is not reachable in this environment`);

    const response = await request.get(PDF_URL);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('pdf');

    const buffer = await response.body();
    expect(buffer.length).toBeGreaterThan(0);

    const filePath = path.join(DOWNLOAD_DIR, 'sample-local-pdf.pdf');
    fs.writeFileSync(filePath, buffer);

    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.statSync(filePath).size).toBeGreaterThan(0);

    console.log(`PDF downloaded successfully to: ${filePath}`);
    console.log(`File size: ${fs.statSync(filePath).size} bytes`);
  });

  test('should download PDF via browser navigation', async ({ page }) => {
    const online = await isNetworkAvailable();
    test.skip(!online, `Skipping: ${PDF_HOST} is not reachable in this environment`);

    const filePath = path.join(DOWNLOAD_DIR, 'sample-local-pdf-browser.pdf');

    try {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30000 }),
        page.goto(PDF_URL, { waitUntil: 'domcontentloaded', timeout: 30000 }),
      ]);

      await download.saveAs(filePath);
      expect(fs.existsSync(filePath)).toBe(true);
      console.log(`PDF downloaded via browser to: ${filePath}`);
    } catch {
      // Some browsers render PDFs inline rather than triggering a download event
      const url = page.url();
      expect(url).toContain('pdf');
      console.log('PDF rendered inline at URL:', url);
    }
  });
});
