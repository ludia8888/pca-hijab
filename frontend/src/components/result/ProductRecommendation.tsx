import React from 'react';
import { Star } from 'lucide-react';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  rating?: number;
  reviews?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const displayRating = 4.3 + Math.random() * 0.6;
  const displayReviews = Math.floor(100 + Math.random() * 900);
  
  return (
    <a 
      href={product.shopeeLink} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square relative bg-white p-4">
        <div 
          className="w-full h-full rounded-lg"
          style={{ backgroundColor: getColorForProduct(product.name) }}
        />
      </div>
      <div className="p-2">
        <h4 className="font-medium text-xs text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h4>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="text-xs font-medium text-gray-900">
            {displayRating.toFixed(1)}
          </span>
          <span className="text-[10px] text-gray-500">
            ({displayReviews})
          </span>
        </div>
      </div>
    </a>
  );
};

// Helper function to get color for each product
const getColorForProduct = (productName: string): string => {
  const colorMap: Record<string, string> = {
    'Moonshot - Melting Mood Lip - Alluring': '#FF7F50',
    'KARADIUM - Butter Coral': '#FFA07A',
    'molette - Apple Cheeky': '#FFB6C1',
    'Moonshot - Shy': '#FFB6C1',
    'KARADIUM - Cozy Pink': '#FFC0CB',
    'molette - Dewy Berry': '#DA70D6',
    'Moonshot - Honest': '#A52A2A',
    'KARADIUM - Pecan Sand': '#D2691E',
    'molette - Coco Choco': '#8B4513',
    'Moonshot - Oort Pink': '#FF1493',
    'KARADIUM - Rosy Berry': '#DC143C',
    'molette - Tingle Cherry': '#8B0000'
  };
  return colorMap[productName] || '#FF6B6B';
};

interface ProductRecommendationProps {
  personalColorEn: string;
}

