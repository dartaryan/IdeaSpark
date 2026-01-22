import { describe, it, expect } from 'vitest';
import { prdQueryKeys } from './queryKeys';

describe('prdQueryKeys', () => {
  it('generates correct all key', () => {
    expect(prdQueryKeys.all).toEqual(['prds']);
  });

  it('generates correct byIdea key', () => {
    const result = prdQueryKeys.byIdea('idea-123');
    expect(result).toEqual(['prds', 'byIdea', 'idea-123']);
  });

  it('generates correct details key', () => {
    expect(prdQueryKeys.details()).toEqual(['prds', 'detail']);
  });

  it('generates correct detail key with id', () => {
    const result = prdQueryKeys.detail('prd-456');
    expect(result).toEqual(['prds', 'detail', 'prd-456']);
  });

  it('byIdea generates different keys for different ideas', () => {
    const key1 = prdQueryKeys.byIdea('idea-1');
    const key2 = prdQueryKeys.byIdea('idea-2');
    expect(key1).not.toEqual(key2);
  });

  it('detail generates different keys for different PRDs', () => {
    const key1 = prdQueryKeys.detail('prd-1');
    const key2 = prdQueryKeys.detail('prd-2');
    expect(key1).not.toEqual(key2);
  });
});
