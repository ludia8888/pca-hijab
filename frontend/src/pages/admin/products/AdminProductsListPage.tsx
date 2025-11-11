import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout, Header } from '@/components/layout';
import { ProductList } from '@/components/admin';

const AdminProductsListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout
      header={<Header title="Products" showBack onBack={() => navigate('/admin/dashboard')} />}
    >
      <div className="max-w-7xl mx-auto py-6">
        <ProductList
          onCreateClick={() => navigate('/admin/products/new')}
          onEditClick={(product) => navigate(`/admin/products/${product.id}/edit`)}
        />
      </div>
    </PageLayout>
  );
};

export default AdminProductsListPage;
