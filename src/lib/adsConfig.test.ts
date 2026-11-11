import { describe, it, expect } from 'vitest';
import { adsEnabledFrom } from './adsConfig';

describe('VITE_ADS_ENABLED kill switch', () => {
  it('defaults to on when unset', () => {
    expect(adsEnabledFrom(undefined)).toBe(true);
  });
  it.each(['false', 'FALSE', '0', 'off', ' no '])('turns ads off for %j', (value) => {
    expect(adsEnabledFrom(value)).toBe(false);
  });
  it.each(['true', '1', 'on', ''])('keeps ads on for %j', (value) => {
    expect(adsEnabledFrom(value)).toBe(true);
  });
});
