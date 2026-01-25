import { RocketLaunchIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

interface GeneratePrototypeButtonProps {
  prdId: string;
  ideaId: string;
  disabled?: boolean;
}

export function GeneratePrototypeButton({
  prdId,
  ideaId,
  disabled = false,
}: GeneratePrototypeButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to prototype generation page with PRD context
    navigate(`/prototype/generate/${ideaId}`, {
      state: { prdId },
    });
  };

  return (
    <button
      className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl transition-shadow"
      onClick={handleClick}
      disabled={disabled}
    >
      <RocketLaunchIcon className="w-6 h-6" />
      Generate Prototype
    </button>
  );
}
