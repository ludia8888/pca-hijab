import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CheckCircle2, XCircle, User as UserIcon, Shield } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { AdminAPI } from '@/services/api/admin';

type Role = 'user' | 'admin' | 'content_manager';

export const UsersList: React.FC = () => {
  const [q, setQ] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [verified, setVerified] = useState<'' | 'true' | 'false'>('');

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ['admin', 'users', q, role, verified],
    queryFn: () => AdminAPI.users.getAll({ q, role: role || undefined, verified: verified === '' ? undefined : verified === 'true', page: 1, limit: 50 }),
  });

  const total = data.length;

  const rows = useMemo(() => data, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-purple-600" /> 고객 관리
        </h2>
        <div className="text-sm text-gray-600">총 {total}명</div>
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이메일/이름 검색" className="pl-10" />
          </div>
          <div className="flex gap-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role | '')}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">전체 역할</option>
              <option value="user">user</option>
              <option value="content_manager">content_manager</option>
              <option value="admin">admin</option>
            </select>
            <select
              value={verified}
              onChange={(e) => setVerified(e.target.value as any)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">이메일 인증 전체</option>
              <option value="true">인증됨</option>
              <option value="false">미인증</option>
            </select>
            <Button variant="ghost" onClick={() => { setQ(''); setRole(''); setVerified(''); }}>초기화</Button>
            <Button onClick={() => refetch()}>검색</Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">인증</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최근 로그인</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">불러오는 중...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">등록된 사용자가 없습니다.</td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.fullName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex items-center gap-1">
                      <Shield className="w-4 h-4 text-gray-400" /> {u.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {u.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4" /> 인증</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500"><XCircle className="w-4 h-4" /> 미인증</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(u.createdAt).toLocaleString('ko-KR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('ko-KR') : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

