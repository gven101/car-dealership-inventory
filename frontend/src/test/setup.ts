import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Remove rendered components after each test so tests don't see each other's DOM
afterEach(() => {
  cleanup();
});