import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { getImageUrl } from '@/utils/imageUrl';

interface ProductCardProps {
  product: Product;
  rating?: number;
  reviews?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, rating = 4.5, reviews = 808 }) => {
  const navigate = useNavigate();
  
  // Generate random rating between 4.3 and 4.9 if not provided
  const displayRating = rating || (4.3 + Math.random() * 0.6);
  const displayReviews = reviews || Math.floor(100 + Math.random() * 900);
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="aspect-square relative">
        <img
          src={getImageUrl(product.thumbnailUrl)}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h4>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm font-medium text-gray-900">
            {displayRating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">
            ({displayReviews})
          </span>
        </div>
      </div>
    </div>
  );
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
        name: 'Soft Coral Hijab',
        category: 'hijab',
        price: 25000,
        thumbnailUrl: '/uploads/hijabs/spring-coral-hijab.svg',
        detailImageUrls: [],
        personalColors: ['spring_warm'],
        description: '봄 웜톤에 어울리는 코랄색 히잡',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2', 
        name: 'Peach Blossom Hijab',
        category: 'hijab',
        price: 28000,
        thumbnailUrl: '/uploads/hijabs/spring-peach-hijab.svg',
        detailImageUrls: [],
        personalColors: ['spring_warm'],
        description: '복숭아꽃처럼 화사한 봄 웜톤 히잡',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Light Camel Hijab', 
        category: 'hijab',
        price: 22000,
        thumbnailUrl: '/uploads/hijabs/spring-camel-hijab.svg',
        detailImageUrls: [],
        personalColors: ['spring_warm'],
        description: '라이트 카멜색의 데일리 히잡',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    'autumn_warm': [
      {
        id: '4',
        name: 'Burnt Sienna Hijab',
        category: 'hijab', 
        price: 30000,
        thumbnailUrl: '/uploads/hijabs/autumn-sienna-hijab.svg',
        detailImageUrls: [],
        personalColors: ['autumn_warm'],
        description: '가을 웜톤을 위한 번트 시에나 히잡',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Chocolate Brown Hijab',
        category: 'hijab',
        price: 26000,
        thumbnailUrl: '/uploads/hijabs/autumn-brown-hijab.svg',
        detailImageUrls: [],
        personalColors: ['autumn_warm'],
        description: '초콜릿 브라운의 가을 웜톤 히잡',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '6',
        name: 'Olive Khaki Hijab',
        category: 'hijab',
        price: 24000,
        thumbnailUrl: '/uploads/hijabs/autumn-olive-hijab.svg',
        detailImageUrls: [],
        personalColors: ['autumn_warm'],
        description: '올리브 카키색의 가을 히잡',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    'summer_cool': [
      {
        id: '7',
        name: 'Rose Quartz Hijab',
        category: 'hijab',
        price: 27000,
        thumbnailUrl: '/uploads/hijabs/summer-rose-hijab.svg',
        detailImageUrls: [],
        personalColors: ['summer_cool'],
        description: '로즈쿼츠색의 여름 쿨톤 히잡',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '8',
        name: 'Lavender Mist Hijab',
        category: 'hijab',
        price: 29000,
        thumbnailUrl: '/uploads/hijabs/summer-lavender-hijab.svg',
        detailImageUrls: [],
        personalColors: ['summer_cool'],
        description: '라벤더 미스트 여름 쿨톤 히잡',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '9',
        name: 'Powder Blue Hijab',
        category: 'hijab',
        price: 25000,
        thumbnailUrl: '/uploads/hijabs/summer-blue-hijab.svg',
        detailImageUrls: [],
        personalColors: ['summer_cool'],
        description: '파우더 블루 여름 쿨톤 히잡',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    'winter_cool': [
      {
        id: '10',
        name: 'Fuchsia Pink Hijab',
        category: 'hijab',
        price: 31000,
        thumbnailUrl: '/uploads/hijabs/winter-fuchsia-hijab.svg',
        detailImageUrls: [],
        personalColors: ['winter_cool'],
        description: '퓨샤 핑크의 겨울 쿨톤 히잡',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '11',
        name: 'Burgundy Velvet Hijab',
        category: 'hijab',
        price: 33000,
        thumbnailUrl: '/uploads/hijabs/winter-burgundy-hijab.svg',
        detailImageUrls: [],
        personalColors: ['winter_cool'],
        description: '버건디 벨벳 겨울 쿨톤 히잡',
        shopeeLink: '#',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '12',
        name: 'Midnight Navy Hijab',
        category: 'hijab',
        price: 28000,
        thumbnailUrl: '/uploads/hijabs/winter-navy-hijab.svg',
        detailImageUrls: [],
        personalColors: ['winter_cool'],
        description: '미드나잇 네이비 겨울 쿨톤 히잡',
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
  const [hijabProducts, setHijabProducts] = React.useState<Product[]>([]);
  const [beautyProducts, setBeautyProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        
        console.log('[ProductRecommendation] Fetching for personal color:', personalColorEn);
        
        // Import ProductAPI dynamically to avoid circular dependencies
        const { ProductAPI } = await import('@/services/api/products');
        
        // Fetch recommended products
        let products = [];
        try {
          const response = await ProductAPI.getRecommendedProducts(personalColorEn);
          console.log('[ProductRecommendation] API Response:', response);
          products = response.data || [];
        } catch (error) {
          console.log('[ProductRecommendation] Failed to get recommended products, fetching all products');
          // If recommended products fail, get all products as fallback
          const allProductsResponse = await ProductAPI.getProducts();
          products = allProductsResponse.data || [];
        }
        
        console.log('[ProductRecommendation] Total products found:', products.length);
        
        // Separate hijab and beauty products
        const hijabs = products.filter(p => p.category === 'hijab').slice(0, 3);
        const beauty = products.filter(p => ['lens', 'lip', 'eyeshadow', 'tint'].includes(p.category)).slice(0, 3);
        
        console.log('[ProductRecommendation] Hijab products:', hijabs.length);
        console.log('[ProductRecommendation] Beauty products:', beauty.length);
        
        // If no products from API, use mock data
        if (hijabs.length === 0 && beauty.length === 0) {
          console.log('[ProductRecommendation] No products from API, using mock data');
          const mockProducts = getMockProducts(personalColorEn);
          setHijabProducts(mockProducts);
          setBeautyProducts([]);
        } else {
          setHijabProducts(hijabs);
          setBeautyProducts(beauty);
        }
      } catch (error) {
        console.error('[ProductRecommendation] Failed to fetch product recommendations:', error);
        // Use mock data as fallback
        const mockProducts = getMockProducts(personalColorEn);
        setHijabProducts(mockProducts);
        setBeautyProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [personalColorEn]);
  
  // Show section even if no products (with empty state message)
  
  // Get season name in Korean
  const getSeasonName = (personalColor: string): string => {
    const seasonMap: Record<string, string> = {
      'spring': '봄 웜',
      'summer': '여름 쿨',
      'autumn': '가을 웜',
      'winter': '겨울 쿨'
    };
    
    const lowerColor = personalColor.toLowerCase();
    for (const [key, value] of Object.entries(seasonMap)) {
      if (lowerColor.includes(key)) {
        return value;
      }
    }
    return '당신';
  };

  const seasonName = getSeasonName(personalColorEn);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        <span style={{ color: '#FF6B6B' }}>{seasonName}</span>을 위한
        <br />
        추천 히잡을 클릭해 보세요
      </h3>
        
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* Show only hijab products */}
          {hijabProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">아직 등록된 히잡이 없습니다.</p>
              <p className="text-sm">곧 멋진 상품들이 추가될 예정입니다!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {hijabProducts.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductRecommendation;