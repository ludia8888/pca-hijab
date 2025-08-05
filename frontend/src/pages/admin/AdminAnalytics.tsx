import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Clock, Activity } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

const AdminAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');

  // 메트릭 데이터
  const metrics = {
    totalUsers: 1102,
    newUsers: 187,
    avgSessionDuration: '3:42',
    bounceRate: '42.3%'
  };

  // 6월 15일부터 현재까지의 데이터 생성
  const generateUserData = () => {
    const data = [];
    const startDate = new Date('2024-06-15');
    const endDate = new Date();
    
    let currentUsers = 120; // 시작 사용자 수
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const averageGrowthPerDay = (1102 - 120) / totalDays;
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // 급등/급락 패턴 생성
      let variation = Math.random() * 80 - 30; // -30 ~ +50 변동
      
      // 특별한 날짜에 급등 이벤트
      if (d.getDay() === 0 || d.getDay() === 6) { // 주말
        variation += Math.random() * 50;
      }
      
      // 월초에 급등
      if (d.getDate() === 1) {
        variation += Math.random() * 100 + 50;
      }
      
      currentUsers += averageGrowthPerDay + variation;
      currentUsers = Math.max(50, Math.min(currentUsers, 1500)); // 범위 제한
      
      data.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        fullDate: new Date(d),
        users: Math.round(currentUsers),
        newUsers: Math.round(Math.random() * 30 + 10)
      });
    }
    
    // 마지막 날 총 사용자 수를 1102로 조정
    if (data.length > 0) {
      data[data.length - 1].users = 1102;
    }
    
    return data;
  };

  const chartData = generateUserData();
  
  // 날짜 범위에 따른 데이터 필터링
  const getFilteredData = () => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : chartData.length;
    return chartData.slice(-days);
  };

  // 파이 차트 데이터
  const sourceData = [
    { name: '직접 유입', value: 45, color: '#4285F4' },
    { name: '소셜 미디어', value: 30, color: '#34A853' },
    { name: '검색', value: 20, color: '#FBBC04' },
    { name: '기타', value: 5, color: '#EA4335' }
  ];

  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">대시보드</h1>
        <p className="text-gray-600">PCA HIJAB 서비스 분석 리포트</p>
      </div>

      {/* 날짜 선택 */}
      <div className="mb-6 flex items-center gap-4">
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">지난 7일</option>
          <option value="30d">지난 30일</option>
          <option value="90d">지난 90일</option>
          <option value="all">전체 기간</option>
        </select>
      </div>

      {/* 메트릭 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="총 사용자"
          value={metrics.totalUsers.toLocaleString()}
          change="12.5%"
          trend="up"
          icon={<Users className="w-6 h-6 text-blue-600" />}
        />
        <MetricCard
          title="신규 사용자"
          value={metrics.newUsers}
          change="8.3%"
          trend="up"
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
        />
        <MetricCard
          title="평균 세션 시간"
          value={metrics.avgSessionDuration}
          change="5.2%"
          trend="up"
          icon={<Clock className="w-6 h-6 text-blue-600" />}
        />
        <MetricCard
          title="이탈률"
          value={metrics.bounceRate}
          change="2.1%"
          trend="down"
          icon={<Activity className="w-6 h-6 text-blue-600" />}
        />
      </div>

      {/* 메인 차트 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">사용자 추이</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getFilteredData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#4285F4" 
                strokeWidth={2}
                dot={{ fill: '#4285F4', r: 4 }}
                activeDot={{ r: 6 }}
                name="사용자"
              />
              <Line 
                type="monotone" 
                dataKey="newUsers" 
                stroke="#34A853" 
                strokeWidth={2}
                dot={{ fill: '#34A853', r: 4 }}
                activeDot={{ r: 6 }}
                name="신규 사용자"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 하단 차트들 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">사용자 획득 소스</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">인기 페이지</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">/</span>
              <span className="text-sm font-medium">342 방문</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">/upload</span>
              <span className="text-sm font-medium">289 방문</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">/result</span>
              <span className="text-sm font-medium">187 방문</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">/products</span>
              <span className="text-sm font-medium">156 방문</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">/login</span>
              <span className="text-sm font-medium">128 방문</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;