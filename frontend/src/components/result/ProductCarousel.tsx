import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';

// Mock data for products - all set to Lip category
const mockProducts: Product[] = [
  {
    id: 'prod_lip_1',
    name: 'Velvet Rose Lip',
    category: 'lip',
    price: 22.50,
    thumbnailUrl: 'https://placehold.co/300x300/E8B4B4/3B1389?text=Lip+1',
    personalColors: ['spring_warm', 'summer_cool'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_lip_2',
    name: 'Coral Kiss Lip',
    category: 'lip',
    price: 24.00,
    thumbnailUrl: 'https://placehold.co/300x300/FFDAB9/3B1389?text=Lip+2',
    personalColors: ['autumn_warm', 'spring_warm'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_lip_3',
    name: 'Ruby Red Lip',
    category: 'lip',
    price: 26.99,
    thumbnailUrl: 'https://placehold.co/300x300/E0B0B0/3B1389?text=Lip+3',
    personalColors: ['winter_cool', 'summer_cool'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const ProductCarousel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        👍 Recommended Lip Products
      </h3>
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {mockProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/products/${product.id}`)}
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
              <h4 className="text-sm md:text-base font-bold text-gray-800 truncate">
                {product.name}
              </h4>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <span className="text-yellow-500">⭐</span>
                <span className="ml-1 font-semibold">4.5</span>
                <span className="ml-1">(500+)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};