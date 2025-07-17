import { vi } from 'vitest';

// Mock sql.js for tests
vi.mock('sql.js', () => ({
  default: vi.fn(() => Promise.resolve({
    Database: vi.fn().mockImplementation(() => ({
      run: vi.fn(),
      prepare: vi.fn(() => ({
        run: vi.fn(),
        bind: vi.fn(),
        step: vi.fn(),
        getAsObject: vi.fn(),
        free: vi.fn()
      })),
      exec: vi.fn(),
      export: vi.fn(() => new Uint8Array()),
      close: vi.fn()
    }))
  }))
}));

// Mock localStorage
const localStorageMock: Storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});