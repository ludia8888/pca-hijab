// Query keys factory
export const queryKeys = {
  all: ['pca-hijab'] as const,
  health: () => [...queryKeys.all, 'health'] as const,
  analysis: (imageId: string) => [...queryKeys.all, 'analysis', imageId] as const,
  recommendations: (sessionId: string) => [...queryKeys.all, 'recommendations', sessionId] as const,
};