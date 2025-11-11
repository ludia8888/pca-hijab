import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui';
import { Heart, ShoppingBag } from 'lucide-react';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/useAuthStore';
import type { Product } from '@/types';
import { getImageUrl } from '@/utils/imageUrl';

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
}

export const ProductCard = ({ product, onProductClick }: ProductCardProps): JSX.Element => {
  const { savedProducts, toggleSavedProduct, addViewedProduct } = useAppStore();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [imageError, setImageError] = useState(false);
  
  const isSaved = savedProducts?.some(p => p.productId === product.id) || false;
  
  const handleCardClick = (): void => {
    // Track product view (로그인 사용자만 기록)
    if (isAuthenticated) {
      addViewedProduct(product.id);
    }
    
    if (onProductClick) {
      onProductClick(product);
    } else {
      // Open Shopee link in new tab
      window.open(product.shopeeLink, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleSaveToggle = (e: React.MouseEvent): void => {
    e.stopPropagation(); // Prevent card click
    if (!isAuthenticated) {
      addToast({ type: 'error', title: 'Sign-in required', message: 'Please sign in to use the save feature.' });
      navigate('/login');
      return;
    }
    toggleSavedProduct(product.id);
  };
  
  // Format price with Indonesian Rupiah
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Map category to emoji
  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      hijab: '🧕',
      lens: '👁️',
      lip: '💄',
      eyeshadow: '👁️‍🗨️'
    };
    return emojiMap[category] || '🛍️';
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingBag className="w-12 h-12" />
          </div>
        ) : (
          <img
            src={getImageUrl(product.thumbnailUrl)}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Save button */}
        <button
          onClick={handleSaveToggle}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all ${
            isSaved 
              ? 'bg-purple-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          aria-label={isSaved ? 'Remove from saved' : 'Save product'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        
        {/* Category badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-white rounded-full shadow-sm text-xs font-medium flex items-center gap-1">
          <span>{getCategoryEmoji(product.category)}</span>
          <span className="capitalize">{product.category}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-purple-600">
            {formatPrice(product.price)}
          </p>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <ShoppingBag className="w-3 h-3" />
            <span>Shopee</span>
          </div>
        </div>
        
        {/* Personal colors */}
        {product.personalColors.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.personalColors.map(color => (
              <span 
                key={color}
                className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full"
              >
                {color.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
