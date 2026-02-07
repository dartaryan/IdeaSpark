// src/features/prototypes/components/RefinementHistoryItem.tsx

import { useMemo } from 'react';
import { FileCode2, Hash } from 'lucide-react';
import type { Prototype } from '../types';
import { parsePrototypeCode } from '../types';

interface RefinementHistoryItemProps {
  prototype: Prototype;
  isActive: boolean;
  onClick: () => void;
  /** Previous version for computing change summary (optional) */
  previousVersion?: Prototype | null;
}

/**
 * Compute approximate line count from code content.
 */
function countLines(code: string | null): number {
  if (!code) return 0;
  try {
    const parsed = JSON.parse(code);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      let total = 0;
      for (const content of Object.values(parsed)) {
        if (typeof content === 'string') {
          total += content.split('\n').length;
        }
      }
      return total;
    }
  } catch {
    // Not JSON, treat as single file
  }
  return code.split('\n').length;
}

/**
 * Compute number of files in prototype code.
 */
function countFiles(code: string | null): number {
  if (!code) return 0;
  const files = parsePrototypeCode(code);
  return Object.keys(files).length;
}

/**
 * Compute change summary: +X / -Y lines between two versions.
 * Uses line-by-line set comparison per file for a more accurate estimate
 * than a simple line-count diff.
 */
function computeChangeSummary(
  currentCode: string | null,
  previousCode: string | null,
): { added: number; removed: number } | null {
  if (!currentCode || !previousCode) return null;

  const currentFiles = parsePrototypeCode(currentCode);
  const previousFiles = parsePrototypeCode(previousCode);
  const allPaths = new Set([...Object.keys(currentFiles), ...Object.keys(previousFiles)]);

  let added = 0;
  let removed = 0;

  for (const path of allPaths) {
    const prevLines = previousFiles[path]?.content.split('\n') || [];
    const currLines = currentFiles[path]?.content.split('\n') || [];

    if (!previousFiles[path]) {
      // Entirely new file — all lines are additions
      added += currLines.length;
    } else if (!currentFiles[path]) {
      // File removed — all lines are deletions
      removed += prevLines.length;
    } else {
      // Both exist — count lines unique to each side
      const prevSet = new Set(prevLines);
      const currSet = new Set(currLines);
      for (const line of currLines) {
        if (!prevSet.has(line)) added++;
      }
      for (const line of prevLines) {
        if (!currSet.has(line)) removed++;
      }
    }
  }

  if (added === 0 && removed === 0) return null;
  return { added, removed };
}

export function RefinementHistoryItem({
  prototype,
  isActive,
  onClick,
  previousVersion,
}: RefinementHistoryItemProps) {
  const formattedDate = new Date(prototype.createdAt).toLocaleString();

  const fileCount = useMemo(() => countFiles(prototype.code), [prototype.code]);
  const lineCount = useMemo(() => countLines(prototype.code), [prototype.code]);
  const changeSummary = useMemo(
    () => computeChangeSummary(prototype.code, previousVersion?.code ?? null),
    [prototype.code, previousVersion?.code],
  );

  const tooltipText = [
    `Version ${prototype.version}`,
    `Created: ${formattedDate}`,
    `${fileCount} file${fileCount !== 1 ? 's' : ''}`,
    `~${lineCount} lines`,
    prototype.refinementPrompt ? `Note: "${prototype.refinementPrompt}"` : 'Initial prototype',
  ].join('\n');

  return (
    <div
      className={`card bg-base-100 border-2 cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'border-primary' : 'border-base-300'
      }`}
      onClick={onClick}
      title={tooltipText}
    >
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-primary badge-sm">v{prototype.version}</span>
              {isActive && <span className="badge badge-success badge-sm">Current</span>}
              {/* File count badge (Subtask 5.1) */}
              {fileCount > 0 && (
                <span className="badge badge-ghost badge-xs gap-0.5" data-testid="file-count-badge">
                  <FileCode2 className="w-3 h-3" />
                  {fileCount}
                </span>
              )}
              {/* Line count badge (Subtask 5.2) */}
              {lineCount > 0 && (
                <span className="badge badge-ghost badge-xs gap-0.5" data-testid="line-count-badge">
                  <Hash className="w-3 h-3" />
                  ~{lineCount}
                </span>
              )}
            </div>
            {prototype.refinementPrompt ? (
              <p className="text-sm mt-2 text-base-content/80">
                "{prototype.refinementPrompt}"
              </p>
            ) : (
              <p className="text-sm mt-2 text-base-content/60 italic">
                Initial prototype
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-base-content/50">
            {formattedDate}
          </span>
          {/* Change summary (Subtask 5.3) */}
          {changeSummary && (
            <span className="text-xs font-mono" data-testid="change-summary">
              <span className="text-success">+{changeSummary.added}</span>
              {' / '}
              <span className="text-error">-{changeSummary.removed}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
