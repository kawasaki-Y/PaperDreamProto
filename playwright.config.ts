import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:5001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // macOS の AirPlay が port 5000 を占有するため 5001 を使用
    // DATABASE_URL はダミー値を注入 — API は全モックなので実 DB には接続しない
    command: 'npm run dev',
    url: 'http://localhost:5001',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      PORT: '5001',
      DATABASE_URL: 'postgresql://e2e:e2e@localhost:5432/e2e_dummy',
    },
  },
});
