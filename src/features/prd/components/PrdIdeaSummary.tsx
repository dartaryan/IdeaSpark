import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import type { IdeaSummary } from '../types';

interface PrdIdeaSummaryProps {
  idea: IdeaSummary;
}

export function PrdIdeaSummary({ idea }: PrdIdeaSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-8 print:mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <LightBulbIcon className="w-5 h-5 text-warning" />
          <span className="font-medium">Original Idea Context</span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5" />
        ) : (
          <ChevronDownIcon className="w-5 h-5" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 p-4 bg-base-200/50 rounded-lg space-y-4">
          {/* Problem */}
          <div>
            <h4 className="text-sm font-semibold text-base-content/70 mb-1">Problem</h4>
            <p className="text-sm">{idea.enhanced_problem || idea.problem}</p>
          </div>

          {/* Solution */}
          <div>
            <h4 className="text-sm font-semibold text-base-content/70 mb-1">Solution</h4>
            <p className="text-sm">{idea.enhanced_solution || idea.solution}</p>
          </div>

          {/* Impact */}
          <div>
            <h4 className="text-sm font-semibold text-base-content/70 mb-1">Expected Impact</h4>
            <p className="text-sm">{idea.enhanced_impact || idea.impact}</p>
          </div>
        </div>
      )}
    </div>
  );
}
