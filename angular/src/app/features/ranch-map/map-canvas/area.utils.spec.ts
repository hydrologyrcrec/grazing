import { describe, expect, it } from 'vitest';
import { toAcres } from './area.utils';

describe('pasture area contract', () => {
  it('matches the FastAPI spherical-area reference in acres', () => {
    expect(
      toAcres([
        [27.48, -81.92],
        [27.48, -81.919],
        [27.481, -81.919],
        [27.481, -81.92],
      ]),
    ).toBeCloseTo(2.7106, 4);
  });
  it('returns no area for an incomplete draw', () => {
    expect(toAcres([[27.48, -81.92]])).toBe(0);
  });
});
