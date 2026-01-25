// src/features/prototypes/index.ts

// Types
export * from './types';

// Schemas
export * from './schemas/prototypeSchemas';

// Services
export { prototypeService } from './services/prototypeService';

// Hooks
export { 
  prototypeKeys,
  usePrototype, 
  usePrototypesByPrd, 
  useLatestPrototype,
  useVersionHistory 
} from './hooks/usePrototype';
export { usePrototypes } from './hooks/usePrototypes';
export { 
  useCreatePrototype, 
  useCreateVersion, 
  useUpdatePrototype,
  useUpdatePrototypeStatus 
} from './hooks/useCreatePrototype';
export { useGeneratePrototype } from './hooks/useGeneratePrototype';

// Components
export { GeneratePrototypeButton, GenerationProgress } from './components';
