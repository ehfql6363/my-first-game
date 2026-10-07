import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

// 클라우드 환경에는 Chromium이 미리 설치돼 있다. 없으면 Playwright 기본 브라우저를 쓴다.
const preinstalled = '/opt/pw-browsers/chromium';

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'e2e/.results',
  use: {
    baseURL: 'http://localhost:4173',
    ...devices['iPhone 13'],
    browserName: 'chromium',
    viewport: { width: 390, height: 844 },
    launchOptions: existsSync(preinstalled) ? { executablePath: preinstalled } : {},
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: true,
  },
});
