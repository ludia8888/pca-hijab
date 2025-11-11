import React, { useEffect, useState } from 'react';
import type { Product, PersonalColorType } from '@/types';
import { ProductAPI } from '@/services/api/products';
import { getImageUrl } from '@/utils/imageUrl';

interface ProductCarouselProps {
  personalColor: string; // e.g., "Spring Warm"
}

const toPersonalColorType = (color: string): PersonalColorType => {
  const lower = color.toLowerCase();
  if (lower.includes('spring')) return 'spring_warm';
  if (lower.includes('summer')) return 'summer_cool';
  if (lower.includes('autumn')) return 'autumn_warm';
  if (lower.includes('winter')) return 'winter_cool';
  return 'spring_warm';
};

const parseBrandAndName = (name: string): { brand: string; title: string } => {
  const parts = name.split(' - ');
  if (parts.length >= 2) {
    return { brand: parts[0], title: parts.slice(1).join(' - ') };
  }
  return { brand: 'Lip', title: name };
};

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ personalColor }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const pc = toPersonalColorType(personalColor);
        const { data } = await ProductAPI.getProducts({ category: 'lip', personalColor: pc });
        if (mounted) {
          setItems((data || []).slice(0, 3));
        }
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      mounted = false;
    };
  }, [personalColor]);

  const handleProductClick = (link?: string) => {
    if (link && link !== '#') {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Lip Products</h3>
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {loading && [0,1,2].map(i => (
          <div key={`skeleton-${i}`} className="border border-gray-200 rounded-xl p-2 bg-white animate-pulse">
            <div className="w-full aspect-square mb-2 bg-gray-200 rounded-lg" />
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-1" />
            <div className="h-4 bg-gray-300 rounded w-3/4" />
          </div>
        ))}
        {!loading && items.map((product) => {
          const { brand, title } = parseBrandAndName(product.name);
          return (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.shopeeLink)}
              className="border border-gray-200 rounded-xl p-2 cursor-pointer hover:shadow-lg transition-shadow bg-white"
            >
              <div className="relative w-full aspect-square mb-2">
                <img
                  src={getImageUrl(product.thumbnailUrl)}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 truncate">{brand}</p>
                <h4 className="text-sm md:text-base font-bold text-gray-800 truncate">{title}</h4>
              </div>
            </div>
          );
        })}
        {!loading && items.length === 0 && (
          <div className="col-span-3 text-center text-sm text-gray-500 py-4">등록된 립 상품이 없습니다.</div>
        )}
      </div>
    </div>
  );
};
