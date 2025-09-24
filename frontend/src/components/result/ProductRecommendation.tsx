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
        name: 'Moonshot - Melting Mood Lip - Alluring',
        category: 'lip',
        price: 15000,
        thumbnailUrl: '/uploads/products/moonshot-alluring.svg',
        detailImageUrls: [],
        personalColors: ['spring_warm'],
        description: '봄 웜톤을 위한 따뜻한 코랄 립 컬러',
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
        description: '버터처럼 부드러운 봄 웜톤 코랄 립',
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
        description: '사과처럼 상큼한 봄 웜톤 립 컬러',
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
        description: '가을 웜톤을 위한 차분한 브라운 립',
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
        description: '피칸 샌드 컬러의 가을 웜톤 립',
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
        description: '코코아처럼 달콤한 가을 웜톤 립',
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
        description: '수줍은듯한 핑크 여름 쿨톤 립',
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
        description: '편안한 핑크 여름 쿨톤 립',
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
        description: '촉촉한 베리 여름 쿨톤 립',
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
        description: '우주처럼 신비로운 핑크 겨울 쿨톤 립',
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
        description: '로즈 베리 겨울 쿨톤 립',
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
        description: '체리처럼 생동감 있는 겨울 쿨톤 립',
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
        
        // Separate lip and other beauty products
        const lips = products.filter(p => p.category === 'lip').slice(0, 3);
        const beauty = products.filter(p => ['lens', 'eyeshadow', 'tint'].includes(p.category)).slice(0, 3);
        
        console.log('[ProductRecommendation] Lip products:', lips.length);
        console.log('[ProductRecommendation] Beauty products:', beauty.length);
        
        // If no products from API, use mock data
        if (lips.length === 0 && beauty.length === 0) {
          console.log('[ProductRecommendation] No products from API, using mock data');
          const mockProducts = getMockProducts(personalColorEn);
          setHijabProducts(mockProducts);
          setBeautyProducts([]);
        } else {
          setHijabProducts(lips);
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
        추천 립 제품을 확인해보세요
      </h3>
        
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* Show only lip products */}
          {hijabProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">아직 등록된 제품이 없습니다.</p>
              <p className="text-sm">곧 멋진 립 제품들이 추가될 예정입니다!</p>
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