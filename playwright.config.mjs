import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:9000'
const shouldBootServer = process.env.PW_USE_WEBSERVER === '1'
const reportDir = path.resolve(process.cwd(), 'playwright-report')
const resultsDir = path.resolve(process.cwd(), 'test-results')

fs.mkdirSync(reportDir, { recursive: true })
fs.mkdirSync(resultsDir, { recursive: true })

export default defineConfig({
  testDir: './tests',
  outputDir: resultsDir,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: reportDir, open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    viewport: { width: 1600, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  webServer: shouldBootServer
    ? {
        command: 'npm run dev -- --host 127.0.0.1 --port 9000',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      }
    : undefined,
})
