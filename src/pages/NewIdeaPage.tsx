import { IdeaWizard } from '../features/ideas';

/**
 * New Idea page - idea submission wizard
 * Provides a multi-step wizard for users to submit new ideas
 */
export function NewIdeaPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Submit a New Idea</h1>
      <IdeaWizard />
    </div>
  );
}
