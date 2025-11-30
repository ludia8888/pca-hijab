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
};

const CATEGORY_SECTIONS: CategorySection[] = [
  { id: 'hijab', label: 'Recommended Hijabs', icon: '🧕' },
  { id: 'blush', label: 'Recommended Blushers', icon: '🎨' },
  { id: 'lip', label: 'Recommended Lips', icon: '💄' },
  { id: 'lens', label: 'Recommended Lenses', icon: '👁️' },
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
      if (!pcType) {
        setLoading(false);
        return;
      }
      try {
        const results = await Promise.all(
          CATEGORY_SECTIONS.map(async (cat) => {
            const res = await ProductAPI.getProducts({ category: cat.id, personalColor: pcType });
            return [cat.id, res.data || []] as const;
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
        if (items.length === 0) return null;
        return (
          <div key={section.id} className="bg-white rounded-xl shadow-lg overflow-hidden p-3 mb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1">
              <span className="text-base">{section.icon}</span> {section.label}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {items.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ProductRecommendation;
