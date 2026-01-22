// Services
export { prdService } from './services/prdService';
export { prdMessageService } from './services/prdMessageService';
export { prdChatService } from './services/prdChatService';

// Hooks
export { usePrdBuilder, usePrdPageData, prdBuilderQueryKeys, prdQueryKeys, usePrdChat, type UsePrdChatReturn, type UsePrdBuilderReturn } from './hooks';

// Components
export * from './components';

// Types - explicitly export to avoid naming conflict with PrdSection component
export type {
  PrdDocument,
  PrdMessage,
  PrdContent,
  PrdSection as PrdSectionType,
  PrdStatus,
  PrdSectionStatus,
  MessageRole,
  CreatePrdInput,
  UpdatePrdInput,
  CreateMessageInput,
  PrdWithIdea,
  PrdSectionUpdate,
} from './types';
export { PRD_SECTION_KEYS, PRD_SECTION_LABELS } from './types';
export type { PrdSectionKey } from './types';
