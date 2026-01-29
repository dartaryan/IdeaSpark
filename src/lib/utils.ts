/**
 * Utility function to conditionally join class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Format a date string to a localized format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Story 6.3 Task 11: Get PassportCard theme color for pipeline status
 * Subtask 11.2: Map statuses to PassportCard theme colors
 * Subtask 11.3: Return hex color code for given status
 * Subtask 11.4: Handle unknown status gracefully (return default gray)
 * Subtask 11.6: Document color choices
 * 
 * Color Rationale:
 * - submitted (gray): Neutral, awaiting review
 * - approved (blue): Positive signal, ready to start
 * - prd_development (yellow): In progress, active work
 * - prototype_complete (green): Success, completed
 * - rejected (red): Stopped, not moving forward
 */
export function getPipelineStageColor(status: string): string {
  const colorMap: Record<string, string> = {
    submitted: '#94A3B8',        // Neutral gray (Slate 400)
    approved: '#0EA5E9',          // Sky blue (Sky 500)
    prd_development: '#F59E0B',   // Amber yellow (Amber 500)
    prototype_complete: '#10B981', // Green (Emerald 500)
    rejected: '#EF4444',          // Red (Red 500)
  };
  
  // Subtask 11.4: Default to gray for unknown status
  return colorMap[status] || '#94A3B8';
}
