import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prdMessageService } from './prdMessageService';

// Mock the supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

// Import the mocked module
import { supabase } from '../../../lib/supabase';

const mockMessage = {
  id: 'msg-123',
  prd_id: 'prd-123',
  role: 'user' as const,
  content: 'What should I include in the problem statement?',
  created_at: '2026-01-22T10:00:00Z',
};

const mockAssistantMessage = {
  id: 'msg-124',
  prd_id: 'prd-123',
  role: 'assistant' as const,
  content: 'The problem statement should clearly define...',
  created_at: '2026-01-22T10:01:00Z',
};

describe('prdMessageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMessagesByPrdId', () => {
    it('should return messages ordered by creation time', async () => {
      const mockMessages = [mockMessage, mockAssistantMessage];

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockMessages, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdMessageService.getMessagesByPrdId('prd-123');

      expect(supabase.from).toHaveBeenCalledWith('prd_messages');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.eq).toHaveBeenCalledWith('prd_id', 'prd-123');
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(result.data).toEqual(mockMessages);
      expect(result.error).toBeNull();
    });

    it('should return empty array when no messages exist', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdMessageService.getMessagesByPrdId('prd-123');

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should return error on database failure', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdMessageService.getMessagesByPrdId('prd-123');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('DB_ERROR');
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await prdMessageService.getMessagesByPrdId('prd-123');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('getLatestMessages', () => {
    it('should return latest N messages in chronological order', async () => {
      const mockMessages = [mockAssistantMessage, mockMessage]; // Descending from DB
      const expectedMessages = [mockMessage, mockAssistantMessage]; // Reversed to chronological

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockMessages, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdMessageService.getLatestMessages('prd-123', 20);

      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockFrom.limit).toHaveBeenCalledWith(20);
      expect(result.data).toEqual(expectedMessages); // Should be reversed
      expect(result.error).toBeNull();
    });

    it('should default to 20 messages if limit not specified', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      await prdMessageService.getLatestMessages('prd-123');

      expect(mockFrom.limit).toHaveBeenCalledWith(20);
    });

    it('should respect custom limit parameter', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      await prdMessageService.getLatestMessages('prd-123', 5);

      expect(mockFrom.limit).toHaveBeenCalledWith(5);
    });

    it('should return empty array when no messages exist', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdMessageService.getLatestMessages('prd-123');

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });

  describe('addMessage', () => {
    it('should add user message successfully', async () => {
      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockMessage, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdMessageService.addMessage(
        'prd-123',
        'user',
        'What should I include in the problem statement?'
      );

      expect(supabase.from).toHaveBeenCalledWith('prd_messages');
      expect(mockFrom.insert).toHaveBeenCalledWith({
        prd_id: 'prd-123',
        role: 'user',
        content: 'What should I include in the problem statement?',
      });
      expect(result.data).toEqual(mockMessage);
      expect(result.error).toBeNull();
    });

    it('should add assistant message successfully', async () => {
      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAssistantMessage, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdMessageService.addMessage(
        'prd-123',
        'assistant',
        'The problem statement should clearly define...'
      );

      expect(mockFrom.insert).toHaveBeenCalledWith({
        prd_id: 'prd-123',
        role: 'assistant',
        content: 'The problem statement should clearly define...',
      });
      expect(result.data).toEqual(mockAssistantMessage);
      expect(result.error).toBeNull();
    });

    it('should return error on database failure', async () => {
      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdMessageService.addMessage('prd-123', 'user', 'Test');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('DB_ERROR');
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await prdMessageService.addMessage('prd-123', 'user', 'Test');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('deleteMessagesByPrdId', () => {
    it('should delete all messages for a PRD', async () => {
      const mockFrom = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdMessageService.deleteMessagesByPrdId('prd-123');

      expect(supabase.from).toHaveBeenCalledWith('prd_messages');
      expect(mockFrom.delete).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('prd_id', 'prd-123');
      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should return error on delete failure', async () => {
      const mockFrom = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Delete failed' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdMessageService.deleteMessagesByPrdId('prd-123');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('DB_ERROR');
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await prdMessageService.deleteMessagesByPrdId('prd-123');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('message ordering', () => {
    it('should maintain chronological order in getMessagesByPrdId', async () => {
      const messages = [
        { ...mockMessage, created_at: '2026-01-22T10:00:00Z' },
        { ...mockAssistantMessage, created_at: '2026-01-22T10:01:00Z' },
        { ...mockMessage, id: 'msg-125', created_at: '2026-01-22T10:02:00Z' },
      ];

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: messages, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdMessageService.getMessagesByPrdId('prd-123');

      expect(result.data?.[0].created_at).toBe('2026-01-22T10:00:00Z');
      expect(result.data?.[2].created_at).toBe('2026-01-22T10:02:00Z');
    });

    it('should reverse order in getLatestMessages', async () => {
      // DB returns descending (newest first)
      const messagesFromDB = [
        { ...mockMessage, id: 'msg-125', created_at: '2026-01-22T10:02:00Z' },
        { ...mockAssistantMessage, created_at: '2026-01-22T10:01:00Z' },
        { ...mockMessage, created_at: '2026-01-22T10:00:00Z' },
      ];

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: messagesFromDB, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as never);

      const result = await prdMessageService.getLatestMessages('prd-123', 3);

      // Should be reversed to chronological
      expect(result.data?.[0].created_at).toBe('2026-01-22T10:00:00Z');
      expect(result.data?.[2].created_at).toBe('2026-01-22T10:02:00Z');
    });
  });
});
