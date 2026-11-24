import { defineConfig, devices } from "@playwright/test";

const host = "127.0.0.1";
const port = 3160;
const baseURL = `http://${host}:${port}`;
const channel = process.env.PLAYWRIGHT_CHANNEL === "msedge" ? "msedge" : "chromium";
const harnessPort = 3162;
const harnessURL = `http://${host}:${harnessPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], channel } },
  ],
  webServer: [
    {
      command: `node node_modules/next/dist/bin/next dev --hostname ${host} --port ${port}`,
      // Keep the public regression suite independent of local Supabase configuration.
      env: {
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      },
      url: baseURL,
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: `node node_modules/vite/bin/vite.js --config tests/browser/vite.config.mts --port ${harnessPort}`,
      url: harnessURL,
      timeout: 60_000,
      reuseExistingServer: false,
    },
  ],
});
