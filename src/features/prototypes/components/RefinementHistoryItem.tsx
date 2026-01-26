// src/features/prototypes/components/RefinementHistoryItem.tsx

import type { Prototype } from '../types';

interface RefinementHistoryItemProps {
  prototype: Prototype;
  isActive: boolean;
  onClick: () => void;
}

export function RefinementHistoryItem({ prototype, isActive, onClick }: RefinementHistoryItemProps) {
  const formattedDate = new Date(prototype.createdAt).toLocaleString();

  return (
    <div
      className={`card bg-base-100 border-2 cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'border-primary' : 'border-base-300'
      }`}
      onClick={onClick}
    >
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-primary badge-sm">v{prototype.version}</span>
              {isActive && <span className="badge badge-success badge-sm">Current</span>}
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
        <div className="text-xs text-base-content/50 mt-2">
          {formattedDate}
        </div>
      </div>
    </div>
  );
}
