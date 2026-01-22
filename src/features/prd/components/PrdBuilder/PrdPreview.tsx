import { PrdSection } from '../PrdSection';
import { PRD_SECTION_KEYS } from '../../types';
import type { PrdContent, PrdSectionKey } from '../../types';

interface PrdPreviewProps {
  prdContent: PrdContent;
  highlightedSections: Set<string>;
  ideaTitle?: string;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export function PrdPreview({ 
  prdContent, 
  highlightedSections, 
  ideaTitle,
  isSaving,
  lastSaved 
}: PrdPreviewProps) {
  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Header */}
      <div className="border-b border-base-300 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">PRD Preview</h2>
            {ideaTitle && (
              <p className="text-sm text-base-content/60">{ideaTitle}</p>
            )}
          </div>
          <div className="text-xs text-base-content/50">
            {isSaving && (
              <span className="flex items-center gap-1">
                <span className="loading loading-spinner loading-xs" />
                Saving...
              </span>
            )}
            {!isSaving && lastSaved && (
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {PRD_SECTION_KEYS.map((sectionKey) => (
          <PrdSection
            key={sectionKey}
            sectionKey={sectionKey as PrdSectionKey}
            section={prdContent[sectionKey]}
            isHighlighted={highlightedSections.has(sectionKey)}
          />
        ))}
      </div>
    </div>
  );
}
