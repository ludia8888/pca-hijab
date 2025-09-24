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

export const ProductRecommendation: React.FC<ProductRecommendationProps> = ({ personalColorEn }) => {
  const [hijabProducts, setHijabProducts] = React.useState<Product[]>([]);
  const [beautyProducts, setBeautyProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        
        // Import ProductAPI dynamically to avoid circular dependencies
        const { ProductAPI } = await import('@/services/api/products');
        
        // Fetch recommended products
        const response = await ProductAPI.getRecommendedProducts(personalColorEn);
        const products = response.data || [];
        
        // Separate hijab and beauty products
        const hijabs = products.filter(p => p.category === 'hijab').slice(0, 3);
        const beauty = products.filter(p => ['lens', 'lip', 'eyeshadow', 'tint'].includes(p.category)).slice(0, 3);
        
        setHijabProducts(hijabs);
        setBeautyProducts(beauty);
      } catch (error) {
        console.error('Failed to fetch product recommendations:', error);
        // Use empty arrays on error
        setHijabProducts([]);
        setBeautyProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [personalColorEn]);
  
  // Don't show section if no products
  if (!isLoading && hijabProducts.length === 0 && beautyProducts.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🛍️</span> 
          <span>추천 히잡을 클릭해 보세요</span>
        </h3>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Hijab Products Row */}
            {hijabProducts.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {hijabProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {/* Fill empty slots if less than 3 products */}
                {hijabProducts.length < 3 && Array.from({ length: 3 - hijabProducts.length }).map((_, i) => (
                  <div key={`empty-hijab-${i}`} className="bg-gray-50 rounded-lg aspect-square" />
                ))}
              </div>
            )}
            
            {/* Beauty Products Row */}
            {beautyProducts.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {beautyProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {/* Fill empty slots if less than 3 products */}
                {beautyProducts.length < 3 && Array.from({ length: 3 - beautyProducts.length }).map((_, i) => (
                  <div key={`empty-beauty-${i}`} className="bg-gray-50 rounded-lg aspect-square" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRecommendation;