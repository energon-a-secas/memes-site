import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  use: { baseURL: 'http://127.0.0.1:8778', viewport: {width:1440,height:1000}, trace:'retain-on-failure' },
  webServer: { command:'python3 -m http.server 8778 --bind 127.0.0.1', url:'http://127.0.0.1:8778', reuseExistingServer:!process.env.CI, stdout:'ignore', stderr:'ignore' },
  reporter:'list',
});
