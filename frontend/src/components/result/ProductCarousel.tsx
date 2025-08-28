import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductAPI } from '@/services/api/products';
import type { Product, PersonalColorType } from '@/types';

interface ProductCarouselProps {
  personalColor: string;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ personalColor }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => ProductAPI.getProducts(),
    select: (response) => response.data,
  });

  // Map personal color to type
  const getPersonalColorType = (color: string): PersonalColorType | null => {
    const colorMapping: Record<string, PersonalColorType> = {
      'Spring Warm': 'spring_warm',
      'Summer Cool': 'summer_cool',
      'Autumn Warm': 'autumn_warm',
      'Winter Cool': 'winter_cool'
    };
    return colorMapping[color] || null;
  };

  const personalColorType = getPersonalColorType(personalColor);

  // Filter products based on personal color
  const recommendedProducts = products.filter((product) => {
    if (!personalColorType) return false;
    return product.personalColors?.includes(personalColorType);
  });

  // Category labels
  const categoryLabels = {
    hijab: '히잡',
    lens: '렌즈',
    lip: '립',
    eyeshadow: '아이쉐도우'
  };

  // Check scroll position
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  // Scroll handlers
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [recommendedProducts]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-48">
                <div className="h-48 bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendedProducts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          👍 추천 제품
        </h3>
        <p className="text-gray-500 text-center py-8">
          추천 제품을 준비 중입니다
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <div className="relative">
        {/* Products Grid - Show only 3 products as preview */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 lg:gap-4">
          {recommendedProducts.slice(0, 3).map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg mb-2 aspect-square">
                <img
                  src={product.thumbnailUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-[10px] sm:text-xs font-medium text-gray-900 truncate">
                {product.name}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => navigate('/products')}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          모든 추천 제품 보기 →
        </button>
      </div>
    </div>
  );
};