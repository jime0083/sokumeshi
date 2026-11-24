import { shouldUseEmulator } from '@/src/services/emulatorConfig';

describe('shouldUseEmulator', () => {
  it('returns true when isDev is true and flag is "1"', () => {
    expect(shouldUseEmulator(true, '1')).toBe(true);
  });

  it('returns false when isDev is false even if flag is "1"', () => {
    expect(shouldUseEmulator(false, '1')).toBe(false);
  });

  it('returns false when flag is undefined', () => {
    expect(shouldUseEmulator(true, undefined)).toBe(false);
  });

  it('returns false when flag is "0"', () => {
    expect(shouldUseEmulator(true, '0')).toBe(false);
  });
});
