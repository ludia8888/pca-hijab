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
      thumbnailUrl: 'https://placehold.co/300x300/FFB3BA/3B1389?text=Alluring',
    },
    {
      id: 'sw2',
      brand: 'KARADIUM',
      name: 'Butter coral',
      link: 'https://smartstore.naver.com/karadium/products/9255588817',
      thumbnailUrl: 'https://placehold.co/300x300/FFDAB9/3B1389?text=Butter+coral',
    },
    {
      id: 'sw3',
      brand: 'molette',
      name: 'Apple cheeky',
      link: 'http://smartstore.naver.com/molette_official/products/11582095583',
      thumbnailUrl: 'https://placehold.co/300x300/FFC3A0/3B1389?text=Apple+cheeky',
    },
  ],
  summer_cool: [
    {
      id: 'sc1',
      brand: 'Moonshot',
      name: 'Shy',
      link: 'https://en.moonshot-beauty.com/product/melting-mood-lip-and-cheeksheer-glow/131/?cate_no=1&display_group=2',
      thumbnailUrl: 'https://placehold.co/300x300/E6E6FA/3B1389?text=Shy',
    },
    {
      id: 'sc2',
      brand: 'KARADIUM',
      name: 'Cozy pink',
      link: 'https://smartstore.naver.com/karadium/products/9255588817',
      thumbnailUrl: 'https://placehold.co/300x300/FFE4E1/3B1389?text=Cozy+pink',
    },
    {
      id: 'sc3',
      brand: 'molette',
      name: 'Dewy berry',
      link: 'http://smartstore.naver.com/molette_official/products/11582095583',
      thumbnailUrl: 'https://placehold.co/300x300/DDA0DD/3B1389?text=Dewy+berry',
    },
  ],
  autumn_warm: [
    {
      id: 'aw1',
      brand: 'Moonshot',
      name: 'Honest',
      link: 'https://en.moonshot-beauty.com/product/melting-mood-lip-and-cheeksheer-glow/131/?cate_no=1&display_group=2',
      thumbnailUrl: 'https://placehold.co/300x300/CD853F/3B1389?text=Honest',
    },
    {
      id: 'aw2',
      brand: 'KARADIUM',
      name: 'Pecan sand',
      link: 'https://smartstore.naver.com/karadium/products/9255588817',
      thumbnailUrl: 'https://placehold.co/300x300/D2691E/3B1389?text=Pecan+sand',
    },
    {
      id: 'aw3',
      brand: 'molette',
      name: 'Coco choco',
      link: 'http://smartstore.naver.com/molette_official/products/11582095583',
      thumbnailUrl: 'https://placehold.co/300x300/8B4513/3B1389?text=Coco+choco',
    },
  ],
  winter_cool: [
    {
      id: 'wc1',
      brand: 'Moonshot',
      name: 'Oort pink',
      link: 'https://en.moonshot-beauty.com/product/jelly-moon-glow-tint/158/?cate_no=56&display_group=1',
      thumbnailUrl: 'https://placehold.co/300x300/4169E1/FFFFFF?text=Oort+pink',
    },
    {
      id: 'wc2',
      brand: 'KARADIUM',
      name: 'Rosy berry',
      link: 'https://smartstore.naver.com/karadium/products/9255588817',
      thumbnailUrl: 'https://placehold.co/300x300/C71585/FFFFFF?text=Rosy+berry',
    },
    {
      id: 'wc3',
      brand: 'molette',
      name: 'Tingle cherry',
      link: 'http://smartstore.naver.com/molette_official/products/11582095583',
      thumbnailUrl: 'https://placehold.co/300x300/FF1493/FFFFFF?text=Tingle+cherry',
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
        👍 Recommended Lip Products
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