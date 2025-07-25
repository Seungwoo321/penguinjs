import { vi } from 'vitest'

// Mock global objects
global.Date.now = vi.fn(() => 1640995200000) // Fixed timestamp for consistent tests

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})