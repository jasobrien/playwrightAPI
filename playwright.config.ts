import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    extraHTTPHeaders: {
      'Accept': 'text/xml',
      'Content-Type': 'text/xml;charset=UTF-8'
    },
  },
  reporter: 'html',
});
