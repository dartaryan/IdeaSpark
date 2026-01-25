import { SectionStatusBadge } from './SectionStatusBadge';
import { getSectionByKey } from '../constants/prdSections';
import type { PrdSection } from '../../../types/database';
import type { PrdSectionKey } from '../constants/prdSections';
import { getSectionStatus } from '../utils/validatePrdCompletion';

interface PrdSectionCardProps {
  sectionKey: PrdSectionKey;
  section: PrdSection | undefined;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export function PrdSectionCard({
  sectionKey,
  section,
  isHighlighted = false,
  onClick,
}: PrdSectionCardProps) {
  const definition = getSectionByKey(sectionKey);
  if (!definition) return null;

  const status = getSectionStatus(section);
  const hasContent = section?.content && section.content.trim().length > 0;

  return (
    <div
      className={`card bg-base-100 border cursor-pointer transition-all hover:shadow-md ${
        isHighlighted ? 'ring-2 ring-primary border-primary animate-pulse-subtle' : 'border-base-300'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-sm font-semibold">{definition.title}</h3>
          <SectionStatusBadge status={status} size="sm" />
        </div>

        {/* Content or Placeholder */}
        {hasContent ? (
          <div className="text-sm text-base-content/70 line-clamp-3 mt-2">
            {section!.content}
          </div>
        ) : (
          <div className="text-sm text-base-content/40 italic mt-2">
            {definition.placeholder}
          </div>
        )}

        {/* Click hint */}
        <div className="text-xs text-base-content/40 mt-2">
          Click to focus AI on this section
        </div>
      </div>
    </div>
  );
}
