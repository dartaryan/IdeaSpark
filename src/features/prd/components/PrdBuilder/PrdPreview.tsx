import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { PRD_SECTIONS } from '../../constants/prdSections';
import { PrdSectionCard } from '../PrdSectionCard';
import { validateAllSections } from '../../utils/validatePrdCompletion';
import type { PrdContent } from '../../../../types/database';
import type { PrdSectionKey } from '../../constants/prdSections';

interface PrdPreviewProps {
  prdContent: PrdContent;
  highlightedSections: Set<string>;
  ideaTitle?: string;
  isSaving?: boolean;
  lastSaved?: Date | null;
  onSectionFocus?: (key: PrdSectionKey) => void;
}

export function PrdPreview({ 
  prdContent, 
  highlightedSections, 
  ideaTitle,
  isSaving,
  lastSaved,
  onSectionFocus
}: PrdPreviewProps) {
  const validation = validateAllSections(prdContent);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with Progress */}
      <div className="px-4 py-3 border-b border-base-300 bg-base-50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">PRD Preview</h2>
          {validation.isReady && (
            <span className="flex items-center gap-1 text-success text-sm font-medium">
              <CheckCircleIcon className="w-5 h-5" />
              Ready to Complete
            </span>
          )}
        </div>
        {ideaTitle && (
          <p className="text-sm text-base-content/60 mb-2">{ideaTitle}</p>
        )}
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <progress
            className="progress progress-primary flex-1 h-2"
            value={validation.completedCount}
            max={validation.totalRequired}
          />
          <span className="text-xs text-base-content/60 whitespace-nowrap">
            {validation.completedCount}/{validation.totalRequired} sections
          </span>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-4">
          {PRD_SECTIONS.map(def => (
            <PrdSectionCard
              key={def.key}
              sectionKey={def.key}
              section={prdContent[def.key]}
              isHighlighted={highlightedSections.has(def.key)}
              onClick={() => onSectionFocus?.(def.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
