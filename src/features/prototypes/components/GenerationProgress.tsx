import { useEffect, useState } from 'react';

interface Stage {
  id: string;
  label: string;
  duration: number; // estimated duration in ms
}

const GENERATION_STAGES: Stage[] = [
  { id: 'analyzing', label: 'Analyzing PRD', duration: 3000 },
  { id: 'generating', label: 'Generating code', duration: 20000 },
  { id: 'building', label: 'Building preview', duration: 7000 },
];

interface GenerationProgressProps {
  status: 'generating' | 'ready' | 'failed';
  startTime?: number;
}

export function GenerationProgress({
  status,
  startTime,
}: GenerationProgressProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (status !== 'generating' || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);

      // Progress through stages based on elapsed time
      let accumulatedTime = 0;
      for (let i = 0; i < GENERATION_STAGES.length; i++) {
        accumulatedTime += GENERATION_STAGES[i].duration;
        if (elapsed < accumulatedTime) {
          setCurrentStageIndex(i);
          break;
        }
      }

      // If we exceed total estimated time, stay on last stage
      if (elapsed >= 30000) {
        setCurrentStageIndex(GENERATION_STAGES.length - 1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [status, startTime]);

  if (status !== 'generating') return null;

  const currentStage = GENERATION_STAGES[currentStageIndex];
  const totalDuration = 30000; // 30 seconds max
  const progressPercent = Math.min((elapsedTime / totalDuration) * 100, 100);

  return (
    <div className="card bg-base-200 shadow-xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{currentStage.label}...</h3>
          <p className="text-sm text-base-content/70">
            {Math.round(elapsedTime / 1000)}s elapsed • ~30s total
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stage indicators */}
      <div className="flex justify-between mt-4">
        {GENERATION_STAGES.map((stage, index) => (
          <div
            key={stage.id}
            className={`flex-1 text-center text-xs ${
              index <= currentStageIndex
                ? 'text-primary font-semibold'
                : 'text-base-content/50'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                index < currentStageIndex
                  ? 'bg-primary'
                  : index === currentStageIndex
                  ? 'bg-primary animate-pulse'
                  : 'bg-base-300'
              }`}
            />
            {stage.label}
          </div>
        ))}
      </div>
    </div>
  );
}
