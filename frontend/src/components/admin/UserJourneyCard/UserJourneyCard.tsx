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
  ShirtIcon,
  X,
  Trash2
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import type { UnifiedUserView, UserJourneyStatus, Priority, MessageType } from '@/types/admin';

interface UserJourneyCardProps {
  user: UnifiedUserView;
  onStatusChange?: (user: UnifiedUserView, newStatus: UserJourneyStatus) => void;
  onPriorityChange?: (user: UnifiedUserView, newPriority: Priority) => void;
  onMessageToggle?: (user: UnifiedUserView, messageType: MessageType, sent: boolean) => void;
  onEscalatePriority?: () => void;
  onDelete?: (user: UnifiedUserView) => void;
  isSelected?: boolean;
  onSelect?: (userId: string) => void;
  compact?: boolean;
  onViewDetail?: (user: UnifiedUserView) => void;
}

const UserJourneyCardComponent: React.FC<UserJourneyCardProps> = ({
  user,
  onStatusChange,
  onPriorityChange,
  onMessageToggle,
  onEscalatePriority,
  onDelete,
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
      case 'offer_sent': return 60;
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
      'offer_sent': { icon: Send, label: 'DM 발송됨', color: 'text-blue-600' },
      'recommendation_requested': { icon: Target, label: '추천 요청', color: 'text-blue-600' },
      'recommendation_processing': { icon: Sparkles, label: '추천 작업 중', color: 'text-purple-600' },
      'recommendation_completed': { icon: CheckCircle, label: '추천 완료', color: 'text-green-600' },
      'inactive': { icon: AlertTriangle, label: '비활성', color: 'text-red-600' }
    };
    
    return statusMap[user.journeyStatus] || statusMap['just_started'];
  }, [user.journeyStatus]);



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
              <div className="flex items-center gap-2 mt-1">
                {user.personalColor && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium journey-${user.personalColor.season}`}>
                    {user.personalColor.seasonKo}
                  </span>
                )}
                {user.recommendation && user.recommendation.preferences.style && (
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <ShirtIcon className="w-3 h-3" />
                    {user.recommendation.preferences.style.slice(0, 2).join(', ')}
                    {user.recommendation.preferences.style.length > 2 && '...'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.insights.daysSinceLastActivity > 0 && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {user.insights.daysSinceLastActivity}일 전
              </span>
            )}
            
            {/* 주요 액션 버튼 */}
            {user.journeyStatus === 'recommendation_requested' && onStatusChange && (
              <Button
                size="sm"
                className="action-suggested bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => onStatusChange(user, 'recommendation_processing')}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                추천 시작
              </Button>
            )}
            
            {/* DM 발송 상태 토글 (컴팩트) */}
            {(user.journeyStatus === 'diagnosis_done' || user.journeyStatus === 'offer_sent') && onStatusChange && (
              <label className="flex items-center gap-2 px-2 py-1 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={user.journeyStatus === 'offer_sent'}
                  onChange={(e) => {
                    onStatusChange(user, e.target.checked ? 'offer_sent' : 'diagnosis_done');
                  }}
                  className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                />
                <Send className={`w-3 h-3 ${user.journeyStatus === 'offer_sent' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`text-xs ${user.journeyStatus === 'offer_sent' ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                  DM
                </span>
              </label>
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

        {/* 추천 정보 - MVP 핵심 정보 표시 */}
        {user.recommendation && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <ShirtIcon className="w-4 h-4" />
                히잡 추천 요청
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
            
            {/* 사용자 입력 정보 상세 표시 */}
            <div className="space-y-2">
              {user.recommendation.preferences.style && user.recommendation.preferences.style.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600">선호 스타일</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {user.recommendation.preferences.style.map((style, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {user.recommendation.preferences.priceRange && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-600">가격대:</p>
                  <p className="text-xs font-medium text-gray-900">{user.recommendation.preferences.priceRange}</p>
                </div>
              )}
              
              {user.recommendation.preferences.occasions && user.recommendation.preferences.occasions.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600">착용 상황</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {user.recommendation.preferences.occasions.map((occasion, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {occasion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
          {/* DM 발송 상태 토글 */}
          {(user.journeyStatus === 'diagnosis_done' || user.journeyStatus === 'offer_sent') && onStatusChange && (
            <div className="w-full">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={user.journeyStatus === 'offer_sent'}
                  onChange={(e) => {
                    onStatusChange(user, e.target.checked ? 'offer_sent' : 'diagnosis_done');
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex items-center gap-2">
                  <Send className={`w-4 h-4 ${user.journeyStatus === 'offer_sent' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${user.journeyStatus === 'offer_sent' ? 'text-blue-700' : 'text-gray-600'}`}>
                    추천 제안 DM 발송됨
                  </span>
                </div>
                {user.journeyStatus === 'offer_sent' && (
                  <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    발송 완료
                  </span>
                )}
              </label>
            </div>
          )}
          
          {/* 주요 액션 */}
          {user.journeyStatus === 'recommendation_requested' && onStatusChange && (
            <Button
              size="sm"
              className="action-suggested bg-purple-600 hover:bg-purple-700 text-white flex-1"
              onClick={() => onStatusChange(user, 'recommendation_processing')}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              추천 시작
            </Button>
          )}
          
          {user.journeyStatus === 'recommendation_processing' && onStatusChange && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
              onClick={() => onStatusChange(user, 'recommendation_completed')}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              추천 완료
            </Button>
          )}

          {/* 보조 액션 */}
          {showActions && (
            <>
              {/* 노트 기능은 백엔드 구현 후 활성화
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // TODO: Implement note adding functionality
                  console.log('Add note for user:', user.id);
                }}
                className="text-gray-600"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                노트
              </Button>
              */}
              
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
              
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (window.confirm(`@${user.instagramId} 사용자를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
                      onDelete(user);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
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
    prevProps.onStatusChange === nextProps.onStatusChange &&
    prevProps.onPriorityChange === nextProps.onPriorityChange &&
    prevProps.onMessageToggle === nextProps.onMessageToggle &&
    prevProps.onSelect === nextProps.onSelect &&
    prevProps.onViewDetail === nextProps.onViewDetail
  );
});