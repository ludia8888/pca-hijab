import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, Plus, AlertCircle, Link } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useToast } from '@/components/ui';
import { ProductAPI } from '@/services/api/admin';
import { useAdminStore } from '@/store/useAdminStore';
import type { Product, ProductFormData, ProductCategory, PersonalColorType } from '@/types/admin';
import { CATEGORY_LABELS, PERSONAL_COLOR_LABELS } from '@/types/admin';
import { getImageUrl } from '@/utils/imageUrl';

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { setUploadingImages, setUploadProgress } = useAdminStore();
  
  // 가격 포매팅 함수 (인도네시아 루피아)
  const formatPrice = (value: number): string => {
    return value ? value.toLocaleString('id-ID') : '';
  };
  
  // 포매팅된 가격에서 숫자만 추출
  const parsePrice = (value: string): number => {
    return Number(value.replace(/[^0-9]/g, ''));
  };

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    category: product?.category || 'hijab',
    price: product?.price || 0,
    thumbnailUrl: product?.thumbnailUrl || '',
    detailImageUrls: product?.detailImageUrls || [],
    personalColors: product?.personalColors || [],
    description: product?.description || '',
    shopeeLink: product?.shopeeLink || '',
    isActive: product?.isActive ?? true
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string>(product ? getImageUrl(product.thumbnailUrl) : '');
  const [detailPreviews, setDetailPreviews] = useState<string[]>(product ? product.detailImageUrls.map(url => getImageUrl(url)) : []);
  const [displayPrice, setDisplayPrice] = useState<string>(formatPrice(product?.price || 0));

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: ProductAPI.upload.single,
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: '이미지 업로드 완료',
        message: '이미지가 성공적으로 업로드되었습니다.'
      });
      return data;
    },
    onError: () => {
      addToast({
        type: 'error',
        title: '업로드 실패',
        message: '이미지 업로드 중 오류가 발생했습니다.'
      });
    }
  });

  // Product create/update mutation
  const productMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (product) {
        return ProductAPI.products.update(product.id, data);
      } else {
        return ProductAPI.products.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      addToast({
        type: 'success',
        title: product ? '상품 수정 완료' : '상품 등록 완료',
        message: product ? '상품이 성공적으로 수정되었습니다.' : '상품이 성공적으로 등록되었습니다.'
      });
      onSuccess?.();
    },
    onError: () => {
      addToast({
        type: 'error',
        title: '저장 실패',
        message: '상품 저장 중 오류가 발생했습니다.'
      });
    }
  });

  // Handle thumbnail upload
  const handleThumbnailUpload = useCallback(async (file: File) => {
    setUploadingImages(true);
    try {
      const result = await uploadImageMutation.mutateAsync(file);
      setFormData(prev => ({ ...prev, thumbnailUrl: result.url }));
      setThumbnailPreview(URL.createObjectURL(file));
    } finally {
      setUploadingImages(false);
    }
  }, [uploadImageMutation, setUploadingImages]);

  // Handle detail images upload
  const handleDetailImagesUpload = useCallback(async (files: FileList) => {
    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadImageMutation.mutateAsync(file));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.url);
      
      setFormData(prev => ({
        ...prev,
        detailImageUrls: [...prev.detailImageUrls, ...newUrls]
      }));
      
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setDetailPreviews(prev => [...prev, ...newPreviews]);
    } finally {
      setUploadingImages(false);
    }
  }, [uploadImageMutation, setUploadingImages]);

  // Remove detail image
  const removeDetailImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      detailImageUrls: prev.detailImageUrls.filter((_, i) => i !== index)
    }));
    setDetailPreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Toggle personal color
  const togglePersonalColor = useCallback((color: PersonalColorType) => {
    setFormData(prev => ({
      ...prev,
      personalColors: prev.personalColors.includes(color)
        ? prev.personalColors.filter(c => c !== color)
        : [...prev.personalColors, color]
    }));
  }, []);

  // Handle form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.thumbnailUrl || formData.personalColors.length === 0) {
      addToast({
        type: 'error',
        title: '입력 오류',
        message: '필수 항목을 모두 입력해주세요.'
      });
      return;
    }
    
    // Validate Shopee link format if provided
    if (formData.shopeeLink && !formData.shopeeLink.includes('shopee')) {
      addToast({
        type: 'error',
        title: '유효하지 않은 링크',
        message: '쇼피 링크를 입력해주세요.'
      });
      return;
    }

    // Log the data being sent
    console.log('[ProductForm] Submitting product data:', formData);
    console.log('[ProductForm] Data type check:', {
      name: typeof formData.name,
      category: formData.category,
      price: formData.price,
      personalColors: formData.personalColors,
      shopeeLink: formData.shopeeLink,
      shopeeLink_type: typeof formData.shopeeLink
    });

    productMutation.mutate(formData);
  }, [formData, productMutation, addToast]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상품명 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="상품명을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ProductCategory }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가격 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={displayPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value.replace(/[^0-9]/g, '');
                    
                    // 숫자만 입력 가능
                    if (numericValue === '' || /^\d+$/.test(numericValue)) {
                      const price = numericValue ? Number(numericValue) : 0;
                      setFormData(prev => ({ ...prev, price }));
                      setDisplayPrice(formatPrice(price));
                    }
                  }}
                  onBlur={() => {
                    // 포커스를 잃으면 포매팅 다시 적용
                    setDisplayPrice(formatPrice(formData.price));
                  }}
                  placeholder="가격을 입력하세요"
                  required
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  Rp
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                쇼피 링크
              </label>
              <div className="relative">
                <Input
                  type="url"
                  value={formData.shopeeLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, shopeeLink: e.target.value }))}
                  placeholder="https://shopee.sg/..."
                  className="pl-10"
                />
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상품 설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="상품 설명을 입력하세요"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </Card>

      {/* Personal Colors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          추천 퍼스널 컬러 <span className="text-red-500">*</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(PERSONAL_COLOR_LABELS).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={formData.personalColors.includes(value as PersonalColorType)}
                onChange={() => togglePersonalColor(value as PersonalColorType)}
                className="mr-3"
              />
              <span className="text-sm font-medium">{label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Thumbnail Image */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          썸네일 이미지 <span className="text-red-500">*</span>
        </h3>
        
        <div className="space-y-4">
          {thumbnailPreview ? (
            <div className="relative inline-block">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-48 h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
                  setThumbnailPreview('');
                }}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">이미지 업로드</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
          )}
        </div>
      </Card>

      {/* Detail Images */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">상세 이미지</h3>
        
        <div className="grid grid-cols-4 gap-4">
          {detailPreviews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview}
                alt={`Detail ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeDetailImage(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {detailPreviews.length < 10 && (
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
              <Plus className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">추가</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleDetailImagesUpload(e.target.files)}
                className="hidden"
              />
            </label>
          )}
        </div>
        
        {detailPreviews.length >= 10 && (
          <p className="text-sm text-gray-500 mt-2">최대 10개까지 업로드 가능합니다.</p>
        )}
      </Card>

      {/* Status */}
      <Card className="p-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="mr-3"
          />
          <span className="font-medium">상품 활성화</span>
        </label>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={productMutation.isPending || uploadImageMutation.isPending}
        >
          {productMutation.isPending ? '저장 중...' : (product ? '수정' : '등록')}
        </Button>
      </div>
    </form>
  );
};