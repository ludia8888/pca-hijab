// 계절별 추천 컬러 데이터 (전문 퍼스널 컬러 가이드 기반)
export const SEASON_COLORS = {
  spring: {
    bestColors: [
      { name: '코랄', hex: '#FF7F50', description: '따뜻하고 생기 있는 인상' },
      { name: '살구색', hex: '#FBCEB1', description: '부드럽고 화사한 분위기' },
      { name: '밝은 금색', hex: '#FFD700', description: '빛나고 활기찬 느낌' },
      { name: '밝은 청록색', hex: '#48D1CC', description: '상쾌하고 맑은 이미지' },
    ],
    worstColors: [
      { name: '검정색', hex: '#000000', description: '너무 무거워 보임' },
      { name: '차가운 회색', hex: '#708090', description: '피부가 칙칙해 보임' },
      { name: '차가운 파란색', hex: '#4682B4', description: '얼굴이 창백해 보임' },
      { name: '차가운 분홍색', hex: '#DDA0DD', description: '부자연스러워 보임' },
    ],
  },
  summer: {
    bestColors: [
      { name: '연한 파란색', hex: '#ADD8E6', description: '시원하고 청량한 인상' },
      { name: '라벤더', hex: '#E6E6FA', description: '우아하고 부드러운 느낌' },
      { name: '장미빛 분홍색', hex: '#FFC0CB', description: '여성스럽고 로맨틱한 분위기' },
      { name: '연한 회색', hex: '#D3D3D3', description: '세련되고 차분한 이미지' },
    ],
    worstColors: [
      { name: '검정색', hex: '#000000', description: '너무 강해 보임' },
      { name: '밝은 주황색', hex: '#FF8C00', description: '피부가 노랗게 보임' },
      { name: '밝은 노란색', hex: '#FFFF00', description: '얼굴이 칙칙해 보임' },
      { name: '따뜻한 갈색', hex: '#8B4513', description: '부조화스러워 보임' },
    ],
  },
  autumn: {
    bestColors: [
      { name: '올리브 그린', hex: '#708238', description: '자연스럽고 깊이 있는 인상' },
      { name: '머스타드 옐로우', hex: '#FFDB58', description: '따뜻하고 부드러운 느낌' },
      { name: '테라코타', hex: '#E2725B', description: '건강하고 생기 있는 분위기' },
      { name: '초콜릿 브라운', hex: '#7B3F00', description: '고급스럽고 안정적인 이미지' },
    ],
    worstColors: [
      { name: '검정색', hex: '#000000', description: '너무 무거워 보임' },
      { name: '차가운 파란색', hex: '#4169E1', description: '피부가 칙칙해 보임' },
      { name: '차가운 회색', hex: '#778899', description: '생기가 없어 보임' },
      { name: '밝은 분홍색', hex: '#FFB6C1', description: '부자연스러워 보임' },
    ],
  },
  winter: {
    bestColors: [
      { name: '진한 파란색', hex: '#000080', description: '깊고 선명한 인상' },
      { name: '진한 자주색', hex: '#800080', description: '고급스럽고 신비로운 느낌' },
      { name: '차가운 빨간색', hex: '#DC143C', description: '강렬하고 세련된 분위기' },
      { name: '차가운 회색', hex: '#696969', description: '시크하고 모던한 이미지' },
    ],
    worstColors: [
      { name: '따뜻한 갈색', hex: '#964B00', description: '얼굴이 칙칙해 보임' },
      { name: '따뜻한 주황색', hex: '#FF8C00', description: '피부가 노랗게 보임' },
      { name: '따뜻한 노란색', hex: '#FFD700', description: '부조화스러워 보임' },
      { name: '따뜻한 녹색', hex: '#8FBC8F', description: '생기가 없어 보임' },
    ],
  },
} as const;

export type SeasonType = keyof typeof SEASON_COLORS;