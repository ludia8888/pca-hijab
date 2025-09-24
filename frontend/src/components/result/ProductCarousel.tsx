import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';

// Mock data for products
const mockProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Elegant Silk Hijab',
    category: 'hijab',
    price: 25.99,
    thumbnailUrl: 'https://placehold.co/150x150/D6B4E8/3B1389?text=Hijab',
    personalColors: ['spring_warm', 'summer_cool'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_2',
    name: 'Natural Look Contact Lenses',
    category: 'lens',
    price: 19.99,
    thumbnailUrl: 'https://placehold.co/150x150/B4E8D6/3B1389?text=Lens',
    personalColors: ['autumn_warm', 'spring_warm'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_3',
    name: 'Velvet Matte Lipstick',
    category: 'lip',
    price: 15.00,
    thumbnailUrl: 'https://placehold.co/150x150/E8B4B4/3B1389?text=Lipstick',
    personalColors: ['winter_cool', 'summer_cool'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const categoryLabels: Record<string, string> = {
  hijab: '히잡',
  lens: '렌즈',
  lip: '립',
  eyeshadow: '아이쉐도우',
};

export const ProductCarousel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        👍 Recommended Products
      </h3>
      <div className="flex flex-col gap-4">
        {mockProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/products/${product.id}`)}
            className="flex items-center gap-4 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24">
              <img
                src={product.thumbnailUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex-grow">
              <span className="text-xs bg-primary-light text-primary-dark font-semibold px-2 py-1 rounded-full">
                {categoryLabels[product.category] || product.category}
              </span>
              <h4 className="text-sm md:text-base font-bold text-gray-900 mt-1 truncate">
                {product.name}
              </h4>
              <p className="text-sm text-gray-700 font-semibold">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};