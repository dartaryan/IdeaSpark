import type { Idea } from '../types';

interface IdeaDetailContentProps {
  idea: Idea;
}

/**
 * Displays the full content of an idea with original and enhanced versions
 * Structured into three sections: Problem, Solution, Impact
 * Shows AI-enhanced content when available with visual distinction
 */
export function IdeaDetailContent({ idea }: IdeaDetailContentProps) {
  const hasEnhancedProblem = !!idea.enhanced_problem;
  const hasEnhancedSolution = !!idea.enhanced_solution;
  const hasEnhancedImpact = !!idea.enhanced_impact;

  return (
    <div className="space-y-6">
      {/* Problem Section */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-primary">1.</span> Problem Statement
        </h2>
        <div className="bg-base-200 rounded-box p-4">
          <p className="text-base-content whitespace-pre-wrap">
            {idea.problem}
          </p>
        </div>
        {hasEnhancedProblem && (
          <div className="mt-3">
            <div className="badge badge-primary badge-sm mb-2">AI Enhanced</div>
            <div className="bg-primary/10 rounded-box p-4 border border-primary/20">
              <p className="text-base-content whitespace-pre-wrap">
                {idea.enhanced_problem}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Solution Section */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-primary">2.</span> Proposed Solution
        </h2>
        <div className="bg-base-200 rounded-box p-4">
          <p className="text-base-content whitespace-pre-wrap">
            {idea.solution}
          </p>
        </div>
        {hasEnhancedSolution && (
          <div className="mt-3">
            <div className="badge badge-primary badge-sm mb-2">AI Enhanced</div>
            <div className="bg-primary/10 rounded-box p-4 border border-primary/20">
              <p className="text-base-content whitespace-pre-wrap">
                {idea.enhanced_solution}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Impact Section */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-primary">3.</span> Expected Impact
        </h2>
        <div className="bg-base-200 rounded-box p-4">
          <p className="text-base-content whitespace-pre-wrap">
            {idea.impact}
          </p>
        </div>
        {hasEnhancedImpact && (
          <div className="mt-3">
            <div className="badge badge-primary badge-sm mb-2">AI Enhanced</div>
            <div className="bg-primary/10 rounded-box p-4 border border-primary/20">
              <p className="text-base-content whitespace-pre-wrap">
                {idea.enhanced_impact}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
