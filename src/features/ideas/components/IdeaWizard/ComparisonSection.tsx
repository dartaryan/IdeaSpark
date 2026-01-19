interface ComparisonSectionProps {
  label: string;
  original: string;
  enhanced: string;
  selectedVersion: 'original' | 'enhanced';
  onSelectVersion: (version: 'original' | 'enhanced') => void;
}

/**
 * ComparisonSection - Side-by-side comparison of original vs AI-enhanced text
 *
 * Used in StepReview to display AI enhancement results.
 * Allows user to select which version to use for each section.
 */
export function ComparisonSection({
  label,
  original,
  enhanced,
  selectedVersion,
  onSelectVersion,
}: ComparisonSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">{label}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original */}
        <div
          className={`rounded-box p-4 cursor-pointer transition-all ${
            selectedVersion === 'original'
              ? 'bg-primary/10 ring-2 ring-primary'
              : 'bg-base-200 hover:bg-base-300'
          }`}
          onClick={() => onSelectVersion('original')}
          data-testid="original-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              name={`${label}-version`}
              className="radio radio-primary radio-sm"
              checked={selectedVersion === 'original'}
              onChange={() => onSelectVersion('original')}
              data-testid="original-radio"
            />
            <span className="font-medium text-sm">Original</span>
          </div>
          <p className="text-base-content/80 text-sm whitespace-pre-wrap">{original}</p>
        </div>

        {/* Enhanced */}
        <div
          className={`rounded-box p-4 cursor-pointer transition-all ${
            selectedVersion === 'enhanced'
              ? 'bg-success/10 ring-2 ring-success'
              : 'bg-base-200 hover:bg-base-300'
          }`}
          onClick={() => onSelectVersion('enhanced')}
          data-testid="enhanced-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              name={`${label}-version`}
              className="radio radio-success radio-sm"
              checked={selectedVersion === 'enhanced'}
              onChange={() => onSelectVersion('enhanced')}
              data-testid="enhanced-radio"
            />
            <span className="font-medium text-sm text-success">AI Enhanced ✨</span>
          </div>
          <p className="text-base-content/80 text-sm whitespace-pre-wrap">{enhanced}</p>
        </div>
      </div>
    </div>
  );
}
