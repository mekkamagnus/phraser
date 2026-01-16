import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('class1', false && 'class2', 'class3');
      expect(result).toBe('class1 class3');
    });

    it('should merge conflicting Tailwind classes', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500'); // Later class takes precedence
    });

    it('should handle undefined values', () => {
      const result = cn('class1', undefined, 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle mixed truthy/falsy values', () => {
      const result = cn('class1', null, false, 'class2', 0, '', 'class3');
      expect(result).toBe('class1 class2 class3');
    });
  });
});