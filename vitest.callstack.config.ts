import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: [
        'apps/playground/src/games/callstack-library/domain/**/*.ts',
        'apps/playground/src/games/callstack-library/utils/**/*.ts',
        'apps/playground/src/games/callstack-library/features/**/*.ts',
        'apps/playground/src/games/callstack-library/constants/**/*.ts',
        'apps/playground/src/games/callstack-library/types/**/*.ts',
        'apps/playground/src/games/callstack-library/app/**/*.ts',
        'apps/playground/src/games/callstack-library/*.ts'
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/node_modules/**',
        '**/dist/**'
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100
      }
    }
  }
})