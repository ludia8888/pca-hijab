import React from 'react';
import { Calendar, BarChart3, Users } from 'lucide-react';
import { Card } from '@/components/ui';

const AdminLoadingState: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-gray-300 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-24 bg-gray-200 rounded" />
          <div className="h-9 w-24 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {[Calendar, BarChart3, Users].map((Icon, index) => (
            <div key={index} className="py-2 px-1 flex items-center gap-2">
              <Icon className="w-4 h-4 text-gray-400" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        {/* Stat Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-8 w-24 bg-gray-300 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </Card>
          ))}
        </div>

        {/* User Cards */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full" />
                  <div>
                    <div className="h-5 w-32 bg-gray-300 rounded mb-2" />
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-9 w-24 bg-gray-200 rounded" />
              </div>
              <div className="h-2 w-full bg-gray-200 rounded" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminLoadingState;