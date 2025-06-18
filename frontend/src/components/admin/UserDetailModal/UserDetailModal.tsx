import React, { useState } from 'react';
import {
  X,
  Instagram,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Send,
  Image,
  ShirtIcon,
  Target,
  TrendingUp,
  ChevronRight,
  Edit3,
  Tag,
  User,
  Activity,
  Sparkles
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import type { UnifiedUserView, AdminActionType } from '@/types/admin';

interface UserDetailModalProps {
  user: UnifiedUserView;
  isOpen: boolean;
  onClose: () => void;
  onAction: (user: UnifiedUserView, action: AdminActionType) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onAction
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'analysis' | 'notes'>('timeline');
  const [showActionMenu, setShowActionMenu] = useState(false);

  if (!isOpen) return null;

  // 타임라인 이벤트 생성
  const getTimelineEvents = () => {
    const events = [];
    
    // 가입
    events.push({
      date: user.timeline.registeredAt,
      type: 'signup',
      title: '서비스 가입',
      description: '퍼스널 컬러 진단 서비스에 가입했습니다',
      icon: User,
      color: 'bg-gray-100 text-gray-600'
    });

    // 진단
    if (user.timeline.diagnosisAt) {
      events.push({
        date: user.timeline.diagnosisAt,
        type: 'diagnosis',
        title: '퍼스널 컬러 진단 완료',
        description: `${user.personalColor?.seasonKo} 타입으로 진단되었습니다`,
        icon: CheckCircle,
        color: 'bg-green-100 text-green-600'
      });
    }

    // 추천 요청
    if (user.timeline.recommendationRequestedAt) {
      events.push({
        date: user.timeline.recommendationRequestedAt,
        type: 'recommendation_request',
        title: '히잡 추천 요청',
        description: '맞춤 히잡 추천을 요청했습니다',
        icon: Target,
        color: 'bg-blue-100 text-blue-600'
      });
    }

    // 추천 완료
    if (user.timeline.recommendationCompletedAt) {
      events.push({
        date: user.timeline.recommendationCompletedAt,
        type: 'recommendation_complete',
        title: '히잡 추천 완료',
        description: 'Instagram DM으로 추천 결과를 발송했습니다',
        icon: ShirtIcon,
        color: 'bg-purple-100 text-purple-600'
      });
    }

    // 관리자 액션들
    user.actions.forEach(action => {
      events.push({
        date: action.performedAt,
        type: 'admin_action',
        title: action.description,
        description: `관리자: ${action.performedBy}`,
        icon: Edit3,
        color: 'bg-yellow-100 text-yellow-600'
      });
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const timelineEvents = getTimelineEvents();

  // 색상 테마
  const getSeasonTheme = () => {
    switch (user.personalColor?.season) {
      case 'spring': return 'from-pink-400 to-rose-300';
      case 'summer': return 'from-blue-400 to-cyan-300';
      case 'autumn': return 'from-orange-400 to-amber-300';
      case 'winter': return 'from-purple-400 to-indigo-300';
      default: return 'from-gray-400 to-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 백드롭 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform transition-all">
          <Card className="overflow-hidden">
            {/* 헤더 */}
            <div className={`bg-gradient-to-r ${getSeasonTheme()} p-6 text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* 프로필 아바타 */}
                  <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur rounded-full flex items-center justify-center text-2xl font-bold">
                    {user.instagramId.slice(0, 2).toUpperCase()}
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Instagram className="w-6 h-6" />
                      @{user.instagramId}
                    </h2>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur rounded-full text-sm font-medium">
                        {user.journeyStatus === 'recommendation_completed' ? '여정 완료' :
                         user.journeyStatus === 'recommendation_processing' ? '추천 작업 중' :
                         user.journeyStatus === 'recommendation_requested' ? '추천 대기' :
                         user.journeyStatus === 'diagnosis_done' ? '진단 완료' :
                         user.journeyStatus === 'diagnosis_pending' ? '진단 대기' :
                         '시작 단계'}
                      </span>
                      
                      {user.insights.isNewUser && (
                        <span className="px-3 py-1 bg-green-500 bg-opacity-80 rounded-full text-sm font-medium">
                          신규 고객
                        </span>
                      )}
                      
                      {user.priority === 'urgent' && (
                        <span className="px-3 py-1 bg-red-500 bg-opacity-80 rounded-full text-sm font-medium animate-pulse">
                          긴급
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* 핵심 지표 */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{user.insights.daysSinceLastActivity}</p>
                  <p className="text-sm opacity-80">일 전 활동</p>
                </div>
                
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {Math.floor((Date.now() - new Date(user.timeline.registeredAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p className="text-sm opacity-80">일째 회원</p>
                </div>
                
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {user.personalColor ? `${Math.round(user.personalColor.confidence * 100)}%` : '-'}
                  </p>
                  <p className="text-sm opacity-80">진단 신뢰도</p>
                </div>
                
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {user.insights.conversionStage === 'completed' ? '100%' :
                     user.insights.conversionStage === 'recommendation' ? '75%' :
                     user.insights.conversionStage === 'diagnosis' ? '50%' : '25%'}
                  </p>
                  <p className="text-sm opacity-80">전환 진행률</p>
                </div>
              </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                {[
                  { id: 'timeline', label: '활동 타임라인', icon: Activity },
                  { id: 'analysis', label: '분석 & 추천', icon: Sparkles },
                  { id: 'notes', label: '관리자 노트', icon: MessageCircle }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* 탭 콘텐츠 */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  {/* 타임라인 */}
                  <div className="relative">
                    {/* 타임라인 라인 */}
                    <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200" />
                    
                    {/* 이벤트들 */}
                    <div className="space-y-6">
                      {timelineEvents.map((event, index) => (
                        <div key={index} className="flex gap-4">
                          <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${event.color}`}>
                            <event.icon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                </div>
                                <time className="text-xs text-gray-500">
                                  {new Date(event.date).toLocaleDateString('ko-KR', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="space-y-6">
                  {/* 퍼스널 컬러 분석 결과 */}
                  {user.personalColor ? (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Image className="w-5 h-5" />
                        퍼스널 컬러 진단 결과
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className={`w-32 h-32 rounded-lg bg-gradient-to-br ${getSeasonTheme()} mb-4`} />
                          <h4 className="text-2xl font-bold text-gray-900">
                            {user.personalColor.seasonKo}
                          </h4>
                          <p className="text-lg text-gray-600">{user.personalColor.season} type</p>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">진단 신뢰도</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${user.personalColor.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {Math.round(user.personalColor.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">진단일</p>
                            <p className="font-medium">
                              {new Date(user.personalColor.analysisDate).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-6 bg-gray-50">
                      <div className="text-center">
                        <Image className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600">아직 퍼스널 컬러 진단을 받지 않았습니다</p>
                      </div>
                    </Card>
                  )}

                  {/* 히잡 추천 정보 */}
                  {user.recommendation ? (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ShirtIcon className="w-5 h-5" />
                        히잡 추천 정보
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium text-blue-700">상태</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.recommendation.status === 'completed' ? 'bg-green-100 text-green-700' :
                            user.recommendation.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.recommendation.status === 'completed' ? '추천 완료' :
                             user.recommendation.status === 'processing' ? '처리 중' : '대기 중'}
                          </span>
                        </div>
                        
                        {user.recommendation.preferences.style && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">선호 스타일</p>
                            <div className="flex flex-wrap gap-2">
                              {user.recommendation.preferences.style.map((style, index) => (
                                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                  {style}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {user.recommendation.preferences.priceRange && (
                          <div>
                            <p className="text-sm text-gray-600">가격대</p>
                            <p className="font-medium">{user.recommendation.preferences.priceRange}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">요청일</p>
                            <p className="font-medium">
                              {new Date(user.recommendation.requestedAt).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                          
                          {user.recommendation.completedAt && (
                            <div>
                              <p className="text-gray-600">완료일</p>
                              <p className="font-medium">
                                {new Date(user.recommendation.completedAt).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-6 bg-gray-50">
                      <div className="text-center">
                        <ShirtIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600">아직 히잡 추천을 요청하지 않았습니다</p>
                        {user.personalColor && (
                          <Button
                            size="sm"
                            className="mt-3"
                            onClick={() => onAction(user, 'send_recommendation_offer')}
                          >
                            추천 서비스 제안하기
                          </Button>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  {/* 노트 입력 */}
                  <Card className="p-4">
                    <div className="flex gap-3">
                      <textarea
                        placeholder="관리자 노트를 입력하세요..."
                        className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                      />
                      <Button
                        onClick={() => onAction(user, 'add_note')}
                        className="self-end"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>

                  {/* 노트 목록 */}
                  {user.actions.filter(a => a.type === 'note_added').length > 0 ? (
                    <div className="space-y-3">
                      {user.actions
                        .filter(a => a.type === 'note_added')
                        .map((note, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-gray-900">{note.description}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {note.performedBy} • {new Date(note.performedAt).toLocaleDateString('ko-KR')}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>아직 작성된 노트가 없습니다</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 액션 바 */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* 위험 알림 */}
                  {(user.insights.isAtRisk || user.insights.hasStalled) && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      {user.insights.isAtRisk && '이탈 위험'}
                      {user.insights.hasStalled && '프로세스 중단'}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* 주요 액션 */}
                  {user.journeyStatus === 'recommendation_requested' && (
                    <Button
                      onClick={() => {
                        onAction(user, 'start_recommendation_process');
                        onClose();
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      추천 작업 시작
                    </Button>
                  )}
                  
                  {user.journeyStatus === 'recommendation_processing' && (
                    <Button
                      onClick={() => {
                        onAction(user, 'complete_recommendation');
                        onClose();
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      추천 완료 처리
                    </Button>
                  )}

                  {/* 더보기 메뉴 */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      onClick={() => setShowActionMenu(!showActionMenu)}
                    >
                      더 많은 액션
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    
                    {showActionMenu && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                        <button
                          onClick={() => onAction(user, 'send_diagnosis_reminder')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          진단 독려 메시지
                        </button>
                        <button
                          onClick={() => onAction(user, 'send_reactivation_message')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          재활성화 메시지
                        </button>
                        <button
                          onClick={() => onAction(user, 'schedule_followup')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          팔로우업 예약
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;