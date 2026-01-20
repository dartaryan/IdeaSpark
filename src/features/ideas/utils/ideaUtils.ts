/**
 * Generate a title from the problem statement
 * - Takes first 50 characters (configurable via maxLength)
 * - Trims at word boundary if possible
 * - Adds ellipsis if truncated
 * 
 * @param problem - The problem statement text
 * @param maxLength - Maximum title length (default: 50)
 * @returns Generated title string
 */
export function generateIdeaTitle(problem: string, maxLength: number = 50): string {
  // Clean and normalize whitespace
  const cleaned = problem.trim().replace(/\s+/g, ' ');

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Find last space before maxLength to avoid cutting words
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // If we found a space and it's not too early in the string (60% threshold)
  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace) + '...';
  }

  // Otherwise just truncate at maxLength
  return truncated + '...';
}
