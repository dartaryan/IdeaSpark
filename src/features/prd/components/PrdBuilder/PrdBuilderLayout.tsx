import type { ReactNode } from 'react';

interface PrdBuilderLayoutProps {
  chatPanel: ReactNode;
  previewPanel: ReactNode;
}

export function PrdBuilderLayout({ chatPanel, previewPanel }: PrdBuilderLayoutProps) {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-4">
      {/* Chat Panel - Left side on desktop, top on mobile */}
      <div className="lg:w-1/2 h-1/2 lg:h-full flex flex-col border border-base-200 rounded-box bg-base-100">
        {chatPanel}
      </div>

      {/* Preview Panel - Right side on desktop, bottom on mobile */}
      <div className="lg:w-1/2 h-1/2 lg:h-full flex flex-col border border-base-200 rounded-box bg-base-100 overflow-hidden">
        {previewPanel}
      </div>
    </div>
  );
}
