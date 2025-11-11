import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShoppingBag, Heart, Share2 } from 'lucide-react';
import { Button, LoadingSpinner, Text } from '@/components/ui';
import { ProductAPI } from '@/services/api/products';
import { useToast } from '@/components/ui';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/useAuthStore';
import { PageLayout } from '@/components/layout';
import { CATEGORY_LABELS, PERSONAL_COLOR_LABELS } from '@/types';
import { getImageUrl, getImageUrls } from '@/utils/imageUrl';

const ProductDetailPage = () => {
  console.log('[ProductDetailPage] Component loaded successfully');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const store = useAppStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  // Debug logging
  console.log('[ProductDetailPage] Store methods:', Object.keys(store));
  console.log('[ProductDetailPage] addViewedProduct type:', typeof store.addViewedProduct);
  
  const { sessionId, toggleSavedProduct, savedProducts } = store;
  const addViewedProduct = store.addViewedProduct || (() => console.warn('addViewedProduct not available'));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      const response = await ProductAPI.getProduct(id);
      return response.data;
    },
    enabled: !!id,
  });

  // Check if product is saved
  const isSaved = savedProducts?.some(sp => sp.productId === id) || false;

  // Add to viewed products when product loads
  useEffect(() => {
    if (!isAuthenticated) return;
    if (product && id) {
      addViewedProduct(id);
    }
  }, [product, id, addViewedProduct, isAuthenticated]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleBuyNow = () => {
    if (product?.shopeeLink) {
      window.open(product.shopeeLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSave = () => {
    if (id) {
      toggleSavedProduct(id);
      addToast({
        type: 'success',
        title: isSaved ? 'Removed from saved list' : 'Added to saved products',
        message: isSaved ? '' : 'You can review it anytime from My Page.'
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name,
      text: `${product?.name} — discover it on mynoor ai!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        addToast({
          type: 'success',
          title: 'Link copied to clipboard'
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (error || !product) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">We couldn’t find this product.</p>
            <Button onClick={() => navigate('/products')}>
              Back to product catalog
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const allImages = [getImageUrl(product.thumbnailUrl), ...getImageUrls(product.detailImageUrls)];

  return (
    <PageLayout noPadding>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <div className="mb-8 lg:mb-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
              <img
                src={allImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative overflow-hidden rounded-lg ${
                      selectedImageIndex === index ? 'ring-2 ring-purple-600' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Name */}
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-3">
                {CATEGORY_LABELS[product.category]}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                <button onClick={handleShare} className="text-gray-500 hover:text-gray-700">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b py-4">
              <p className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Personal Colors */}
            {product.personalColors.length > 0 && (
              <div>
                <Text variant="body-sm" weight="semibold" color="gray" mb="3">Recommended personal colors</Text>
                <div className="flex flex-wrap gap-2">
                  {product.personalColors.map((color) => (
                    <span
                      key={color}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                    >
                      {PERSONAL_COLOR_LABELS[color]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Product description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-6">
              <Button
                variant="solid"
                color="primary"
                size="lg"
                fullWidth
                onClick={handleBuyNow}
                icon={<ShoppingBag className="w-5 h-5" />}
              >
                Shop on Shopee
              </Button>
              
              <Button
                variant={isSaved ? 'outline' : 'ghost'}
                color="primary"
                size="lg"
                fullWidth
                onClick={handleSave}
                icon={<Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />}
              >
                {isSaved ? 'Saved' : 'Save to favorites'}
              </Button>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="mb-2">• Actual product colors may vary depending on your monitor settings.</p>
              <p className="mb-2">• Please review the detailed information on Shopee before purchasing.</p>
              <p>• Personal color results are a guide—always choose what you love.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageLayout>
  );
};

export default ProductDetailPage;
