import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
      boot: fileURLToPath(new URL('./src/boot', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.spec.js'],
    setupFiles: ['tests/unit/setup-mocks.js'],
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
    },
  },
})
