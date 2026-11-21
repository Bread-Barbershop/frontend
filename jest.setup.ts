/* global jest */
import '@testing-library/jest-dom';

// Next.js uses SVGR for this icon, while Jest treats SVG imports as static assets.
jest.mock('@/shared/assets/icons/check.svg', () => () => null);
