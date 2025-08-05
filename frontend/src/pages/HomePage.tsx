import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout';
import { ContentAPI } from '@/services/api';
import { ProductAPI } from '@/services/api/products';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { AuthRequired, PersonalColorRequired } from '@/components/auth';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Text, LoadingSpinner } from '@/components/ui';
import { tokens } from '@/design-system';
import { env } from '@/config/environment';
import type { Content, Product } from '@/types';

const HomePage = (): JSX.Element => {
  const navigate = useNavigate();
  const {
    checkAuth,
    showAuthModal,
    showPersonalColorModal,
    authModalFeature,
    personalColorModalFeature,
    closeAuthModal,
    closePersonalColorModal
  } = useRequireAuth();
  
  const [featuredContents, setFeaturedContents] = useState<Content[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Skip loading content and products in production
      if (env.isProduction) {
        setLoading(false);
        return;
      }
      
      // Load featured contents
      const [contentsRes, productsRes] = await Promise.all([
        ContentAPI.getPopularContents(5),
        ProductAPI.getProducts()
      ]);
      
      setFeaturedContents(contentsRes.data);
      // Take first 6 products (public API already filters active products)
      setProducts(productsRes.data.slice(0, 6));
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = (): void => {
    setCurrentSlide((prev) => (prev + 1) % featuredContents.length);
  };

  const prevSlide = (): void => {
    setCurrentSlide((prev) => (prev - 1 + featuredContents.length) % featuredContents.length);
  };

  const goToSlide = (index: number): void => {
    setCurrentSlide(index);
  };

  const handleContentClick = (content: Content): void => {
    navigate(`/content/${content.slug}`);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <Text color="gray">로딩 중...</Text>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Production-only view
  if (env.isProduction) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              AI Personal Color Analysis
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Find your perfect hijab colors with AI
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 mb-8">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Discover Your Personal Color
            </h2>
            <p className="text-gray-700 mb-6">
              Our AI analyzes your skin tone to recommend the most flattering hijab colors for you
            </p>
            <button
              onClick={() => navigate('/diagnosis')}
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-full hover:from-primary-700 hover:to-primary-800 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              🎯 Start Analysis
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-3">📸</div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload Photo</h3>
              <p className="text-gray-600 text-sm">Take or upload a clear selfie in natural lighting</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600 text-sm">Our AI analyzes your skin tone and features</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Results</h3>
              <p className="text-gray-600 text-sm">Receive your personal color palette instantly</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Content Carousel */}
        {featuredContents.length > 0 ? (
          <div className="relative mb-8 -mx-4 md:mx-0">
            <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-none md:rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredContents.map((content) => (
                  <div
                    key={content.id}
                    className="w-full flex-shrink-0 relative cursor-pointer"
                    onClick={() => handleContentClick(content)}
                  >
                    <img
                      src={content.thumbnailUrl}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                          {ContentAPI.getCategoryIcon(content.category)} {ContentAPI.getCategoryDisplayName(content.category)}
                        </span>
                        {content.viewCount > 100 && (
                          <span className="px-3 py-1 bg-primary-400/80 backdrop-blur-sm rounded-full text-sm">
                            🔥 인기
                          </span>
                        )}
                      </div>
                      <Text 
                        as="h2" 
                        variant="h1" 
                        mb="2"
                        className="text-3xl md:text-4xl"
                      >
                        {content.title}
                      </Text>
                      {content.subtitle && (
                        <Text 
                          variant="body-lg" 
                          mb="3"
                          className="opacity-90 text-lg md:text-xl"
                        >
                          {content.subtitle}
                        </Text>
                      )}
                      {content.excerpt && (
                        <Text 
                          variant="body-sm" 
                          className="opacity-80 line-clamp-2"
                        >
                          {content.excerpt}
                        </Text>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation arrows */}
              <button
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {featuredContents.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'bg-white w-8' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Empty state for contents */
          <div className="relative mb-8 -mx-4 md:mx-0">
            <div className="bg-gray-100 rounded-none md:rounded-2xl h-[400px] md:h-[500px] flex items-center justify-center">
              <div className="text-center px-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-10 h-10 text-gray-400" />
                </div>
                <Text variant="h3" color="gray" mb="2">콘텐츠가 준비 중입니다</Text>
                <Text variant="body" color="gray" className="opacity-70">
                  곧 유용한 뷰티 팁과 컬러 가이드를 만나보실 수 있습니다
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        {products.length > 0 ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <Text variant="h2" color="gray">추천 상품</Text>
              <button
                onClick={() => {
                  if (checkAuth('상품 카탈로그')) {
                    navigate('/products');
                  }
                }}
                className="px-4 py-2 text-primary-400 hover:text-primary-600 font-medium flex items-center gap-2 group transition-colors"
              >
                더알아보기
                <svg 
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => {
                    if (checkAuth('상품 상세정보')) {
                      navigate(`/products/${product.id}`);
                    }
                  }}
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <img
                      src={product.thumbnailUrl}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <Text 
                      variant="body" 
                      weight="medium" 
                      color="gray" 
                      mb="1" 
                      className="line-clamp-1"
                    >
                      {product.name}
                    </Text>
                    <Text 
                      variant="body-lg" 
                      weight="semibold" 
                      color="primary"
                    >
                      {formatPrice(product.price)}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty state for products */
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <Text variant="h2" color="gray">추천 상품</Text>
            </div>
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <Text variant="h3" color="gray" mb="2">상품이 준비 중입니다</Text>
              <Text variant="body" color="gray" className="opacity-70">
                곧 아름다운 히잡과 뷰티 제품을 만나보실 수 있습니다
              </Text>
              <button
                onClick={() => navigate('/diagnosis')}
                className="mt-6 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-full hover:from-primary-700 hover:to-primary-800 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-primary-500"
              >
                🎨 퍼스널 컬러 진단 받기
              </button>
            </div>
          </div>
        )}
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

export default HomePage;