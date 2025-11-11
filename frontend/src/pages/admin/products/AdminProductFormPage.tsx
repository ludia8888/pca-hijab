import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout';
import { ProductForm } from '@/components/admin';
import { ProductAPI } from '@/services/api/admin';

const AdminProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ['admin', 'products', id],
    queryFn: () => (id ? ProductAPI.products.getById(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto py-6">
        <ProductForm
          product={product}
          onSuccess={() => navigate('/admin/products', { replace: true })}
          onCancel={() => navigate('/admin/products', { replace: true })}
        />
        {isLoading && (
          <div className="text-center text-gray-500 mt-4">Loading...</div>
        )}
      </div>
    </PageLayout>
  );
};

export default AdminProductFormPage;

