import { ArrowLeftIcon, CheckBadgeIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { GeneratePrototypeButton } from './GeneratePrototypeButton';
import type { PrdDocument, IdeaSummary } from '../types';

interface PrdViewerHeaderProps {
  prd: PrdDocument;
  idea: IdeaSummary;
  hasPrototype?: boolean;
}

export function PrdViewerHeader({ prd, idea, hasPrototype = false }: PrdViewerHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-base-100 border-b border-base-300 print:hidden">
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Back + Title */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate(`/ideas/${idea.id}`)}
              className="btn btn-ghost btn-sm btn-circle mt-1"
              aria-label="Back to idea"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DocumentTextIcon className="w-6 h-6 text-primary" />
                <h1 className="text-xl md:text-2xl font-bold">
                  {idea.title || 'Product Requirements Document'}
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-base-content/60">
                <span className="badge badge-success gap-1">
                  <CheckBadgeIcon className="w-4 h-4" />
                  Complete
                </span>
                {prd.completed_at && (
                  <span>
                    Completed {format(new Date(prd.completed_at), 'MMMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="btn btn-outline btn-sm"
            >
              Print / Export
            </button>
            {!hasPrototype && (
              <GeneratePrototypeButton prdId={prd.id} ideaId={idea.id} />
            )}
            {hasPrototype && (
              <button
                onClick={() => navigate(`/prototype/${idea.id}`)}
                className="btn btn-primary"
              >
                View Prototype
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
