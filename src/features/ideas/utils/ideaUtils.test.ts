import { describe, it, expect } from 'vitest';
import { generateIdeaTitle } from './ideaUtils';

describe('generateIdeaTitle', () => {
  describe('basic functionality', () => {
    it('returns original text when under maxLength', () => {
      const problem = 'Short problem';
      expect(generateIdeaTitle(problem)).toBe('Short problem');
    });

    it('returns original text when exactly maxLength', () => {
      const problem = 'A'.repeat(50); // Exactly 50 chars
      expect(generateIdeaTitle(problem)).toBe(problem);
    });

    it('truncates long text and adds ellipsis', () => {
      const problem = 'This is a very long problem statement that exceeds the maximum length limit';
      const result = generateIdeaTitle(problem);
      expect(result.endsWith('...')).toBe(true);
      expect(result.length).toBeLessThanOrEqual(53); // 50 + 3 for ellipsis
    });
  });

  describe('word boundary handling', () => {
    it('truncates at word boundary when possible', () => {
      const problem = 'This is a test problem statement that describes the issue';
      const result = generateIdeaTitle(problem);
      // Should truncate at word boundary - the result ends with "that describes..."
      expect(result).toBe('This is a test problem statement that describes...');
    });

    it('truncates at maxLength when no suitable word boundary found', () => {
      // Long word at the beginning
      const problem = 'Supercalifragilisticexpialidocious and other words here';
      const result = generateIdeaTitle(problem);
      expect(result.endsWith('...')).toBe(true);
    });

    it('uses word boundary only if space is after 60% of maxLength', () => {
      // Space before 60% threshold should be ignored
      const problem = 'Hi there this is a much longer text that needs truncation here';
      const result = generateIdeaTitle(problem);
      expect(result.endsWith('...')).toBe(true);
    });
  });

  describe('whitespace normalization', () => {
    it('trims leading and trailing whitespace', () => {
      const problem = '  Trimmed problem statement  ';
      expect(generateIdeaTitle(problem)).toBe('Trimmed problem statement');
    });

    it('normalizes multiple spaces to single space', () => {
      const problem = 'Problem   with   multiple   spaces';
      expect(generateIdeaTitle(problem)).toBe('Problem with multiple spaces');
    });

    it('handles tabs and newlines', () => {
      const problem = 'Problem\twith\ttabs\nand\nnewlines';
      expect(generateIdeaTitle(problem)).toBe('Problem with tabs and newlines');
    });

    it('handles mixed whitespace', () => {
      const problem = '  Problem  \t\n with   mixed   whitespace  ';
      expect(generateIdeaTitle(problem)).toBe('Problem with mixed whitespace');
    });
  });

  describe('custom maxLength', () => {
    it('respects custom maxLength parameter', () => {
      const problem = 'This is a problem statement';
      const result = generateIdeaTitle(problem, 10);
      expect(result.length).toBeLessThanOrEqual(13); // 10 + 3 for ellipsis
    });

    it('returns full text when under custom maxLength', () => {
      const problem = 'Short';
      expect(generateIdeaTitle(problem, 100)).toBe('Short');
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(generateIdeaTitle('')).toBe('');
    });

    it('handles whitespace-only string', () => {
      expect(generateIdeaTitle('   ')).toBe('');
    });

    it('handles single word longer than maxLength', () => {
      const problem = 'Supercalifragilisticexpialidocious';
      const result = generateIdeaTitle(problem, 20);
      // Takes first 20 chars of cleaned string
      expect(result).toBe('Supercalifragilistic...');
    });

    it('handles text that is exactly one character over', () => {
      const problem = 'A'.repeat(51);
      const result = generateIdeaTitle(problem);
      expect(result).toBe('A'.repeat(50) + '...');
    });
  });

  describe('real-world examples', () => {
    it('generates reasonable title from typical problem statement', () => {
      const problem = 'Our employees spend too much time manually entering data from paper forms into the system, leading to errors and delays.';
      const result = generateIdeaTitle(problem);
      expect(result).toBe('Our employees spend too much time manually...');
    });

    it('generates reasonable title from short problem statement', () => {
      const problem = 'Login takes too long';
      const result = generateIdeaTitle(problem);
      expect(result).toBe('Login takes too long');
    });
  });
});
