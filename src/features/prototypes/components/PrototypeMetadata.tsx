import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Lightbulb } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PrototypeMetadataProps {
  prototypeId: string;
  version: number;
  createdAt: string;
  ideaId: string;
  ideaTitle?: string;
  prdId: string;
}

export function PrototypeMetadata({
  prototypeId,
  version,
  createdAt,
  ideaId,
  ideaTitle,
  prdId,
}: PrototypeMetadataProps) {
  const navigate = useNavigate();

  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div className="bg-base-100 border-b border-base-300 p-4" role="banner">
      <div className="container mx-auto max-w-7xl">
        {/* Breadcrumb Navigation - AC 5 */}
        <div className="flex items-center gap-2 text-sm text-base-content/70 mb-4">
          <button
            onClick={() => navigate('/ideas')}
            className="hover:text-primary flex items-center gap-1"
          >
            <Lightbulb className="w-4 h-4" />
            My Ideas
          </button>
          <span>/</span>
          <button
            onClick={() => navigate(`/ideas/${ideaId}`)}
            className="hover:text-primary"
          >
            {ideaTitle || 'Idea'}
          </button>
          <span>/</span>
          <span className="text-base-content">Prototype</span>
        </div>

        {/* Prototype Info - AC 5 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {ideaTitle ? `${ideaTitle} - Prototype` : 'Prototype Preview'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-base-content/70">
              <span>Version {version}</span>
              <span>•</span>
              <span>Created {formattedDate}</span>
            </div>
          </div>

          {/* Action Buttons - AC 5 */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/ideas/${ideaId}`)}
              className="btn btn-ghost btn-sm gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              View Idea
            </button>
            <button
              onClick={() => navigate(`/prd/view/${prdId}`)}
              className="btn btn-ghost btn-sm gap-2"
            >
              <FileText className="w-4 h-4" />
              View PRD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
