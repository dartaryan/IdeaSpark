import {
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CpuChipIcon,
  ShieldExclamationIcon,
  CalendarDaysIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import type { PrdSectionKey, PrdSection } from '../types';
import { getSectionByKey } from '../constants/prdSections';

const sectionIcons: Record<PrdSectionKey, typeof ExclamationTriangleIcon> = {
  problemStatement: ExclamationTriangleIcon,
  goalsAndMetrics: ChartBarIcon,
  userStories: UserGroupIcon,
  requirements: ClipboardDocumentListIcon,
  technicalConsiderations: CpuChipIcon,
  risks: ShieldExclamationIcon,
  timeline: CalendarDaysIcon,
};

interface PrdSectionViewerProps {
  sectionKey: PrdSectionKey;
  section: PrdSection | undefined;
}

export function PrdSectionViewer({ sectionKey, section }: PrdSectionViewerProps) {
  const definition = getSectionByKey(sectionKey);
  if (!definition) return null;

  const Icon = sectionIcons[sectionKey] || QuestionMarkCircleIcon;
  const hasContent = section?.content && section.content.trim().length > 0;

  if (!hasContent) {
    return null; // Don't render empty sections in view mode
  }

  return (
    <section
      id={`section-${sectionKey}`}
      className="mb-8 scroll-mt-24 print:break-inside-avoid"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-base-300">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold">{definition.title}</h2>
      </div>

      {/* Section Content */}
      <div className="prose prose-sm max-w-none">
        {/* Render content with basic formatting */}
        {section!.content.split('\n').map((paragraph, idx) => {
          if (!paragraph.trim()) return null;

          // Check if it's a list item
          if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('• ')) {
            return (
              <li key={idx} className="ml-4">
                {paragraph.replace(/^[-•]\s*/, '')}
              </li>
            );
          }

          // Check if it's a numbered list item
          if (/^\d+\.\s/.test(paragraph.trim())) {
            return (
              <li key={idx} className="ml-4 list-decimal">
                {paragraph.replace(/^\d+\.\s*/, '')}
              </li>
            );
          }

          return <p key={idx}>{paragraph}</p>;
        })}
      </div>
    </section>
  );
}
