// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/** Specs that require login – run under `authenticated` project (login once via auth-setup). */
const AUTHENTICATED_SPECS = [
  /dashboard\/dashboard\.spec\.js/,
  /buysell\/buysell\.spec\.js/,
  /rapixpay\/rapixpay\.spec\.js/,
  /transfer_swap\/crypto_deposit_withdraw\.spec\.js/,
  /transaction_history\/transaction_history\.spec\.js/,
  /transfer_swap\/swap\.spec\.js/,
  /transfer_swap\/swap\.discover\.spec\.js/,
  /transfer_swap\/internal_transfer\.spec\.js/,
];

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for */
  timeout: 120 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* No retries locally – stopped or failed tests won't run again; use --retries=2 for CI if needed */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'https://uat-eks.rapixchange.com',

    /* Run browser in headed mode */
    headless: false,

    actionTimeout: 30000,
    navigationTimeout: 60000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [
        ...AUTHENTICATED_SPECS,
        /auth\/auth\.setup\.js/,
        /swap\.auth\.setup\.js/,
        /transfer\.auth\.setup\.js/,
      ],
    },
    {
      name: 'auth-setup',
      testMatch: /auth\/auth\.setup\.js/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'authenticated',
      testMatch: AUTHENTICATED_SPECS,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },
  ],
});
