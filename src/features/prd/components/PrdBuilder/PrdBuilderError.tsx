import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../routes/routeConstants';

interface PrdBuilderErrorProps {
  type: 'not-found' | 'not-approved' | 'error';
  message?: string;
  ideaId?: string;
}

export function PrdBuilderError({ type, message, ideaId }: PrdBuilderErrorProps) {
  const navigate = useNavigate();

  const errorConfig = {
    'not-found': {
      title: 'Idea Not Found',
      description: "The idea you're looking for doesn't exist or you don't have permission to view it.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      primaryAction: {
        label: 'Go to My Ideas',
        onClick: () => navigate(ROUTES.IDEAS),
      },
    },
    'not-approved': {
      title: 'Idea Not Approved Yet',
      description: 'You can only build a PRD for ideas that have been approved. Please wait for your idea to be reviewed.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      primaryAction: {
        label: 'View Idea Details',
        onClick: () => ideaId && navigate(ROUTES.IDEA_DETAIL.replace(':id', ideaId)),
      },
    },
    'error': {
      title: 'Something Went Wrong',
      description: message || 'An error occurred while loading the PRD builder. Please try again.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      primaryAction: {
        label: 'Go to My Ideas',
        onClick: () => navigate(ROUTES.IDEAS),
      },
    },
  };

  const config = errorConfig[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
      {config.icon}

      <h2 className="text-xl font-semibold text-base-content mt-6 mb-2">
        {config.title}
      </h2>
      <p className="text-base-content/60 mb-6">
        {config.description}
      </p>

      <button
        className="btn btn-primary"
        onClick={config.primaryAction.onClick}
      >
        {config.primaryAction.label}
      </button>
    </div>
  );
}
