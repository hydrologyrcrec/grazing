import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    launchOptions: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE']
      ? {
          executablePath: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE'],
          args: ['--no-sandbox', '--disable-dev-shm-usage'],
        }
      : {},
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
    screenshot: 'on',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command:
        'uv run --directory ../backend uvicorn tests.e2e_server:app --host 127.0.0.1 --port 8000 --no-access-log',
      url: 'http://127.0.0.1:8000/api/health/ready',
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: 'npm start',
      url: 'http://localhost:4200',
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
