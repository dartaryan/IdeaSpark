import { SectionStatusBadge } from './SectionStatusBadge';
import { PRD_SECTION_LABELS } from '../constants';
import type { PrdSectionKey, PrdSection as PrdSectionType } from '../types';

interface PrdSectionProps {
  sectionKey: PrdSectionKey;
  section: PrdSectionType | undefined;
  isHighlighted: boolean;
}

export function PrdSection({ sectionKey, section, isHighlighted }: PrdSectionProps) {
  const label = PRD_SECTION_LABELS[sectionKey];
  const status = section?.status ?? 'empty';
  const content = section?.content ?? '';

  return (
    <div 
      className={`
        card bg-base-200 transition-all duration-300
        ${isHighlighted ? 'ring-2 ring-primary ring-offset-2 animate-pulse' : ''}
      `}
    >
      <div className="card-body p-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="card-title text-base">{label}</h3>
          <SectionStatusBadge status={status} />
        </div>

        {/* Section Content */}
        {content ? (
          <div className="prose prose-sm max-w-none text-base-content/80">
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
        ) : (
          <p className="text-base-content/40 italic text-sm">
            This section will be populated as you discuss with the AI assistant...
          </p>
        )}
      </div>
    </div>
  );
}
