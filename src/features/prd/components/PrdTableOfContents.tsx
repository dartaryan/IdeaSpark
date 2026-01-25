import { useState, useEffect } from 'react';
import { ListBulletIcon } from '@heroicons/react/24/outline';
import { PRD_SECTIONS } from '../constants/prdSections';
import type { PrdContent } from '../types';

interface PrdTableOfContentsProps {
  prdContent: PrdContent;
}

export function PrdTableOfContents({ prdContent }: PrdTableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Track scroll position to highlight current section
  useEffect(() => {
    const handleScroll = () => {
      const sections = PRD_SECTIONS.map((s) => ({
        key: s.key,
        element: document.getElementById(`section-${s.key}`),
      }));

      for (const section of sections.reverse()) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section.key);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (sectionKey: string) => {
    const element = document.getElementById(`section-${sectionKey}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter to only show sections with content
  const sectionsWithContent = PRD_SECTIONS.filter(
    (section) => prdContent[section.key]?.content
  );

  return (
    <nav className="hidden lg:block sticky top-24 print:hidden">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 text-sm font-semibold mb-3"
      >
        <ListBulletIcon className="w-5 h-5" />
        Contents
      </button>

      {!isCollapsed && (
        <ul className="space-y-1 border-l-2 border-base-300 pl-4">
          {sectionsWithContent.map((section) => (
            <li key={section.key}>
              <button
                onClick={() => handleSectionClick(section.key)}
                className={`text-sm text-left w-full py-1 px-2 rounded transition-colors ${
                  activeSection === section.key
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                }`}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
