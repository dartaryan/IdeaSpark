/**
 * React Query key factory for PRD queries
 * Follows hierarchical key structure for efficient cache invalidation
 */
export const prdQueryKeys = {
  all: ['prds'] as const,
  byIdea: (ideaId: string) => [...prdQueryKeys.all, 'byIdea', ideaId] as const,
  details: () => [...prdQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...prdQueryKeys.details(), id] as const,
};
