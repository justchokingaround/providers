import { mockEmbeds, mockSources } from '@/__test__/providerTests';
import { getProviders } from '@/providers/get';
import { vi, describe, it, expect, afterEach } from 'vitest';

const mocks = await vi.hoisted(async () => (await import('@/__test__/providerTests')).makeProviderMocks());
vi.mock('@/providers/all', () => mocks);

describe('getProviders()', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return providers', () => {
    mocks.gatherAllEmbeds.mockReturnValue([mockEmbeds.embedD]);
    mocks.gatherAllSources.mockReturnValue([mockSources.sourceA, mockSources.sourceB]);
    expect(getProviders()).toEqual({
      sources: [mockSources.sourceA, mockSources.sourceB],
      embeds: [mockEmbeds.embedD],
    });
  });

  it('should filter out disabled providers', () => {
    mocks.gatherAllEmbeds.mockReturnValue([mockEmbeds.embedD, mockEmbeds.embedEDisabled]);
    mocks.gatherAllSources.mockReturnValue([mockSources.sourceA, mockSources.sourceCDisabled, mockSources.sourceB]);
    expect(getProviders()).toEqual({
      sources: [mockSources.sourceA, mockSources.sourceB],
      embeds: [mockEmbeds.embedD],
    });
  });

  it('should throw on duplicate ids in sources', () => {
    mocks.gatherAllEmbeds.mockReturnValue([]);
    mocks.gatherAllSources.mockReturnValue([mockSources.sourceAHigherRank, mockSources.sourceA, mockSources.sourceB]);
    expect(() => getProviders()).toThrowError();
  });

  it('should throw on duplicate ids in embeds', () => {
    mocks.gatherAllEmbeds.mockReturnValue([mockEmbeds.embedD, mockEmbeds.embedDHigherRank, mockEmbeds.embedA]);
    mocks.gatherAllSources.mockReturnValue([]);
    expect(() => getProviders()).toThrowError();
  });

  it('should throw on duplicate ids between sources and embeds', () => {
    mocks.gatherAllEmbeds.mockReturnValue([mockEmbeds.embedD, mockEmbeds.embedA]);
    mocks.gatherAllSources.mockReturnValue([mockSources.sourceA, mockSources.sourceB]);
    expect(() => getProviders()).toThrowError();
  });

  it('should throw on duplicate rank between sources and embeds', () => {
    mocks.gatherAllEmbeds.mockReturnValue([mockEmbeds.embedD, mockEmbeds.embedA]);
    mocks.gatherAllSources.mockReturnValue([mockSources.sourceA, mockSources.sourceB]);
    expect(() => getProviders()).toThrowError();
  });

  it('should not throw with same rank between sources and embeds', () => {
    mocks.gatherAllEmbeds.mockReturnValue([mockEmbeds.embedD, mockEmbeds.embedHSameRankAsSourceA]);
    mocks.gatherAllSources.mockReturnValue([mockSources.sourceA, mockSources.sourceB]);
    expect(getProviders()).toEqual({
      sources: [mockSources.sourceA, mockSources.sourceB],
      embeds: [mockEmbeds.embedD, mockEmbeds.embedHSameRankAsSourceA],
    });
  });
});
