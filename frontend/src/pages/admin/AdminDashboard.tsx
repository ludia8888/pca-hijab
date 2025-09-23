import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, FileText, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { PageLayout } from '@/components/layout';
import { ProductForm, ProductList, ContentForm, ContentList, AdminLoadingState } from '@/components/admin';
import { useAdminStore } from '@/store/useAdminStore';
import AdminAnalytics from './AdminAnalytics';
import type { Product, Content } from '@/types/admin';

type TabType = 'products' | 'contents' | 'analytics';
type ViewMode = 'list' | 'create' | 'edit';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, setApiKey } = useAdminStore();
  
  // Auto-set API key on mount (bypass login)
  useEffect(() => {
    // Use the actual API key from Render environment
    setApiKey('6TQvZTz1ohwmS0PYCe4e8CRgR/MTWTlJZ711ntaZ7yw=');
  }, [setApiKey]);
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/'); // Go to home instead of login page
  };

  const handleCreateClick = () => {
    setEditingProduct(null);
    setViewMode('create');
  };

  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product);
    setViewMode('edit');
  };

  const handleEditContentClick = (content: Content) => {
    setEditingContent(content);
    setViewMode('edit');
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setEditingProduct(null);
    setEditingContent(null);
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setEditingProduct(null);
    setEditingContent(null);
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">PCA HIJAB 관리자</h1>
                  <p className="text-sm text-gray-500">상품 & 컨텐츠 관리 시스템</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">                
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('products');
                  setViewMode('list');
                  setEditingProduct(null);
                  setEditingContent(null);
                }}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'products'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="w-4 h-4" />
                상품 관리
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('contents');
                  setViewMode('list');
                  setEditingProduct(null);
                  setEditingContent(null);
                }}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'contents'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                컨텐츠 관리
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('analytics');
                  setViewMode('list');
                  setEditingProduct(null);
                  setEditingContent(null);
                }}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'analytics'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                분석
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Product Management */}
          {activeTab === 'products' && (
            <>
              {viewMode === 'list' && (
                <ProductList
                  onCreateClick={handleCreateClick}
                  onEditClick={handleEditProductClick}
                />
              )}
              
              {(viewMode === 'create' || viewMode === 'edit') && (
                <ProductForm
                  product={editingProduct || undefined}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              )}
            </>
          )}

          {/* Content Management */}
          {activeTab === 'contents' && (
            <>
              {viewMode === 'list' && (
                <ContentList
                  onCreateClick={handleCreateClick}
                  onEditClick={handleEditContentClick}
                />
              )}
              
              {(viewMode === 'create' || viewMode === 'edit') && (
                <ContentForm
                  content={editingContent || undefined}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              )}
            </>
          )}
          
          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
              <AdminAnalytics />
            </div>
          )}
        </main>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;