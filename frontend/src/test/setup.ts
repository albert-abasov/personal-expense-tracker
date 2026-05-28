import { beforeAll, afterEach, afterAll, vi } from "vitest";
import "@testing-library/jest-dom";
import { server } from "./mocks/server";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
