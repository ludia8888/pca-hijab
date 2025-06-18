import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  Users,
  ArrowRight,
  Target
} from 'lucide-react';
import { Card } from '@/components/ui';
import { UserJourneyCard } from '../UserJourneyCard';
import type { TodaysWork as TodaysWorkType, UnifiedUserView } from '@/types/admin';

interface TodaysWorkProps {
  todaysWork: TodaysWorkType;
  onStatusChange?: (user: UnifiedUserView, newStatus: any) => void;
  onViewAll: (category: string) => void;
}

const TodaysWork: React.FC<TodaysWorkProps> = ({
  todaysWork,
  onStatusChange,
  onViewAll
}) => {
  const WorkSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    color: string;
    users: UnifiedUserView[];
    category: string;
    description: string;
    maxShow?: number;
  }> = ({ title, icon, color, users, category, description, maxShow = 3 }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            users.length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {users.length}개
          </span>
          {users.length > maxShow && (
            <button
              onClick={() => onViewAll(category)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              전체보기
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p>처리할 항목이 없습니다</p>
          </div>
        ) : (
          users.slice(0, maxShow).map(user => (
            <UserJourneyCard
              key={user.id}
              user={user}
              onStatusChange={onStatusChange}
              compact
            />
          ))
        )}
        
        {users.length > maxShow && (
          <div className="text-center pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              +{users.length - maxShow}개 더 있음
            </p>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">오늘의 작업</h2>
          <p className="text-gray-600 mt-1">우선 처리가 필요한 항목들</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          업데이트: 방금 전
        </div>
      </div>

      {/* 긴급 처리 섹션 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-600">긴급 처리 필요</h3>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-4">
          <WorkSection
            title="새 추천 요청"
            icon={<Target className="w-5 h-5 text-white" />}
            color="bg-red-600"
            users={todaysWork.urgent.newRecommendationRequests}
            category="newRecommendationRequests"
            description="오늘 들어온 새로운 히잡 추천 요청"
          />
          
          <WorkSection
            title="중단된 프로세스"
            icon={<AlertTriangle className="w-5 h-5 text-white" />}
            color="bg-orange-600"
            users={todaysWork.urgent.stalledProcesses}
            category="stalledProcesses"
            description="진행이 멈춘 사용자들"
          />
          
          <WorkSection
            title="오래 대기 중"
            icon={<Clock className="w-5 h-5 text-white" />}
            color="bg-yellow-600"
            users={todaysWork.urgent.longPendingRequests}
            category="longPendingRequests"
            description="3일 이상 대기 중인 요청"
          />
        </div>
      </div>

      {/* 기회 섹션 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-600">비즈니스 기회</h3>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-4">
          <WorkSection
            title="진단만 받은 사용자"
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            color="bg-blue-600"
            users={todaysWork.opportunities.diagnoseOnlyUsers}
            category="diagnoseOnlyUsers"
            description="추천 서비스 제안 가능한 사용자들"
          />
          
          <WorkSection
            title="재활성화 대상"
            icon={<Users className="w-5 h-5 text-white" />}
            color="bg-purple-600"
            users={todaysWork.opportunities.reactivationTargets}
            category="reactivationTargets"
            description="다시 참여시킬 수 있는 사용자들"
          />
        </div>
      </div>

      {/* 모니터링 섹션 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-600">모니터링</h3>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-4">
          <WorkSection
            title="최근 완료"
            icon={<CheckCircle className="w-5 h-5 text-white" />}
            color="bg-green-600"
            users={todaysWork.monitoring.recentCompletions}
            category="recentCompletions"
            description="최근 일주일 내 완료된 추천"
          />
          
          <WorkSection
            title="신규 가입자"
            icon={<Users className="w-5 h-5 text-white" />}
            color="bg-indigo-600"
            users={todaysWork.monitoring.newSignups}
            category="newSignups"
            description="최근 일주일 내 가입한 사용자"
          />
        </div>
      </div>
    </div>
  );
};

export default TodaysWork;