import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { getImageUrl } from '@/utils/imageUrl';

// Labels for display
const PRODUCT_CATEGORY_LABELS = {
  hijab: 'Hijab',
  lens: 'Contact lens',
  lip: 'Lip',
  eyeshadow: 'Eyeshadow'
} as const;

const PERSONAL_COLOR_LABELS = {
  spring_warm: 'Spring Warm',
  autumn_warm: 'Autumn Warm',
  summer_cool: 'Summer Cool',
  winter_cool: 'Winter Cool'
} as const;

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div 
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="aspect-square w-full overflow-hidden bg-gray-50">
        <img
          src={getImageUrl(product.thumbnailUrl)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3">
        {/* Category Badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {PRODUCT_CATEGORY_LABELS[product.category]}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-900 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] lg:min-h-[3.5rem]">
          {product.name}
        </h3>

        {/* Personal Colors - Hidden on mobile for cleaner look */}
        {product.personalColors.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-1">
            {product.personalColors.map((color) => (
              <span
                key={color}
                className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
              >
                {PERSONAL_COLOR_LABELS[color]}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="text-sm sm:text-base lg:text-xl font-bold text-gray-900">
          {formatPrice(product.price)}
        </div>
      </div>
    </div>
  );
};
