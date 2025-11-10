import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Filter, MoreVertical, ExternalLink } from 'lucide-react';
import { Button, Card, Input, LoadingSpinner, ConfirmModal } from '@/components/ui';
import { useToast } from '@/components/ui';
import { ProductAPI } from '@/services/api/admin';
import { useAdminStore } from '@/store/useAdminStore';
import type { Product, ProductCategory, PersonalColorType } from '@/types/admin';
import { CATEGORY_LABELS, PERSONAL_COLOR_LABELS } from '@/types/admin';
import { getImageUrl } from '@/utils/imageUrl';

interface ProductListProps {
  onCreateClick: () => void;
  onEditClick: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ onCreateClick, onEditClick }) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { filters, setFilters } = useAdminStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: () => ProductAPI.products.getAll(filters),
    retry: 1
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ProductAPI.products.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      addToast({
        type: 'success',
        title: 'Product deleted',
        message: 'The product was removed successfully.'
      });
      setDeleteConfirmId(null);
    },
    onError: () => {
      addToast({
        type: 'error',
        title: 'Deletion failed',
        message: 'Something went wrong while deleting the product.'
      });
    }
  });

  // Filter products by search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle category filter
  const handleCategoryFilter = useCallback((category?: ProductCategory) => {
    setFilters({ ...filters, category });
  }, [filters, setFilters]);

  // Handle personal color filter
  const handlePersonalColorFilter = useCallback((personalColor?: PersonalColorType) => {
    setFilters({ ...filters, personalColor });
  }, [filters, setFilters]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, [setFilters]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600 mb-4">Failed to load the product list.</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })}>
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product management</h2>
        <Button onClick={onCreateClick} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name..."
              className="pl-10"
            />
          </div>
          
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={!filters.category ? 'default' : 'ghost'}
                  onClick={() => handleCategoryFilter(undefined)}
                >
                  All
                </Button>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={filters.category === value ? 'default' : 'ghost'}
                    onClick={() => handleCategoryFilter(value as ProductCategory)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Personal color</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={!filters.personalColor ? 'default' : 'ghost'}
                  onClick={() => handlePersonalColorFilter(undefined)}
                >
                  All
                </Button>
                {Object.entries(PERSONAL_COLOR_LABELS).map(([value, label]) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={filters.personalColor === value ? 'default' : 'ghost'}
                    onClick={() => handlePersonalColorFilter(value as PersonalColorType)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                Reset filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Product Count */}
      <div className="text-sm text-gray-600">
        Total {filteredProducts.length} products
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No products have been added yet.</p>
          <Button onClick={onCreateClick}>Add the first product</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative aspect-square">
                <img
                  src={getImageUrl(product.thumbnailUrl)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {!product.isActive && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">Inactive</span>
                  </div>
                )}
                
                {/* Action Menu */}
                <div className="absolute top-2 right-2">
                  <div className="relative group">
                    <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <button
                        onClick={() => onEditClick(product)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(product.id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500">{CATEGORY_LABELS[product.category]}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-purple-600">
                    Rp {product.price.toLocaleString('id-ID')}
                  </span>
                  {product.shopeeLink && (
                    <a
                      href={product.shopeeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Shopee
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {product.personalColors.map((color) => (
                    <span
                      key={color}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                    >
                      {PERSONAL_COLOR_LABELS[color]}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
        title="Delete product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
