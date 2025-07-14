import { describe, it, expect } from 'vitest';
import { supabase } from './supabase';

describe('supabase client', () => {
  it('should be defined', () => {
    expect(supabase).toBeDefined();
  });
}); 