import { normalizeSize } from './size';

describe('normalizeSize', () => {
  it('maps the deprecated legacy values onto the canonical vocabulary', () => {
    expect(normalizeSize('small')).toBe('sm');
    expect(normalizeSize('large')).toBe('lg');
  });

  it('passes canonical values through unchanged', () => {
    expect(normalizeSize('sm')).toBe('sm');
    expect(normalizeSize('md')).toBe('md');
    expect(normalizeSize('lg')).toBe('lg');
  });

  it('normalizes absent values to the default (middle) size', () => {
    expect(normalizeSize(undefined)).toBeUndefined();
  });
});
