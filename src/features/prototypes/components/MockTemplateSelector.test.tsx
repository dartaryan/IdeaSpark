// src/features/prototypes/components/MockTemplateSelector.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockTemplateSelector } from './MockTemplateSelector';
import { mockTemplates } from '../utils/mockTemplates';

describe('MockTemplateSelector', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the template dropdown trigger', () => {
    render(<MockTemplateSelector onSelect={onSelect} hasContent={false} />);

    expect(screen.getByTestId('mock-template-trigger')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
  });

  it('should render all template options', () => {
    render(<MockTemplateSelector onSelect={onSelect} hasContent={false} />);

    for (const template of mockTemplates) {
      expect(screen.getByTestId(`mock-template-${template.id}`)).toBeInTheDocument();
      expect(screen.getByText(template.name)).toBeInTheDocument();
      expect(screen.getByText(template.description)).toBeInTheDocument();
    }
  });

  it('should call onSelect with template content when clicked and no existing content', () => {
    render(<MockTemplateSelector onSelect={onSelect} hasContent={false} />);

    const firstTemplate = mockTemplates[0];
    fireEvent.click(screen.getByTestId(`mock-template-${firstTemplate.id}`));

    expect(onSelect).toHaveBeenCalledWith(firstTemplate.content);
  });

  it('should show confirm dialog before replacing existing content', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<MockTemplateSelector onSelect={onSelect} hasContent={true} />);

    const firstTemplate = mockTemplates[0];
    fireEvent.click(screen.getByTestId(`mock-template-${firstTemplate.id}`));

    expect(confirmSpy).toHaveBeenCalledWith('Replace current content with this template?');
    expect(onSelect).toHaveBeenCalledWith(firstTemplate.content);

    confirmSpy.mockRestore();
  });

  it('should not call onSelect when confirm is cancelled', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<MockTemplateSelector onSelect={onSelect} hasContent={true} />);

    const firstTemplate = mockTemplates[0];
    fireEvent.click(screen.getByTestId(`mock-template-${firstTemplate.id}`));

    expect(confirmSpy).toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('should not show confirm dialog when editor has no content', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');

    render(<MockTemplateSelector onSelect={onSelect} hasContent={false} />);

    const firstTemplate = mockTemplates[0];
    fireEvent.click(screen.getByTestId(`mock-template-${firstTemplate.id}`));

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith(firstTemplate.content);

    confirmSpy.mockRestore();
  });

  it('should pass valid JSON for each template', () => {
    render(<MockTemplateSelector onSelect={onSelect} hasContent={false} />);

    for (const template of mockTemplates) {
      onSelect.mockClear();
      fireEvent.click(screen.getByTestId(`mock-template-${template.id}`));
      expect(onSelect).toHaveBeenCalledTimes(1);

      const passedContent = onSelect.mock.calls[0][0];
      expect(() => JSON.parse(passedContent)).not.toThrow();
    }
  });
});
