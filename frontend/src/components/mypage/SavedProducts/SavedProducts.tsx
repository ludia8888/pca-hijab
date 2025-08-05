import { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useAppStore } from '@/store';
import { ProductAPI } from '@/services/api';
import { ProductCard } from '../ProductCard';
import type { Product } from '@/types';

export const SavedProducts = (): JSX.Element => {
  const { savedProducts, clearSavedProducts } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (savedProducts?.length > 0) {
      loadProducts();
    }
  }, [savedProducts]);
  
  const loadProducts = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const productIds = (savedProducts || []).map(sp => sp.productId);
      const response = await ProductAPI.getProductsByIds(productIds);
      
      // Sort products by saved date (most recent first)
      const sortedProducts = response.data.sort((a, b) => {
        const aSaved = (savedProducts || []).find(sp => sp.productId === a.id);
        const bSaved = (savedProducts || []).find(sp => sp.productId === b.id);
        
        if (!aSaved || !bSaved) return 0;
        
        return new Date(bSaved.savedAt).getTime() - new Date(aSaved.savedAt).getTime();
      });
      
      setProducts(sortedProducts);
    } catch (err) {
      console.error('Failed to load saved products:', err);
      setError('상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearAll = (): void => {
    if (window.confirm('모든 저장한 상품을 삭제하시겠습니까?')) {
      clearSavedProducts();
      setProducts([]);
    }
  };
  
  const formatSavedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Calculate total price of saved products
  const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
  
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Heart className="w-5 h-5 text-pink-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">저장한 상품</h2>
          {savedProducts?.length > 0 && (
            <span className="text-sm text-gray-500">({savedProducts.length})</span>
          )}
        </div>
        
        {savedProducts?.length > 0 && (
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
      ) : !savedProducts?.length ? (
        <div className="py-12 text-center">
          <div className="text-6xl mb-4">💝</div>
          <p className="text-gray-600 mb-4">저장한 상품이 없습니다.</p>
          <p className="text-sm text-gray-500">
            마음에 드는 상품을 찾아 하트를 눌러보세요!
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          {products.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">
                    총 {products.length}개 상품
                  </p>
                  <p className="text-xs text-purple-500 mt-1">
                    예상 총액: {formatPrice(totalPrice)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Open all products in new tabs
                    products.forEach(product => {
                      window.open(product.shopeeLink, '_blank', 'noopener,noreferrer');
                    });
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  쇼피에서 모두 보기
                </button>
              </div>
            </div>
          )}
          
          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const savedInfo = (savedProducts || []).find(sp => sp.productId === product.id);
              return (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} />
                  {savedInfo && (
                    <div className="absolute top-14 left-2 right-2 px-2 py-1 bg-white/90 rounded-lg shadow-sm text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatSavedDate(savedInfo.savedAt)} 저장됨
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Tip */}
          <p className="text-xs text-gray-500 text-center mt-4">
            💡 여러 상품을 한번에 보려면 "쇼피에서 모두 보기"를 클릭하세요.
          </p>
        </>
      )}
    </div>
  );
};