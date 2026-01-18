// Ideas feature types
// Re-export database types for feature-level access
export type {
  Idea,
  IdeaStatus,
  IdeaInsert,
  IdeaUpdate,
  CreateIdeaInput,
  UpdateIdeaInput,
} from '../../types/database';

import type { Idea } from '../../types/database';

// Feature-specific types
export interface IdeaWithUser extends Idea {
  user?: {
    id: string;
    email: string;
  };
}
