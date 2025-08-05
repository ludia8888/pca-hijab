import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Package, Search, X, Filter, Crown } from 'lucide-react';
import { ProductCard } from '@/components/products';
import { ProductAPI } from '@/services/api/products';
import { PageLayout } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { AuthRequired, PersonalColorRequired } from '@/components/auth';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAppStore } from '@/store';
import type { Product, ProductCategory, PersonalColorType } from '@/types';
import { CATEGORY_LABELS, PERSONAL_COLOR_LABELS } from '@/types';

type TabType = 'all' | 'recommended' | ProductCategory;

const ProductsCatalogPage: React.FC = () => {
  // Get user's personal color result
  const { analysisResult } = useAppStore();
  const {
    checkPersonalColor,
    showAuthModal,
    showPersonalColorModal,
    authModalFeature,
    personalColorModalFeature,
    closeAuthModal,
    closePersonalColorModal
  } = useRequireAuth();
  
  // Filter states
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColors, setSelectedColors] = useState<PersonalColorType[]>([]);
  const [showColorFilter, setShowColorFilter] = useState(false);
  const colorFilterRef = useRef<HTMLDivElement>(null);

  // Tab options
  const tabs: { id: TabType; label: string; icon?: React.ReactNode }[] = [
    { id: 'all', label: '전체' },
    { 
      id: 'recommended', 
      label: '추천 상품',
      icon: <Crown className="w-4 h-4" />
    },
    { id: 'hijab', label: '히잡' },
    { id: 'lens', label: '렌즈' },
    { id: 'lip', label: '립' },
    { id: 'eyeshadow', label: '아이쉐도우' }
  ];

  const personalColors: PersonalColorType[] = ['spring_warm', 'autumn_warm', 'summer_cool', 'winter_cool'];

  // Handle click outside to close color filter
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorFilterRef.current && !colorFilterRef.current.contains(event.target as Node)) {
        setShowColorFilter(false);
      }
    };

    if (showColorFilter) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorFilter]);

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => ProductAPI.getProducts(),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get user's personal color type
  const getUserPersonalColorType = (): PersonalColorType | null => {
    if (!analysisResult) return null;
    
    const colorMapping: Record<string, PersonalColorType> = {
      'spring': 'spring_warm',
      'autumn': 'autumn_warm',
      'summer': 'summer_cool',
      'winter': 'winter_cool'
    };
    
    return colorMapping[analysisResult.personal_color_en.toLowerCase()] || null;
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!product.name.toLowerCase().includes(searchLower) &&
            !product.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Recommended tab filter
      if (activeTab === 'recommended') {
        const userPersonalColor = getUserPersonalColorType();
        if (!userPersonalColor) return false;
        return product.personalColors.includes(userPersonalColor);
      }

      // Category filter (based on active tab)
      if (activeTab !== 'all' && activeTab !== 'recommended' && product.category !== activeTab) {
        return false;
      }

      // Personal color filter
      if (selectedColors.length > 0) {
        const hasMatchingColor = product.personalColors.some(color => 
          selectedColors.includes(color)
        );
        if (!hasMatchingColor) return false;
      }

      return true;
    });
  }, [products, searchTerm, activeTab, selectedColors, analysisResult]);

  // Filter handlers
  const handleColorToggle = useCallback((color: PersonalColorType) => {
    setSelectedColors(prev => 
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedColors([]);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">상품을 불러오는 중...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Text color="error" mb="4">상품을 불러오는 중 오류가 발생했습니다.</Text>
            <Button 
              onClick={() => window.location.reload()}
              variant="solid"
              color="primary"
            >
              다시 시도
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout noPadding>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Text variant="h1" color="gray" mb="2">상품 카탈로그</Text>
            <Text color="gray">
              당신의 퍼스널 컬러에 맞는 히잡과 뷰티 제품을 찾아보세요
            </Text>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="상품 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Color Filter Button */}
              <div className="relative" ref={colorFilterRef}>
                <Button
                  variant="outline"
                  onClick={() => setShowColorFilter(!showColorFilter)}
                  icon={<Filter className="w-4 h-4" />}
                >
                  퍼스널 컬러 {selectedColors.length > 0 && `(${selectedColors.length})`}
                </Button>

                {/* Color Filter Dropdown */}
                {showColorFilter && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-20">
                    <Text variant="body-sm" weight="semibold" color="gray" mb="3">퍼스널 컬러</Text>
                    <div className="space-y-2 mb-4">
                      {personalColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorToggle(color)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedColors.includes(color)
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {PERSONAL_COLOR_LABELS[color]}
                        </button>
                      ))}
                    </div>
                    {selectedColors.length > 0 && (
                      <button
                        onClick={() => setSelectedColors([])}
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        초기화
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'recommended') {
                      if (checkPersonalColor('추천 상품')) {
                        setActiveTab(tab.id);
                      }
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-purple-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {activeTab === 'all' ? '전체' : 
               activeTab === 'recommended' ? '추천' : 
               CATEGORY_LABELS[activeTab]} 카테고리 - 총 {filteredProducts.length}개의 상품
            </p>
          </div>

          {/* Products Grid - 3 columns on all devices */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <Text variant="body-lg" weight="medium" color="gray" mb="2">
                상품이 없습니다
              </Text>
              <Text color="gray">
                {searchTerm || selectedColors.length > 0
                  ? '다른 검색 조건을 시도해보세요'
                  : '곧 새로운 상품이 추가될 예정입니다'}
              </Text>
            </div>
          )}
        </div>
      </div>
      
      {/* Auth Required Modal */}
      <AuthRequired 
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        feature={authModalFeature}
      />
      
      {/* Personal Color Required Modal */}
      <PersonalColorRequired
        isOpen={showPersonalColorModal}
        onClose={closePersonalColorModal}
        feature={personalColorModalFeature}
      />
    </PageLayout>
  );
};

export default ProductsCatalogPage;