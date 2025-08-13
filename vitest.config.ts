import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'apps/playground/src/games/callstack-library/domain/**/*.ts',
        'apps/playground/src/games/callstack-library/utils/**/*.ts'
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/types.ts'
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95
      }
    }
  }
})