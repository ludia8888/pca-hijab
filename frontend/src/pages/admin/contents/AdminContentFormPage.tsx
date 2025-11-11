import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout';
import { ContentForm } from '@/components/admin';
import { ProductAPI } from '@/services/api/admin';

const AdminContentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: content, isLoading } = useQuery({
    queryKey: ['admin', 'contents', id],
    queryFn: () => (id ? ProductAPI.contents.getById(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto py-6">
        <ContentForm
          content={content}
          onSuccess={() => navigate('/admin/contents', { replace: true })}
          onCancel={() => navigate('/admin/contents', { replace: true })}
        />
        {isLoading && (
          <div className="text-center text-gray-500 mt-4">Loading...</div>
        )}
      </div>
    </PageLayout>
  );
};

export default AdminContentFormPage;

