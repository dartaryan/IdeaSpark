import { PrdSection } from '../PrdSection';
import { PRD_SECTION_KEYS } from '../../types';
import type { PrdDocument } from '../../types';

interface PrdPreviewPanelProps {
  prd: PrdDocument | null;
}

export function PrdPreviewPanel({ prd }: PrdPreviewPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-base-200 flex items-center justify-between">
        <h2 className="font-semibold">PRD Preview</h2>
        <div className="badge badge-outline">
          {prd?.status === 'complete' ? 'Complete' : 'Draft'}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {PRD_SECTION_KEYS.map((sectionKey) => {
          const section = prd?.content?.[sectionKey];
          return (
            <PrdSection
              key={sectionKey}
              sectionKey={sectionKey}
              section={section}
              isHighlighted={false}
            />
          );
        })}
      </div>
    </div>
  );
}
