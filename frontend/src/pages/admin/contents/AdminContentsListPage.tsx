import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout, Header } from '@/components/layout';
import { ContentList } from '@/components/admin';
import type { Content } from '@/types/admin';

const AdminContentsListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout
      header={<Header title="Contents" showBack onBack={() => navigate('/admin/dashboard')} />}
    >
      <div className="max-w-7xl mx-auto py-6">
        <ContentList
          onCreateClick={() => navigate('/admin/contents/new')}
          onEditClick={(content: Content) => navigate(`/admin/contents/${content.id}/edit`)}
        />
      </div>
    </PageLayout>
  );
};

export default AdminContentsListPage;
