import React from 'react';

interface ProductInfo {
  id: string;
  brand: string;
  name: string;
  link: string;
  thumbnailUrl: string;
}

const recommendedProductsData: Record<string, ProductInfo[]> = {
  spring_warm: [
    {
      id: 'sw1',
      brand: 'Moonshot',
      name: 'Alluring',
      link: 'https://en.moonshot-beauty.com/product/melting-mood-lip-and-cheeksheer-glow/131/?cate_no=1&display_group=2',
      thumbnailUrl: '/products/봄웜1.png',
    },
    {
      id: 'sw2',
      brand: 'KARADIUM',
      name: 'Butter coral',
      link: 'https://smartstore.naver.com/karadium/products/9255588817',
      thumbnailUrl: '/products/봄웜2.png',
    },
    {
      id: 'sw3',
      brand: 'molette',
      name: 'Apple cheeky',
      link: 'http://smartstore.naver.com/molette_official/products/11582095583',
      thumbnailUrl: '/products/봄웜3.png',
    },
  ],
  summer_cool: [
    {
      id: 'sc1',
      brand: 'Moonshot',
      name: 'Shy',
      link: 'https://en.moonshot-beauty.com/product/melting-mood-lip-and-cheeksheer-glow/131/?cate_no=1&display_group=2',
      thumbnailUrl: '/products/여름쿨1.png',
    },
    {
      id: 'sc2',
      brand: 'KARADIUM',
      name: 'Cozy pink',
      link: 'https://smartstore.naver.com/karadium/products/9255588817',
      thumbnailUrl: '/products/여름쿨2.png',
    },
    {
      id: 'sc3',
      brand: 'molette',
      name: 'Dewy berry',
      link: 'http://smartstore.naver.com/molette_official/products/11582095583',
      thumbnailUrl: '/products/여름쿨3.png',
    },
  ],
  autumn_warm: [
    {
      id: 'aw1',
      brand: 'Moonshot',
      name: 'Honest',
      link: 'https://en.moonshot-beauty.com/product/melting-mood-lip-and-cheeksheer-glow/131/?cate_no=1&display_group=2',
      thumbnailUrl: '/products/가을웜1.png',
    },
    {
      id: 'aw2',
      brand: 'KARADIUM',
      name: 'Pecan sand',
      link: 'https://smartstore.naver.com/karadium/products/9255588817',
      thumbnailUrl: '/products/가을웜2.png',
    },
    {
      id: 'aw3',
      brand: 'molette',
      name: 'Coco choco',
      link: 'http://smartstore.naver.com/molette_official/products/11582095583',
      thumbnailUrl: '/products/가을웜3.png',
    },
  ],
  winter_cool: [
    {
      id: 'wc1',
      brand: 'Moonshot',
      name: 'Oort pink',
      link: 'https://en.moonshot-beauty.com/product/jelly-moon-glow-tint/158/?cate_no=56&display_group=1',
      thumbnailUrl: '/products/겨울쿨1.png',
    },
    {
      id: 'wc2',
      brand: 'KARADIUM',
      name: 'Rosy berry',
      link: 'https://smartstore.naver.com/karadium/products/9255588817',
      thumbnailUrl: '/products/겨울쿨2.png',
    },
    {
      id: 'wc3',
      brand: 'molette',
      name: 'Tingle cherry',
      link: 'http://smartstore.naver.com/molette_official/products/11582095583',
      thumbnailUrl: '/products/겨울쿨3.png',
    },
  ],
};

interface ProductCarouselProps {
  personalColor: string; // e.g., "Spring Warm"
}

// Helper function to map display name to data key
const getPersonalColorKey = (color: string): string => {
  const lowerCaseColor = color.toLowerCase();
  if (lowerCaseColor.includes('spring')) return 'spring_warm';
  if (lowerCaseColor.includes('summer')) return 'summer_cool';
  if (lowerCaseColor.includes('autumn')) return 'autumn_warm';
  if (lowerCaseColor.includes('winter')) return 'winter_cool';
  return 'spring_warm'; // Default fallback
};

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ personalColor }) => {
  const personalColorKey = getPersonalColorKey(personalColor);
  const productsToShow = recommendedProductsData[personalColorKey] || [];

  const handleProductClick = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Recommended Lip Products
      </h3>
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {productsToShow.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product.link)}
            className="border border-gray-200 rounded-xl p-2 cursor-pointer hover:shadow-lg transition-shadow bg-white"
          >
            <div className="relative w-full aspect-square mb-2">
              <img
                src={product.thumbnailUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500 truncate">{product.brand}</p>
              <h4 className="text-sm md:text-base font-bold text-gray-800 truncate">
                {product.name}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};