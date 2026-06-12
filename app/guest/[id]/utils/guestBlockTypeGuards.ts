import { parseGuestPayload } from '../validation/parseGuestPayload';

import type { GuestPayload } from '../types/guestTypes';

/**
 * Compatibility wrapper for legacy call sites.
 *
 * New guest validation should use parseGuestPayload so callers can inspect
 * normalized payload data and warnings. This boolean guard remains for older
 * code and tests that only need a pass/fail answer.
 */
export function isGuestPayload(x: unknown): x is GuestPayload {
  return parseGuestPayload(x).ok;
}
