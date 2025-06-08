// Seasonal color recommendations (based on professional personal color guidelines)
export const SEASON_COLORS = {
  spring: {
    bestColors: [
      { name: 'Coral', hex: '#FF7F50', description: 'Warm and vibrant impression' },
      { name: 'Apricot', hex: '#FBCEB1', description: 'Soft and radiant atmosphere' },
      { name: 'Bright Gold', hex: '#FFD700', description: 'Bright and energetic feeling' },
      { name: 'Bright Turquoise', hex: '#48D1CC', description: 'Fresh and clear image' },
    ],
    worstColors: [
      { name: 'Black', hex: '#000000', description: 'Looks too heavy' },
      { name: 'Cool Gray', hex: '#708090', description: 'Makes skin look dull' },
      { name: 'Cool Blue', hex: '#4682B4', description: 'Makes face look pale' },
      { name: 'Cool Pink', hex: '#DDA0DD', description: 'Looks unnatural' },
    ],
  },
  summer: {
    bestColors: [
      { name: 'Light Blue', hex: '#ADD8E6', description: 'Cool and refreshing impression' },
      { name: 'Lavender', hex: '#E6E6FA', description: 'Elegant and soft feeling' },
      { name: 'Rose Pink', hex: '#FFC0CB', description: 'Feminine and romantic atmosphere' },
      { name: 'Light Gray', hex: '#D3D3D3', description: 'Sophisticated and calm image' },
    ],
    worstColors: [
      { name: 'Black', hex: '#000000', description: 'Looks too strong' },
      { name: 'Bright Orange', hex: '#FF8C00', description: 'Makes skin look yellowish' },
      { name: 'Bright Yellow', hex: '#FFFF00', description: 'Makes face look dull' },
      { name: 'Warm Brown', hex: '#8B4513', description: 'Looks disharmonious' },
    ],
  },
  autumn: {
    bestColors: [
      { name: 'Olive Green', hex: '#708238', description: 'Natural and deep impression' },
      { name: 'Mustard Yellow', hex: '#FFDB58', description: 'Warm and soft feeling' },
      { name: 'Terracotta', hex: '#E2725B', description: 'Healthy and vibrant atmosphere' },
      { name: 'Chocolate Brown', hex: '#7B3F00', description: 'Luxurious and stable image' },
    ],
    worstColors: [
      { name: 'Black', hex: '#000000', description: 'Looks too heavy' },
      { name: 'Cool Blue', hex: '#4169E1', description: 'Makes skin look dull' },
      { name: 'Cool Gray', hex: '#778899', description: 'Looks lifeless' },
      { name: 'Light Pink', hex: '#FFB6C1', description: 'Looks unnatural' },
    ],
  },
  winter: {
    bestColors: [
      { name: 'Navy Blue', hex: '#000080', description: 'Deep and vivid impression' },
      { name: 'Deep Purple', hex: '#800080', description: 'Luxurious and mysterious feeling' },
      { name: 'Cool Red', hex: '#DC143C', description: 'Intense and sophisticated atmosphere' },
      { name: 'Cool Gray', hex: '#696969', description: 'Chic and modern image' },
    ],
    worstColors: [
      { name: 'Warm Brown', hex: '#964B00', description: 'Makes face look dull' },
      { name: 'Warm Orange', hex: '#FF8C00', description: 'Makes skin look yellowish' },
      { name: 'Warm Yellow', hex: '#FFD700', description: 'Looks disharmonious' },
      { name: 'Warm Green', hex: '#8FBC8F', description: 'Looks lifeless' },
    ],
  },
} as const;

export type SeasonType = keyof typeof SEASON_COLORS;