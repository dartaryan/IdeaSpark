// src/features/prototypes/services/apiConfigService.ts

import { supabase } from '../../../lib/supabase';
import type { ServiceResponse } from '../../../types/service';
import type {
  ApiConfig,
  ApiConfigRow,
  CreateApiConfigInput,
  UpdateApiConfigInput,
} from '../types';
import { mapApiConfigRow } from '../types';

export const apiConfigService = {
  /**
   * Get all API configs for a prototype.
   *
   * @param prototypeId - The prototype to fetch configs for
   * @returns ServiceResponse with array of ApiConfig
   */
  async getApiConfigs(prototypeId: string): Promise<ServiceResponse<ApiConfig[]>> {
    try {
      const { data, error } = await supabase
        .from('prototype_api_configs')
        .select('*')
        .eq('prototype_id', prototypeId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Get API configs error:', error);
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return {
        data: (data as ApiConfigRow[]).map(mapApiConfigRow),
        error: null,
      };
    } catch (error) {
      console.error('Get API configs error:', error);
      return { data: null, error: { message: 'Failed to get API configs', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Create a new API config for a prototype.
   *
   * @param input - The API config data to create
   * @returns ServiceResponse with created ApiConfig
   */
  async createApiConfig(input: CreateApiConfigInput): Promise<ServiceResponse<ApiConfig>> {
    try {
      const { data, error } = await supabase
        .from('prototype_api_configs')
        .insert({
          prototype_id: input.prototypeId,
          name: input.name,
          url: input.url,
          method: input.method,
          headers: input.headers ?? {},
          is_mock: input.isMock ?? false,
          mock_response: input.mockResponse ?? null,
          mock_status_code: input.mockStatusCode ?? 200,
          mock_delay_ms: input.mockDelayMs ?? 0,
          is_ai: input.isAi ?? false,
          ai_model: input.aiModel ?? 'gemini-2.5-flash',
          ai_system_prompt: input.aiSystemPrompt ?? null,
          ai_max_tokens: input.aiMaxTokens ?? 1024,
          ai_temperature: input.aiTemperature ?? 0.7,
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          return {
            data: null,
            error: { message: 'An endpoint with this name already exists for this prototype', code: 'DUPLICATE_ERROR' },
          };
        }
        console.error('Create API config error:', error);
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapApiConfigRow(data as ApiConfigRow), error: null };
    } catch (error) {
      console.error('Create API config error:', error);
      return { data: null, error: { message: 'Failed to create API config', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Update an existing API config.
   *
   * @param id - The API config ID to update
   * @param input - The fields to update
   * @returns ServiceResponse with updated ApiConfig
   */
  async updateApiConfig(id: string, input: UpdateApiConfigInput): Promise<ServiceResponse<ApiConfig>> {
    try {
      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.url !== undefined) updates.url = input.url;
      if (input.method !== undefined) updates.method = input.method;
      if (input.headers !== undefined) updates.headers = input.headers;
      if (input.isMock !== undefined) updates.is_mock = input.isMock;
      if (input.mockResponse !== undefined) updates.mock_response = input.mockResponse;
      if (input.mockStatusCode !== undefined) updates.mock_status_code = input.mockStatusCode;
      if (input.mockDelayMs !== undefined) updates.mock_delay_ms = input.mockDelayMs;
      if (input.isAi !== undefined) updates.is_ai = input.isAi;
      if (input.aiModel !== undefined) updates.ai_model = input.aiModel;
      if (input.aiSystemPrompt !== undefined) updates.ai_system_prompt = input.aiSystemPrompt;
      if (input.aiMaxTokens !== undefined) updates.ai_max_tokens = input.aiMaxTokens;
      if (input.aiTemperature !== undefined) updates.ai_temperature = input.aiTemperature;

      const { data, error } = await supabase
        .from('prototype_api_configs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return {
            data: null,
            error: { message: 'An endpoint with this name already exists for this prototype', code: 'DUPLICATE_ERROR' },
          };
        }
        if (error.code === 'PGRST116') {
          return { data: null, error: { message: 'API config not found', code: 'NOT_FOUND' } };
        }
        console.error('Update API config error:', error);
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: mapApiConfigRow(data as ApiConfigRow), error: null };
    } catch (error) {
      console.error('Update API config error:', error);
      return { data: null, error: { message: 'Failed to update API config', code: 'UNKNOWN_ERROR' } };
    }
  },

  /**
   * Delete an API config.
   *
   * @param id - The API config ID to delete
   * @returns ServiceResponse with void data
   */
  async deleteApiConfig(id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('prototype_api_configs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete API config error:', error);
        return { data: null, error: { message: error.message, code: 'DB_ERROR' } };
      }

      return { data: undefined, error: null };
    } catch (error) {
      console.error('Delete API config error:', error);
      return { data: null, error: { message: 'Failed to delete API config', code: 'UNKNOWN_ERROR' } };
    }
  },
};
