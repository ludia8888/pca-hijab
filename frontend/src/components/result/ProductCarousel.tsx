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

  // Fetch recommended products
  const { data: recommendedProducts = [], isLoading } = useQuery({
    queryKey: ['recommendedProducts', personalColor],
    queryFn: () => ProductAPI.getRecommendedProducts(personalColor),
    select: (response) => response.data,
    enabled: !!personalColor, // Only run query if personalColor is available
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
          👍 Recommended Products
        </h3>
        <p className="text-gray-500 text-center py-8">
          Preparing recommended products
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
      <div style={{ 
        marginTop: '20px', 
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => navigate('/products')}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#3B1389';
            e.currentTarget.style.color = '#FFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#3B1389';
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            color: '#3B1389',
            background: 'transparent',
            border: '1.5px solid #3B1389',
            borderRadius: '20px',
            fontFamily: 'Pretendard',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '140%',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          View All Recommendations
          <span style={{ fontSize: '16px' }}>→</span>
        </button>
      </div>
    </div>
  );
};