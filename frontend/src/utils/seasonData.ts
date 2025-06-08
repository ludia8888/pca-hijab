// Season-specific data for comprehensive personal color results
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeasonData {
  keywords: string[];
  makeupColors: {
    foundation: string;
    lips: string[];
    eyeShadow: string[];
    blush: string[];
  };
  perfumeNotes: {
    family: string;
    notes: string[];
    recommendations: string[];
  };
  accessories: {
    metal: 'gold' | 'silver' | 'rose-gold';
    style: string;
  };
  atmosphere: string;
  celebrities: string[];
}

export const SEASON_DATA: Record<SeasonType, SeasonData> = {
  spring: {
    keywords: ['Fresh', 'Bright', 'Lively', 'Warm', 'Youthful'],
    makeupColors: {
      foundation: 'Warm beige with yellow undertones',
      lips: ['Coral Pink', 'Peach', 'Warm Pink', 'Orange Red', 'Salmon'],
      eyeShadow: ['Warm Browns', 'Peach', 'Gold', 'Coral', 'Warm Beige'],
      blush: ['Peach', 'Coral', 'Warm Pink']
    },
    perfumeNotes: {
      family: 'Fresh Floral',
      notes: ['Citrus', 'Green Tea', 'Peony', 'Fresh Fruits'],
      recommendations: [
        'Jo Malone - Peony & Blush Suede',
        'Chloé - Eau de Parfum',
        'Marc Jacobs - Daisy'
      ]
    },
    accessories: {
      metal: 'gold',
      style: 'Delicate and bright'
    },
    atmosphere: 'Like a spring garden in full bloom',
    celebrities: ['IU', 'Suzy', 'Park Bo Young']
  },
  summer: {
    keywords: ['Soft', 'Elegant', 'Cool', 'Gentle', 'Sophisticated'],
    makeupColors: {
      foundation: 'Cool beige with pink undertones',
      lips: ['Rose Pink', 'Mauve', 'Berry', 'Soft Red', 'Dusty Pink'],
      eyeShadow: ['Cool Browns', 'Mauve', 'Silver', 'Soft Pink', 'Gray'],
      blush: ['Rose', 'Cool Pink', 'Lavender']
    },
    perfumeNotes: {
      family: 'Powdery Floral',
      notes: ['Rose', 'Lavender', 'Powder', 'Soft Musk'],
      recommendations: [
        'Dior - Miss Dior Blooming Bouquet',
        'Lancôme - La Vie Est Belle',
        'Chanel - Chance Eau Tendre'
      ]
    },
    accessories: {
      metal: 'silver',
      style: 'Elegant and refined'
    },
    atmosphere: 'Like a misty morning by the lake',
    celebrities: ['Kim Tae Hee', 'Song Hye Kyo', 'Han Ga In']
  },
  autumn: {
    keywords: ['Rich', 'Warm', 'Natural', 'Mature', 'Earthy'],
    makeupColors: {
      foundation: 'Warm beige with golden undertones',
      lips: ['Brick Red', 'Terracotta', 'Brown Red', 'Warm Orange', 'Nude Brown'],
      eyeShadow: ['Bronze', 'Copper', 'Warm Brown', 'Gold', 'Khaki'],
      blush: ['Terracotta', 'Warm Brown', 'Orange']
    },
    perfumeNotes: {
      family: 'Woody Oriental',
      notes: ['Sandalwood', 'Vanilla', 'Amber', 'Spices'],
      recommendations: [
        'Tom Ford - Black Orchid',
        'YSL - Black Opium',
        'Guerlain - Shalimar'
      ]
    },
    accessories: {
      metal: 'gold',
      style: 'Bold and natural'
    },
    atmosphere: 'Like autumn leaves in golden sunlight',
    celebrities: ['Lee Hyori', 'Gong Hyo Jin', 'Kim Hee Sun']
  },
  winter: {
    keywords: ['Bold', 'Cool', 'Dramatic', 'Modern', 'Chic'],
    makeupColors: {
      foundation: 'Cool beige with blue undertones',
      lips: ['True Red', 'Burgundy', 'Plum', 'Hot Pink', 'Wine'],
      eyeShadow: ['Black', 'Navy', 'Silver', 'Deep Purple', 'Icy Blue'],
      blush: ['Cool Pink', 'Plum', 'Berry']
    },
    perfumeNotes: {
      family: 'Fresh Woody',
      notes: ['Bergamot', 'Cedar', 'White Musk', 'Cool Florals'],
      recommendations: [
        'Chanel - No. 5',
        'Dior - J\'adore',
        'Giorgio Armani - Si'
      ]
    },
    accessories: {
      metal: 'silver',
      style: 'Sharp and modern'
    },
    atmosphere: 'Like fresh snow under starlight',
    celebrities: ['Kim Yuna', 'Lee Young Ae', 'Jun Ji Hyun']
  }
};

// Gradient colors for each season
export const SEASON_GRADIENTS: Record<SeasonType, string[]> = {
  spring: ['#FFE5E5', '#FFE5B4'], // Soft pink to peach
  summer: ['#E6E6FA', '#FFC0CB'], // Lavender to pink
  autumn: ['#FFE4C4', '#FFDAB9'], // Bisque to peach puff
  winter: ['#F0F8FF', '#E6E6FA']  // Alice blue to lavender
};