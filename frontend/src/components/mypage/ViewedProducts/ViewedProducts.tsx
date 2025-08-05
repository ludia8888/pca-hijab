import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trash2, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { ProductAPI } from '@/services/api';
import { ProductCard } from '../ProductCard';
import { ROUTES } from '@/utils/constants';
import type { Product } from '@/types';

export const ViewedProducts = (): JSX.Element => {
  const navigate = useNavigate();
  const { viewedProducts, clearViewedProducts } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (viewedProducts?.length > 0) {
      loadProducts();
    }
  }, [viewedProducts]);
  
  const loadProducts = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const productIds = (viewedProducts || []).map(vp => vp.productId);
      const response = await ProductAPI.getProductsByIds(productIds);
      
      // Sort products by viewed date (most recent first)
      const sortedProducts = response.data.sort((a, b) => {
        const aViewed = (viewedProducts || []).find(vp => vp.productId === a.id);
        const bViewed = (viewedProducts || []).find(vp => vp.productId === b.id);
        
        if (!aViewed || !bViewed) return 0;
        
        return new Date(bViewed.viewedAt).getTime() - new Date(aViewed.viewedAt).getTime();
      });
      
      setProducts(sortedProducts);
    } catch (err) {
      console.error('Failed to load viewed products:', err);
      setError('상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearAll = (): void => {
    if (window.confirm('모든 최근 본 상품을 삭제하시겠습니까?')) {
      clearViewedProducts();
      setProducts([]);
    }
  };
  
  const formatViewedDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">최근 본 상품</h2>
          {viewedProducts?.length > 0 && (
            <span className="text-sm text-gray-500">({viewedProducts.length})</span>
          )}
        </div>
        
        {viewedProducts?.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            전체 삭제
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">상품을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <button
            onClick={loadProducts}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            다시 시도
          </button>
        </div>
      ) : !viewedProducts?.length ? (
        <div className="py-12 text-center">
          <div className="text-6xl mb-4">👀</div>
          <p className="text-gray-600 mb-4">최근 본 상품이 없습니다.</p>
          <button
            onClick={() => navigate(ROUTES.PRODUCTS)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
          >
            상품 둘러보기
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Product grid with scroll */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto">
            {products.map((product) => {
              const viewedInfo = (viewedProducts || []).find(vp => vp.productId === product.id);
              return (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  {viewedInfo && (
                    <div className="absolute top-0 left-0 right-0 px-2 py-1 bg-black/50 text-white text-xs text-center">
                      {formatViewedDate(viewedInfo.viewedAt)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {viewedProducts && viewedProducts.length > 8 && (
            <p className="text-xs text-gray-500 text-center mt-4">
              최근 본 상품은 최대 10개까지 저장됩니다.
            </p>
          )}
        </>
      )}
    </div>
  );
};