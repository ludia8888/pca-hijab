import React from 'react';

interface HijabInfo {
  id: string;
  brand: string;
  name: string;
  link: string;
  thumbnailUrl: string;
}

const recommendedHijabsData: Record<string, HijabInfo[]> = {
  spring_warm: [
    {
      id: 'h_sw1',
      brand: 'HAREER',
      name: 'Peach Blossom',
      link: '#',
      thumbnailUrl: '/products/히잡1.webp',
    },
    {
      id: 'h_sw2',
      brand: 'HAREER',
      name: 'Coral Dream',
      link: '#',
      thumbnailUrl: '/products/히잡3.webp',
    },
    {
      id: 'h_sw3',
      brand: 'HAREER',
      name: 'Sunset Glow',
      link: '#',
      thumbnailUrl: '/products/히잡5.webp',
    },
  ],
  summer_cool: [
    {
      id: 'h_sc1',
      brand: 'HAREER',
      name: 'Lavender Mist',
      link: '#',
      thumbnailUrl: '/products/히잡2.webp',
    },
    {
      id: 'h_sc2',
      brand: 'HAREER',
      name: 'Rose Quartz',
      link: '#',
      thumbnailUrl: '/products/히잡4.webp',
    },
    {
      id: 'h_sc3',
      brand: 'HAREER',
      name: 'Sky Blue',
      link: '#',
      thumbnailUrl: '/products/히잡6.webp',
    },
  ],
  autumn_warm: [
    {
      id: 'h_aw1',
      brand: 'HAREER',
      name: 'Cinnamon Spice',
      link: '#',
      thumbnailUrl: '/products/히잡7.webp',
    },
    {
      id: 'h_aw2',
      brand: 'HAREER',
      name: 'Golden Amber',
      link: '#',
      thumbnailUrl: '/products/히잡8.webp',
    },
    {
      id: 'h_aw3',
      brand: 'HAREER',
      name: 'Terracotta',
      link: '#',
      thumbnailUrl: '/products/히잡1.webp',
    },
  ],
  winter_cool: [
    {
      id: 'h_wc1',
      brand: 'HAREER',
      name: 'Royal Blue',
      link: '#',
      thumbnailUrl: '/products/히잡3.webp',
    },
    {
      id: 'h_wc2',
      brand: 'HAREER',
      name: 'Berry Wine',
      link: '#',
      thumbnailUrl: '/products/히잡5.webp',
    },
    {
      id: 'h_wc3',
      brand: 'HAREER',
      name: 'Midnight Black',
      link: '#',
      thumbnailUrl: '/products/히잡7.webp',
    },
  ],
};

interface HijabCarouselProps {
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

export const HijabCarousel: React.FC<HijabCarouselProps> = ({ personalColor }) => {
  const personalColorKey = getPersonalColorKey(personalColor);
  const hijabsToShow = recommendedHijabsData[personalColorKey] || [];

  const handleHijabClick = (link: string) => {
    if (link !== '#') {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        🧕 Recommended Hijabs
      </h3>
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {hijabsToShow.map((hijab) => (
          <div
            key={hijab.id}
            onClick={() => handleHijabClick(hijab.link)}
            className="border border-gray-200 rounded-xl p-2 cursor-pointer hover:shadow-lg transition-shadow bg-white"
          >
            <div className="relative w-full aspect-square mb-2">
              <img
                src={hijab.thumbnailUrl}
                alt={hijab.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500 truncate">{hijab.brand}</p>
              <h4 className="text-sm md:text-base font-bold text-gray-800 truncate">
                {hijab.name}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};