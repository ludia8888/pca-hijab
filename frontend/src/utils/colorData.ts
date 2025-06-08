// Seasonal color recommendations (based on professional personal color guidelines)
export const SEASON_COLORS = {
  spring: {
    bestColors: [
      { name: '코랄', hex: '#FF7F50', description: 'Warm and vibrant impression' },
      { name: '살구색', hex: '#FBCEB1', description: 'Soft and radiant atmosphere' },
      { name: '밝은 금색', hex: '#FFD700', description: 'Bright and energetic feeling' },
      { name: '밝은 청록색', hex: '#48D1CC', description: 'Fresh and clear image' },
    ],
    worstColors: [
      { name: '검정색', hex: '#000000', description: 'Looks too heavy' },
      { name: '차가운 회색', hex: '#708090', description: 'Makes skin look dull' },
      { name: '차가운 파란색', hex: '#4682B4', description: 'Makes face look pale' },
      { name: '차가운 분홍색', hex: '#DDA0DD', description: 'Looks unnatural' },
    ],
  },
  summer: {
    bestColors: [
      { name: '연한 파란색', hex: '#ADD8E6', description: 'Cool and refreshing impression' },
      { name: '라벤더', hex: '#E6E6FA', description: 'Elegant and soft feeling' },
      { name: '장미빛 분홍색', hex: '#FFC0CB', description: 'Feminine and romantic atmosphere' },
      { name: '연한 회색', hex: '#D3D3D3', description: 'Sophisticated and calm image' },
    ],
    worstColors: [
      { name: '검정색', hex: '#000000', description: 'Looks too strong' },
      { name: '밝은 주황색', hex: '#FF8C00', description: 'Makes skin look yellowish' },
      { name: '밝은 노란색', hex: '#FFFF00', description: 'Makes face look dull' },
      { name: '따뜻한 갈색', hex: '#8B4513', description: 'Looks disharmonious' },
    ],
  },
  autumn: {
    bestColors: [
      { name: '올리브 그린', hex: '#708238', description: 'Natural and deep impression' },
      { name: '머스타드 옐로우', hex: '#FFDB58', description: 'Warm and soft feeling' },
      { name: '테라코타', hex: '#E2725B', description: 'Healthy and vibrant atmosphere' },
      { name: '초콜릿 브라운', hex: '#7B3F00', description: 'Luxurious and stable image' },
    ],
    worstColors: [
      { name: '검정색', hex: '#000000', description: 'Looks too heavy' },
      { name: '차가운 파란색', hex: '#4169E1', description: 'Makes skin look dull' },
      { name: '차가운 회색', hex: '#778899', description: 'Looks lifeless' },
      { name: '밝은 분홍색', hex: '#FFB6C1', description: 'Looks unnatural' },
    ],
  },
  winter: {
    bestColors: [
      { name: '진한 파란색', hex: '#000080', description: 'Deep and vivid impression' },
      { name: '진한 자주색', hex: '#800080', description: 'Luxurious and mysterious feeling' },
      { name: '차가운 빨간색', hex: '#DC143C', description: 'Intense and sophisticated atmosphere' },
      { name: '차가운 회색', hex: '#696969', description: 'Chic and modern image' },
    ],
    worstColors: [
      { name: '따뜻한 갈색', hex: '#964B00', description: 'Makes face look dull' },
      { name: '따뜻한 주황색', hex: '#FF8C00', description: 'Makes skin look yellowish' },
      { name: '따뜻한 노란색', hex: '#FFD700', description: 'Looks disharmonious' },
      { name: '따뜻한 녹색', hex: '#8FBC8F', description: 'Looks lifeless' },
    ],
  },
} as const;

export type SeasonType = keyof typeof SEASON_COLORS;