import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

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
}) as any;

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
