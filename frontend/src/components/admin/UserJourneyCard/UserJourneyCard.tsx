import React, { useState, useMemo, memo } from 'react';
import { 
  User, 
  Calendar, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  TrendingUp,
  Target,
  MessageCircle,
  Send,
  MoreVertical,
  Instagram,
  Image,
  ShirtIcon
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import type { UnifiedUserView, AdminActionType } from '@/types/admin';

interface UserJourneyCardProps {
  user: UnifiedUserView;
  onAction: (user: UnifiedUserView, action: AdminActionType) => void;
  isSelected?: boolean;
  onSelect?: (userId: string) => void;
  compact?: boolean;
  onViewDetail?: (user: UnifiedUserView) => void;
}

const UserJourneyCardComponent: React.FC<UserJourneyCardProps> = ({
  user,
  onAction,
  isSelected = false,
  onSelect,
  compact = false,
  onViewDetail
}) => {
  const [showActions, setShowActions] = useState(false);

  // Memoize expensive calculations
  const progress = useMemo(() => {
    switch (user.journeyStatus) {
      case 'just_started': return 10;
      case 'diagnosis_pending': return 25;
      case 'diagnosis_done': return 50;
      case 'recommendation_requested': return 70;
      case 'recommendation_processing': return 85;
      case 'recommendation_completed': return 100;
      default: return 0;
    }
  }, [user.journeyStatus]);

  const priorityClasses = useMemo(() => {
    switch (user.priority) {
      case 'urgent': 
        return {
          card: 'border-red-300 bg-red-50/50',
          badge: 'bg-red-100 text-red-800 border-red-200',
          pulse: 'pulse-urgent'
        };
      case 'high': 
        return {
          card: 'border-orange-200 bg-orange-50/30',
          badge: 'bg-orange-100 text-orange-800 border-orange-200',
          pulse: ''
        };
      case 'medium': 
        return {
          card: 'border-yellow-200 bg-yellow-50/20',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          pulse: ''
        };
      default: 
        return {
          card: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          pulse: ''
        };
    }
  }, [user.priority]);

  const journeyInfo = useMemo(() => {
    const statusMap = {
      'just_started': { icon: User, label: '방금 가입', color: 'text-gray-600' },
      'diagnosis_pending': { icon: Clock, label: '진단 대기', color: 'text-yellow-600' },
      'diagnosis_done': { icon: CheckCircle, label: '진단 완료', color: 'text-green-600' },
      'recommendation_requested': { icon: Target, label: '추천 요청', color: 'text-blue-600' },
      'recommendation_processing': { icon: Sparkles, label: '추천 작업 중', color: 'text-purple-600' },
      'recommendation_completed': { icon: CheckCircle, label: '추천 완료', color: 'text-green-600' },
      'inactive': { icon: AlertTriangle, label: '비활성', color: 'text-red-600' }
    };
    
    return statusMap[user.journeyStatus] || statusMap['just_started'];
  }, [user.journeyStatus]);

  // 액션 매핑
  const getActionInfo = (action: AdminActionType) => {
    const actionMap = {
      'send_diagnosis_reminder': { 
        label: '진단 독려', 
        icon: MessageCircle, 
        color: 'text-yellow-600 hover:text-yellow-700' 
      },
      'send_recommendation_offer': { 
        label: '추천 제안', 
        icon: ShirtIcon, 
        color: 'text-blue-600 hover:text-blue-700' 
      },
      'start_recommendation_process': { 
        label: '추천 시작', 
        icon: Sparkles, 
        color: 'text-purple-600 hover:text-purple-700' 
      },
      'complete_recommendation': { 
        label: '추천 완료', 
        icon: CheckCircle, 
        color: 'text-green-600 hover:text-green-700' 
      },
      'send_reactivation_message': { 
        label: '재활성화', 
        icon: TrendingUp, 
        color: 'text-indigo-600 hover:text-indigo-700' 
      },
      'add_note': { 
        label: '노트', 
        icon: MessageCircle, 
        color: 'text-gray-600 hover:text-gray-700' 
      }
    };
    
    return actionMap[action] || { label: action, icon: Send, color: 'text-gray-600' };
  };


  // 컴팩트 뷰
  if (compact) {
    return (
      <Card className={`admin-card p-4 ${priorityClasses.card} ${isSelected ? 'selected' : ''} ${priorityClasses.pulse}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {onSelect && (
              <button
                onClick={() => onSelect(user.id)}
                className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center hover:border-purple-500 focus:outline-none"
              >
                {isSelected && <div className="w-3 h-3 bg-purple-500 rounded" />}
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <span className={`status-badge ${priorityClasses.badge}`}>
                {user.priority === 'urgent' && <span className="notification-dot pulse" />}
                {user.priority}
              </span>
              <span className={`flex items-center gap-1 text-sm font-medium ${journeyInfo.color}`}>
                <journeyInfo.icon className="w-4 h-4" />
                {journeyInfo.label}
              </span>
            </div>
            
            <div>
              <p className="font-medium text-gray-900 flex items-center gap-1">
                <Instagram className="w-3 h-3" />
                @{user.instagramId}
              </p>
              {user.personalColor && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 journey-${user.personalColor.season}`}>
                  {user.personalColor.seasonKo}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.insights.daysSinceLastActivity > 0 && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {user.insights.daysSinceLastActivity}일 전
              </span>
            )}
            
            {/* 추천 액션 */}
            {user.journeyStatus === 'recommendation_requested' && (
              <Button
                size="sm"
                className="action-suggested bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => onAction(user, 'start_recommendation_process')}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                추천 시작
              </Button>
            )}
          </div>
        </div>
        
        {/* 진행률 바 */}
        <div className="mt-3">
          <div className="progress-bar" style={{ '--progress': `${progress}%` } as React.CSSProperties} />
        </div>
      </Card>
    );
  }

  // 전체 뷰
  return (
    <Card className={`admin-card ${priorityClasses.card} ${isSelected ? 'selected' : ''} ${priorityClasses.pulse} overflow-hidden`}>
      {/* 카드 헤더 */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {onSelect && (
              <button
                onClick={() => onSelect(user.id)}
                className="w-5 h-5 mt-1 rounded border-2 border-gray-300 flex items-center justify-center hover:border-purple-500"
              >
                {isSelected && <div className="w-3 h-3 bg-purple-500 rounded" />}
              </button>
            )}
            
            {/* 프로필 이미지 또는 아바타 */}
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.instagramId.slice(0, 2).toUpperCase()}
              </div>
              {user.journeyStatus === 'recommendation_completed' && (
                <CheckCircle className="w-5 h-5 absolute -bottom-1 -right-1 text-green-500 bg-white rounded-full" />
              )}
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Instagram className="w-4 h-4 text-gray-400" />
                @{user.instagramId}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`status-badge ${priorityClasses.badge}`}>
                  {user.priority}
                </span>
                <span className={`flex items-center gap-1 text-sm font-medium ${journeyInfo.color}`}>
                  <journeyInfo.icon className="w-4 h-4" />
                  {journeyInfo.label}
                </span>
                {user.insights.isNewUser && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    신규
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 진행률 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">여정 진행률</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div className="progress-bar h-2" style={{ '--progress': `${progress}%` } as React.CSSProperties} />
        </div>
      </div>

      {/* 정보 섹션 */}
      <div className="px-6 pb-6 space-y-4">
        {/* 퍼스널 컬러 */}
        {user.personalColor && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full journey-${user.personalColor.season}`} 
                   style={{ backgroundColor: `var(--journey-color)` }} />
              <div>
                <p className="text-sm font-medium text-gray-700">퍼스널 컬러</p>
                <p className="text-sm text-gray-900">
                  {user.personalColor.seasonKo} ({user.personalColor.season})
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">신뢰도</p>
              <p className="text-sm font-semibold">{Math.round(user.personalColor.confidence * 100)}%</p>
            </div>
          </div>
        )}

        {/* 추천 정보 */}
        {user.recommendation && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <ShirtIcon className="w-4 h-4" />
                히잡 추천
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                user.recommendation.status === 'completed' ? 'bg-green-100 text-green-700' :
                user.recommendation.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {user.recommendation.status === 'completed' ? '완료' :
                 user.recommendation.status === 'processing' ? '처리 중' : '대기'}
              </span>
            </div>
            {user.recommendation.preferences.style && (
              <p className="text-xs text-gray-600">
                선호: {user.recommendation.preferences.style.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* 알림 */}
        {(user.insights.isAtRisk || user.insights.hasStalled) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                {user.insights.isAtRisk && (
                  <p className="text-red-700">이탈 위험 고객입니다</p>
                )}
                {user.insights.hasStalled && (
                  <p className="text-red-700">프로세스가 중단되었습니다</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex flex-wrap gap-2">
          {/* 주요 액션 */}
          {user.journeyStatus === 'recommendation_requested' && (
            <Button
              size="sm"
              className="action-suggested bg-purple-600 hover:bg-purple-700 text-white flex-1"
              onClick={() => onAction(user, 'start_recommendation_process')}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              추천 시작
            </Button>
          )}
          
          {user.journeyStatus === 'diagnosis_done' && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              onClick={() => onAction(user, 'send_recommendation_offer')}
            >
              <ShirtIcon className="w-4 h-4 mr-1" />
              추천 제안
            </Button>
          )}

          {/* 보조 액션 */}
          {showActions && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction(user, 'add_note')}
                className="text-gray-600"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                노트
              </Button>
              
              {onViewDetail && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600"
                  onClick={() => onViewDetail(user)}
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  상세
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 타임라인 정보 (footer) */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          가입: {new Date(user.timeline.registeredAt).toLocaleDateString()}
        </span>
        {user.timeline.recommendationRequestedAt && (
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            추천 요청: {new Date(user.timeline.recommendationRequestedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </Card>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(UserJourneyCardComponent, (prevProps, nextProps) => {
  // Custom comparison function for deep equality check
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.user.journeyStatus === nextProps.user.journeyStatus &&
    prevProps.user.priority === nextProps.user.priority &&
    prevProps.user.insights.daysSinceLastActivity === nextProps.user.insights.daysSinceLastActivity &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.compact === nextProps.compact &&
    // For callbacks, we assume they're stable (wrapped in useCallback)
    prevProps.onAction === nextProps.onAction &&
    prevProps.onSelect === nextProps.onSelect &&
    prevProps.onViewDetail === nextProps.onViewDetail
  );
});