import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

globalThis.global = globalThis;

// --- Recharts needs ResizeObserver in JSDOM ---
class ResizeObserverMock {
  private _cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this._cb = cb;
  }
  observe(target: Element) {
    // Fire once so ResponsiveContainer thinks it has a size
    this._cb(
      [
        {
          target,
          contentRect: target.getBoundingClientRect()
        } as unknown as ResizeObserverEntry
      ],
      this as unknown as ResizeObserver
    );
  }
  unobserve() {}
  disconnect() {}
}

if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = ResizeObserverMock;
}

// Give elements a non-zero size so charts don't bail out
Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
  configurable: true,
  get() {
    return 800;
  }
});
Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
  configurable: true,
  get() {
    return 600;
  }
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock sql.js for tests
vi.mock("sql.js", () => ({
  default: vi.fn(() =>
    Promise.resolve({
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
    })
  )
}));

// Mock Chart.js and react-chartjs-2
vi.mock("chart.js", () => ({
  Chart: {
    register: vi.fn()
  },
  ArcElement: {},
  BarElement: {},
  CategoryScale: {},
  Filler: {},
  Legend: {},
  LinearScale: {},
  LineElement: {},
  PointElement: {},
  TimeScale: {},
  Title: {},
  Tooltip: {}
}));

// Mock canvas for Chart.js
class MockCanvas {
  getContext() {
    return {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      rect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      setTransform: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      lineWidth: 1,
      strokeStyle: "#000000",
      fillStyle: "#000000",
      globalAlpha: 1,
      font: "10px sans-serif"
    };
  }
}

global.HTMLCanvasElement.prototype.getContext = vi.fn(function (
  this: HTMLCanvasElement,
  contextId: string
) {
  if (contextId === "2d") {
    return new MockCanvas().getContext() as unknown as CanvasRenderingContext2D;
  }
  return null;
}) as typeof HTMLCanvasElement.prototype.getContext;

// Replaces: Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  },
  writable: true,
  configurable: true
});

// Mock localStorage
/* const localStorageMock: Storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};
global.localStorage = localStorageMock; */

// Mock fetch
global.fetch = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
