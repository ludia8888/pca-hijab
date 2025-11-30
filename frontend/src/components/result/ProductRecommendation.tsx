import React from 'react';
import { Loader2 } from 'lucide-react';
import type { Product, ProductCategory, PersonalColorType } from '@/types';
import { ProductAPI } from '@/services/api/products';
import { ProductCard } from '@/components/products';

interface ProductRecommendationProps {
  personalColorEn: string;
}

type CategorySection = {
  id: ProductCategory;
  label: string;
  icon: string;
  emptyMessage: string;
};

const CATEGORY_SECTIONS: CategorySection[] = [
  { id: 'hijab', label: 'Recommended Hijabs', icon: '🧕', emptyMessage: '등록된 히잡 상품이 없습니다.' },
  { id: 'blush', label: 'Recommended Blushers', icon: '🎨', emptyMessage: '등록된 블러셔 상품이 없습니다.' },
  { id: 'lip', label: 'Recommended Lips', icon: '💄', emptyMessage: '등록된 립 상품이 없습니다.' },
  { id: 'lens', label: 'Recommended Lenses', icon: '👁️', emptyMessage: '등록된 렌즈 상품이 없습니다.' },
];

const mapPersonalColor = (personalColorEn: string): PersonalColorType | null => {
  const colorMapping: Record<string, PersonalColorType> = {
    spring: 'spring_warm',
    autumn: 'autumn_warm',
    summer: 'summer_cool',
    winter: 'winter_cool',
    'spring warm': 'spring_warm',
    'autumn warm': 'autumn_warm',
    'summer cool': 'summer_cool',
    'winter cool': 'winter_cool',
  };

  const lower = personalColorEn.toLowerCase();
  if (colorMapping[lower]) return colorMapping[lower];

  const match = lower.match(/(spring|summer|autumn|winter)/);
  if (match) return colorMapping[match[1]];
  return null;
};

export const ProductRecommendation: React.FC<ProductRecommendationProps> = ({ personalColorEn }) => {
  const [recommendations, setRecommendations] = React.useState<Record<ProductCategory, Product[]>>({
    hijab: [],
    blush: [],
    lip: [],
    lens: [],
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async (): Promise<void> => {
      const pcType = mapPersonalColor(personalColorEn);
      try {
        const results = await Promise.all(
          CATEGORY_SECTIONS.map(async (cat) => {
            // 1) 시도: 개인색 + 카테고리
            let items: Product[] = [];
            try {
              const res = await ProductAPI.getProducts(pcType ? { category: cat.id, personalColor: pcType } : { category: cat.id });
              items = res.data || [];
            } catch (e) {
              items = [];
            }
            // 2) 개인색 필터로 0개면, 카테고리만으로 재시도
            if (items.length === 0) {
              try {
                const resAll = await ProductAPI.getProducts({ category: cat.id });
                items = resAll.data || [];
              } catch (e) {
                items = [];
              }
            }
            return [cat.id, items] as const;
          })
        );
        const next: Record<ProductCategory, Product[]> = {
          hijab: [],
          blush: [],
          lip: [],
          lens: [],
        };
        results.forEach(([cat, items]) => {
          next[cat] = items;
        });
        setRecommendations(next);
      } catch (err) {
        console.error('[ProductRecommendation] Failed to load recommendations', err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [personalColorEn]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden p-4 mb-4 flex items-center gap-2 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
        <span>Loading recommendations...</span>
      </div>
    );
  }

  return (
    <>
      {CATEGORY_SECTIONS.map((section) => {
        const items = recommendations[section.id] || [];
        return (
          <div key={section.id} className="bg-white rounded-xl shadow-lg overflow-hidden p-3 mb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1">
              <span className="text-base">{section.icon}</span> {section.label}
            </h3>
            {items.length === 0 ? (
              <p className="text-sm text-gray-500 px-1 py-4">{section.emptyMessage}</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {items.slice(0, 6).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default ProductRecommendation;
