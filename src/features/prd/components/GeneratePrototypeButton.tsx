import { RocketLaunchIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { useGeneratePrototype } from '../../prototypes/hooks/useGeneratePrototype';

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
  
  const { generate, isGenerating, error } = useGeneratePrototype({
    onSuccess: (prototypeId) => {
      navigate(`/prototypes/${prototypeId}`);
    },
  });

  const handleClick = async () => {
    if (!prdId || !ideaId) {
      return;
    }
    await generate(prdId, ideaId);
  };

  return (
    <button
      type="button"
      className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl transition-shadow"
      onClick={handleClick}
      disabled={disabled || isGenerating}
    >
      {isGenerating ? (
        <>
          <span className="loading loading-spinner loading-sm"></span>
          Generating...
        </>
      ) : (
        <>
          <RocketLaunchIcon className="w-6 h-6" />
          Generate Prototype
        </>
      )}
    </button>
  );
}
