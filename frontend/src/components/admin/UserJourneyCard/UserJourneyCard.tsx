import React from 'react';
import { 
  User, 
  Calendar, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  TrendingUp,
  Target
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import type { UnifiedUserView, AdminActionType } from '@/types/admin';

interface UserJourneyCardProps {
  user: UnifiedUserView;
  onAction: (user: UnifiedUserView, action: AdminActionType) => void;
  compact?: boolean;
  showAllActions?: boolean;
}

const UserJourneyCard: React.FC<UserJourneyCardProps> = ({
  user,
  onAction,
  compact = false,
  showAllActions = false
}) => {
  // 우선순위별 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 여정 상태별 아이콘과 색상
  const getJourneyStatusDisplay = (status: string) => {
    switch (status) {
      case 'just_started':
        return { 
          icon: <User className="w-4 h-4" />, 
          text: '방금 가입', 
          color: 'text-gray-600' 
        };
      case 'diagnosis_pending':
        return { 
          icon: <Clock className="w-4 h-4" />, 
          text: '진단 대기', 
          color: 'text-yellow-600' 
        };
      case 'diagnosis_done':
        return { 
          icon: <CheckCircle className="w-4 h-4" />, 
          text: '진단 완료', 
          color: 'text-green-600' 
        };
      case 'recommendation_requested':
        return { 
          icon: <Target className="w-4 h-4" />, 
          text: '추천 요청됨', 
          color: 'text-blue-600' 
        };
      case 'recommendation_processing':
        return { 
          icon: <Sparkles className="w-4 h-4" />, 
          text: '추천 작업 중', 
          color: 'text-purple-600' 
        };
      case 'recommendation_completed':
        return { 
          icon: <CheckCircle className="w-4 h-4" />, 
          text: '추천 완료', 
          color: 'text-green-600' 
        };
      case 'inactive':
        return { 
          icon: <AlertTriangle className="w-4 h-4" />, 
          text: '비활성', 
          color: 'text-red-600' 
        };
      default:
        return { 
          icon: <User className="w-4 h-4" />, 
          text: '알 수 없음', 
          color: 'text-gray-600' 
        };
    }
  };

  // 퍼스널 컬러 배지 색상
  const getPersonalColorBadge = (season: string) => {
    switch (season) {
      case 'spring': return 'bg-pink-100 text-pink-800';
      case 'summer': return 'bg-blue-100 text-blue-800';
      case 'autumn': return 'bg-orange-100 text-orange-800';
      case 'winter': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 추천 액션 버튼
  const getSuggestedActionButton = () => {
    const actionContext = getUserActionContext();
    if (!actionContext.suggestedAction) return null;

    const getActionDisplay = (action: AdminActionType) => {
      switch (action) {
        case 'send_diagnosis_reminder':
          return { text: '진단 독려', color: 'bg-yellow-600 hover:bg-yellow-700' };
        case 'send_recommendation_offer':
          return { text: '추천 제안', color: 'bg-blue-600 hover:bg-blue-700' };
        case 'start_recommendation_process':
          return { text: '추천 시작', color: 'bg-purple-600 hover:bg-purple-700' };
        case 'complete_recommendation':
          return { text: '추천 완료', color: 'bg-green-600 hover:bg-green-700' };
        case 'send_reactivation_message':
          return { text: '재활성화', color: 'bg-indigo-600 hover:bg-indigo-700' };
        default:
          return { text: '처리하기', color: 'bg-gray-600 hover:bg-gray-700' };
      }
    };

    const actionDisplay = getActionDisplay(actionContext.suggestedAction);

    return (
      <Button
        size="sm"
        className={`text-white ${actionDisplay.color}`}
        onClick={() => onAction(user, actionContext.suggestedAction!)}
      >
        {actionDisplay.text}
      </Button>
    );
  };

  // 액션 컨텍스트 생성 (실제로는 UserJourneyService에서 가져와야 함)
  const getUserActionContext = () => {
    // 임시 구현 - 실제로는 UserJourneyService.getActionContext 사용
    const availableActions: AdminActionType[] = [];
    let suggestedAction: AdminActionType | undefined;

    switch (user.journeyStatus) {
      case 'recommendation_requested':
        suggestedAction = 'start_recommendation_process';
        break;
      case 'recommendation_processing':
        suggestedAction = 'complete_recommendation';
        break;
      case 'diagnosis_done':
        suggestedAction = 'send_recommendation_offer';
        break;
      case 'just_started':
        if (user.insights.daysSinceLastActivity > 3) {
          suggestedAction = 'send_diagnosis_reminder';
        }
        break;
    }

    return { availableActions, suggestedAction };
  };

  const journeyDisplay = getJourneyStatusDisplay(user.journeyStatus);

  if (compact) {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(user.priority)}`}>
                {user.priority}
              </span>
              <span className={`flex items-center gap-1 text-sm font-medium ${journeyDisplay.color}`}>
                {journeyDisplay.icon}
                {journeyDisplay.text}
              </span>
            </div>
            
            <div>
              <p className="font-medium text-gray-900">@{user.instagramId}</p>
              {user.personalColor && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPersonalColorBadge(user.personalColor.season)}`}>
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
            {getSuggestedActionButton()}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
            {user.instagramId.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">@{user.instagramId}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`flex items-center gap-1 text-sm font-medium ${journeyDisplay.color}`}>
                {journeyDisplay.icon}
                {journeyDisplay.text}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(user.priority)}`}>
                {user.priority}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">
            {user.insights.daysSinceLastActivity === 0 
              ? '오늘 활동' 
              : `${user.insights.daysSinceLastActivity}일 전 활동`
            }
          </p>
          {user.insights.isNewUser && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
              신규 사용자
            </span>
          )}
        </div>
      </div>

      {/* 퍼스널 컬러 정보 */}
      {user.personalColor && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">퍼스널 컬러</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getPersonalColorBadge(user.personalColor.season)}`}>
                {user.personalColor.seasonKo} ({user.personalColor.season})
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">신뢰도</p>
              <p className="text-sm font-semibold">{Math.round(user.personalColor.confidence * 100)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* 추천 정보 */}
      {user.recommendation && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-700">히잡 추천</p>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              user.recommendation.status === 'completed' ? 'bg-green-100 text-green-800' :
              user.recommendation.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {user.recommendation.status === 'completed' ? '완료' :
               user.recommendation.status === 'processing' ? '처리 중' : '대기'}
            </span>
          </div>
          {user.recommendation.preferences.style && (
            <p className="text-xs text-gray-600">
              선호 스타일: {user.recommendation.preferences.style.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* 인사이트 알림 */}
      {(user.insights.isAtRisk || user.insights.hasStalled) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <div>
              {user.insights.isAtRisk && (
                <p className="text-sm text-red-700">이탈 위험: 진단만 받고 추천 요청 안함</p>
              )}
              {user.insights.hasStalled && (
                <p className="text-sm text-red-700">프로세스 중단: 오랫동안 진행 없음</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getSuggestedActionButton()}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAction(user, 'add_note')}
          >
            노트 추가
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => {/* 상세 보기 */}}
        >
          상세보기
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default UserJourneyCard;