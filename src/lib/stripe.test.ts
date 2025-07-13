import { describe, it, expect } from 'vitest';
import { stripe } from './stripe/config';

describe('stripe config', () => {
  it('should be defined', () => {
    expect(stripe).toBeDefined();
  });
}); 