// Mock data fallback for when API has no products
const getMockProducts = (personalColorEn: string): Product[] => {
  const colorMapping: Record<string, string> = {
    'spring': 'spring_warm',
    'autumn': 'autumn_warm', 
    'summer': 'summer_cool',
    'winter': 'winter_cool'
  };
  
  const lowerColor = personalColorEn.toLowerCase();
  let personalColorType = colorMapping[lowerColor];
  
  if (!personalColorType) {
    const seasonMatch = lowerColor.match(/(spring|summer|autumn|winter)/);
    if (seasonMatch) {
      personalColorType = colorMapping[seasonMatch[1]];
    }
  }
  
  const mockData: Record<string, Product[]> = {
    'spring_warm': [
      {
        id: '1',
        name: 'Moonshot - Melting Mood Lip - Alluring',
        category: 'lip',
        price: 15000,
        thumbnailUrl: '/uploads/products/moonshot-alluring.svg',
        detailImageUrls: [],
        personalColors: ['spring_warm'],
        description: 'A warm coral lip shade tailored for Spring Warm tones.',
        shopeeLink: 'https://en.moonshot-beauty.com/product/melting-mood-lip-and-cheeksheer-glow/131/?cate_no=1&display_group=2',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2', 
        name: 'KARADIUM - Butter Coral',
        category: 'lip',
        price: 12000,
        thumbnailUrl: '/uploads/products/karadium-butter-coral.svg',
        detailImageUrls: [],
        personalColors: ['spring_warm'],
        description: 'A buttery coral finish that flatters Spring Warm complexions.',
        shopeeLink: 'https://smartstore.naver.com/karadium/products/9255588817',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'molette - Apple Cheeky', 
        category: 'lip',
        price: 18000,
        thumbnailUrl: '/uploads/products/molette-apple-cheeky.svg',
        detailImageUrls: [],
        personalColors: ['spring_warm'],
        description: 'A crisp apple-inspired hue for bright Spring looks.',
        shopeeLink: 'http://smartstore.naver.com/molette_official/products/11582095583',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    'autumn_warm': [
      {
        id: '4',
        name: 'Moonshot - Honest',
        category: 'lip', 
        price: 15000,
        thumbnailUrl: '/uploads/products/moonshot-honest.svg',
        detailImageUrls: [],
        personalColors: ['autumn_warm'],
        description: 'A refined brown lip color for Autumn Warm tones.',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'KARADIUM - Pecan Sand',
        category: 'lip',
        price: 12000,
        thumbnailUrl: '/uploads/products/karadium-pecan-sand.svg',
        detailImageUrls: [],
        personalColors: ['autumn_warm'],
        description: 'Pecan sand tones that suit rich autumn palettes.',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '6',
        name: 'molette - Coco Choco',
        category: 'lip',
        price: 18000,
        thumbnailUrl: '/uploads/products/molette-coco-choco.svg',
        detailImageUrls: [],
        personalColors: ['autumn_warm'],
        description: 'Sweet cocoa-brown pigment for cozy Autumn looks.',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    'summer_cool': [
      {
        id: '7',
        name: 'Moonshot - Shy',
        category: 'lip',
        price: 15000,
        thumbnailUrl: '/uploads/products/moonshot-shy.svg',
        detailImageUrls: [],
        personalColors: ['summer_cool'],
        description: 'A soft pink tint that enhances Summer Cool undertones.',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '8',
        name: 'KARADIUM - Cozy Pink',
        category: 'lip',
        price: 12000,
        thumbnailUrl: '/uploads/products/karadium-cozy-pink.svg',
        detailImageUrls: [],
        personalColors: ['summer_cool'],
        description: 'Comforting pink shades for calm, cool-toned styles.',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '9',
        name: 'molette - Dewy Berry',
        category: 'lip',
        price: 18000,
        thumbnailUrl: '/uploads/products/molette-dewy-berry.svg',
        detailImageUrls: [],
        personalColors: ['summer_cool'],
        description: 'A dewy berry finish that keeps Summer Cool lips vibrant.',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    'winter_cool': [
      {
        id: '10',
        name: 'Moonshot - Oort Pink',
        category: 'lip',
        price: 15000,
        thumbnailUrl: '/uploads/products/moonshot-oort-pink.svg',
        detailImageUrls: [],
        personalColors: ['winter_cool'],
        description: 'A cosmic pink tint that pops on Winter Cool skin.',
        shopeeLink: 'https://en.moonshot-beauty.com/product/jelly-moon-glow-tint/158/?cate_no=56&display_group=1',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '11',
        name: 'KARADIUM - Rosy Berry',
        category: 'lip',
        price: 12000,
        thumbnailUrl: '/uploads/products/karadium-rosy-berry.svg',
        detailImageUrls: [],
        personalColors: ['winter_cool'],
        description: 'Rosy berry pigment designed for Winter Cool tones.',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '12',
        name: 'molette - Tingle Cherry',
        category: 'lip',
        price: 18000,
        thumbnailUrl: '/uploads/products/molette-tingle-cherry.svg',
        detailImageUrls: [],
        personalColors: ['winter_cool'],
        description: 'A lively cherry-red finish for striking Winter looks.',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  };
  
  return mockData[personalColorType] || mockData['spring_warm'];
};

export const ProductRecommendation: React.FC<ProductRecommendationProps> = ({ personalColorEn }) => {
  // Use mock data directly until API output is finalized
  const mockProducts = getMockProducts(personalColorEn);
  const [hijabProducts] = React.useState<Product[]>(mockProducts);
  const [isLoading] = React.useState(false);
  
  // Show section even if no products (with empty state message)
  
  // Get season name in Korean
  const getSeasonName = (personalColor: string): string => {
    const seasonMap: Record<string, string> = {
      spring: 'Spring Warm',
      summer: 'Summer Cool',
      autumn: 'Autumn Warm',
      winter: 'Winter Cool'
    };
    
    const lowerColor = personalColor.toLowerCase();
    for (const [key, value] of Object.entries(seasonMap)) {
      if (lowerColor.includes(key)) {
        return value;
      }
    }
    return 'you';
  };

  const seasonName = getSeasonName(personalColorEn);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden p-3 mb-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1">
        <span className="text-base">💄</span> Recommended lip products for {seasonName}
      </h3>
        
      <div className="grid grid-cols-3 gap-3">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendation;
