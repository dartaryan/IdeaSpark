import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { IdeaWizardFormData } from '../../schemas/ideaSchemas';
import { MIN_PROBLEM_CHARS, MIN_SOLUTION_CHARS, MIN_IMPACT_CHARS } from '../../schemas/ideaSchemas';
import { useEnhanceIdea } from '../../hooks/useEnhanceIdea';
import { useSubmitIdea } from '../../hooks/useSubmitIdea';
import { ComparisonSection } from './ComparisonSection';

interface StepReviewProps {
  onBack: () => void;
  onClearWizard?: () => void;
}

type SectionField = 'problem' | 'solution' | 'impact';

interface EnhancedContent {
  problem: string;
  solution: string;
  impact: string;
}

interface ReviewCardProps {
  label: string;
  content: string;
  fieldName: SectionField;
  minChars: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * ReviewCard - Internal sub-component for review cards (non-comparison mode)
 */
function ReviewCard({
  label,
  content,
  fieldName,
  minChars,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: ReviewCardProps) {
  const { watch, setValue } = useFormContext<IdeaWizardFormData>();
  const [editValue, setEditValue] = useState(content);
  const currentValue = watch(fieldName);
  const charCount = editValue?.length || 0;
  const isValid = charCount >= minChars;

  const handleStartEdit = () => {
    setEditValue(currentValue);
    onEdit();
  };

  const handleSave = () => {
    setValue(fieldName, editValue);
    onSave();
  };

  const handleCancel = () => {
    setEditValue(currentValue);
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="bg-base-200 rounded-box p-4" data-testid={`review-card-${fieldName}`}>
        <h3 className="font-semibold mb-2">{label}</h3>
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={`textarea textarea-bordered w-full min-h-[120px] ${
            !isValid ? 'textarea-warning' : ''
          }`}
          data-testid={`edit-textarea-${fieldName}`}
        />
        <div className="flex justify-between items-center mt-2">
          <span
            className={`text-sm ${!isValid ? 'text-warning' : 'text-success'}`}
            data-testid="edit-char-counter"
          >
            {charCount} / {minChars} characters minimum
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-sm btn-ghost"
              data-testid="cancel-edit-button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-sm btn-primary"
              disabled={!isValid}
              data-testid="save-edit-button"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 rounded-box p-4" data-testid={`review-card-${fieldName}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{label}</h3>
        <button
          type="button"
          onClick={handleStartEdit}
          className="btn btn-ghost btn-xs"
          aria-label={`Edit ${label}`}
          data-testid={`edit-button-${fieldName}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      </div>
      <p className="text-base-content whitespace-pre-wrap">{content}</p>
    </div>
  );
}

/**
 * StepReview - Step 4 of the Idea Wizard
 *
 * Allows users to review their complete idea, edit any section,
 * optionally enhance with AI assistance, and submit to the database.
 */
export function StepReview({ onBack, onClearWizard }: StepReviewProps) {
  const { watch, setValue } = useFormContext<IdeaWizardFormData>();
  const [editingSection, setEditingSection] = useState<SectionField | null>(null);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState<EnhancedContent | null>(null);
  const [originalContent, setOriginalContent] = useState<EnhancedContent | null>(null);
  const [selectedVersions, setSelectedVersions] = useState({
    problem: 'original' as 'original' | 'enhanced',
    solution: 'original' as 'original' | 'enhanced',
    impact: 'original' as 'original' | 'enhanced',
  });

  const problemValue = watch('problem') || '';
  const solutionValue = watch('solution') || '';
  const impactValue = watch('impact') || '';

  const { mutate: enhanceIdea, isPending: isEnhancing, error, isError } = useEnhanceIdea();
  const { submitIdea, isSubmitting } = useSubmitIdea({ onSuccess: onClearWizard });

  const handleEditSection = (section: SectionField) => {
    setEditingSection(section);
  };

  const handleSaveEdit = () => {
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const handleEnhance = () => {
    // Store original content before enhancement
    setOriginalContent({
      problem: problemValue,
      solution: solutionValue,
      impact: impactValue,
    });

    enhanceIdea(
      { problem: problemValue, solution: solutionValue, impact: impactValue },
      {
        onSuccess: (data) => {
          setEnhancedContent(data);
          setIsEnhanced(true);
          // Reset selections to original
          setSelectedVersions({
            problem: 'original',
            solution: 'original',
            impact: 'original',
          });
        },
      }
    );
  };

  const handleSelectVersion = (
    field: keyof typeof selectedVersions,
    version: 'original' | 'enhanced'
  ) => {
    setSelectedVersions((prev) => ({ ...prev, [field]: version }));

    // Update form value based on selection
    if (version === 'enhanced' && enhancedContent) {
      setValue(field, enhancedContent[field]);
    } else if (version === 'original' && originalContent) {
      setValue(field, originalContent[field]);
    }
  };

  const handleRetry = () => {
    handleEnhance();
  };

  /**
   * Handle idea submission - maps wizard state to submission format
   */
  const handleSubmit = () => {
    // Determine if user is using any enhanced content
    const useEnhanced = isEnhanced && (
      selectedVersions.problem === 'enhanced' ||
      selectedVersions.solution === 'enhanced' ||
      selectedVersions.impact === 'enhanced'
    );

    submitIdea({
      problem: problemValue,
      solution: solutionValue,
      impact: impactValue,
      enhancedProblem: enhancedContent?.problem,
      enhancedSolution: enhancedContent?.solution,
      enhancedImpact: enhancedContent?.impact,
      useEnhanced,
    });
  };

  // Combined loading state for disabling navigation
  const isLoading = isEnhancing || isSubmitting;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Your Idea</h2>
        <p className="text-base-content/70">
          Review your idea below. You can edit any section or enhance all sections with AI
          assistance.
        </p>
      </div>

      {/* Enhance with AI button - only show if not enhanced and not loading */}
      {!isEnhanced && !isEnhancing && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleEnhance}
            disabled={isEnhancing}
            className="btn btn-primary btn-lg gap-2"
            data-testid="enhance-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
            </svg>
            Enhance with AI
          </button>
        </div>
      )}

      {/* Loading state */}
      {isEnhancing && (
        <div className="flex flex-col items-center justify-center py-8" data-testid="loading-state">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70 font-medium">Enhancing your idea...</p>
        </div>
      )}

      {/* Error state */}
      {isError && !isEnhancing && (
        <div className="alert alert-error" data-testid="error-alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">Enhancement failed</h3>
            <p className="text-sm">
              {error?.message || 'AI enhancement is temporarily unavailable. You can proceed with your original text or try again.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="btn btn-sm"
            data-testid="retry-button"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Success alert - show after enhancement */}
      {isEnhanced && enhancedContent && !isEnhancing && (
        <div className="alert alert-success" data-testid="success-alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>AI enhancement complete! Select your preferred version for each section below.</span>
        </div>
      )}

      {/* Comparison view (after enhancement) */}
      {isEnhanced && enhancedContent && originalContent && !isEnhancing && (
        <div className="space-y-6" data-testid="comparison-view">
          <ComparisonSection
            label="Problem Statement"
            original={originalContent.problem}
            enhanced={enhancedContent.problem}
            selectedVersion={selectedVersions.problem}
            onSelectVersion={(v) => handleSelectVersion('problem', v)}
          />
          <ComparisonSection
            label="Proposed Solution"
            original={originalContent.solution}
            enhanced={enhancedContent.solution}
            selectedVersion={selectedVersions.solution}
            onSelectVersion={(v) => handleSelectVersion('solution', v)}
          />
          <ComparisonSection
            label="Expected Impact"
            original={originalContent.impact}
            enhanced={enhancedContent.impact}
            selectedVersion={selectedVersions.impact}
            onSelectVersion={(v) => handleSelectVersion('impact', v)}
          />
        </div>
      )}

      {/* Plain review cards (before enhancement or during loading) */}
      {!isEnhanced && !isEnhancing && (
        <div className="space-y-4">
          <ReviewCard
            label="Problem Statement"
            content={problemValue}
            fieldName="problem"
            minChars={MIN_PROBLEM_CHARS}
            isEditing={editingSection === 'problem'}
            onEdit={() => handleEditSection('problem')}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
          <ReviewCard
            label="Proposed Solution"
            content={solutionValue}
            fieldName="solution"
            minChars={MIN_SOLUTION_CHARS}
            isEditing={editingSection === 'solution'}
            onEdit={() => handleEditSection('solution')}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
          <ReviewCard
            label="Expected Impact"
            content={impactValue}
            fieldName="impact"
            minChars={MIN_IMPACT_CHARS}
            isEditing={editingSection === 'impact'}
            onEdit={() => handleEditSection('impact')}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-ghost"
          disabled={isLoading}
          data-testid="back-button"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={isLoading}
          data-testid="submit-button"
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Submitting...
            </>
          ) : (
            'Submit Idea'
          )}
        </button>
      </div>
    </div>
  );
}
