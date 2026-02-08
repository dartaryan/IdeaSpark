// src/features/prototypes/components/MockTemplateSelector.tsx

import { ChevronDown } from 'lucide-react';
import { mockTemplates } from '../utils/mockTemplates';

export interface MockTemplateSelectorProps {
  /** Called when a template is selected with the template JSON content */
  onSelect: (content: string) => void;
  /** Whether the editor currently has content (triggers confirm on replace) */
  hasContent: boolean;
}

/**
 * Dropdown menu for selecting from common mock response templates.
 * Confirms before replacing existing editor content.
 */
export function MockTemplateSelector({ onSelect, hasContent }: MockTemplateSelectorProps) {
  const handleSelect = (content: string) => {
    if (hasContent) {
      const confirmed = window.confirm('Replace current content with this template?');
      if (!confirmed) return;
    }
    onSelect(content);

    // Close DaisyUI dropdown by blurring the active element
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  };

  return (
    <div className="dropdown dropdown-end" data-testid="mock-template-selector">
      <label
        tabIndex={0}
        className="btn btn-ghost btn-xs gap-1"
        data-testid="mock-template-trigger"
      >
        Templates
        <ChevronDown className="w-3 h-3" />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-64"
      >
        {mockTemplates.map((template) => (
          <li key={template.id}>
            <button
              type="button"
              className="flex flex-col items-start py-2"
              onClick={() => handleSelect(template.content)}
              data-testid={`mock-template-${template.id}`}
            >
              <span className="font-medium text-xs">{template.name}</span>
              <span className="text-xs opacity-60">{template.description}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
