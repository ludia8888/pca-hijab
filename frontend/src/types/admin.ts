// Admin Dashboard - 사용자 중심 데이터 모델
// 관리자의 실제 업무 흐름에 맞춘 통합 데이터 구조

export type UserJourneyStatus = 
  | 'just_started'      // 방금 가입, 아직 진단 안함
  | 'diagnosis_pending' // 이미지 업로드했지만 진단 대기 중
  | 'diagnosis_done'    // 진단 완료, 추천 요청 안함
  | 'recommendation_requested' // 추천 요청함
  | 'recommendation_processing' // 추천 작업 중
  | 'recommendation_completed'  // 추천 완료 (DM 발송됨)
  | 'inactive'          // 오랫동안 활동 없음
  ;

export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type PersonalColorSeason = 'spring' | 'summer' | 'autumn' | 'winter';

// 통합 사용자 뷰 - 관리자가 진짜 필요한 정보
export interface UnifiedUserView {
  // 기본 식별 정보
  id: string;
  instagramId: string;
  
  // 여정 상태 정보
  journeyStatus: UserJourneyStatus;
  priority: Priority;
  
  // 진단 정보
  personalColor?: {
    season: PersonalColorSeason;
    seasonKo: string;
    confidence: number;
    analysisDate: Date;
  };
  
  // 추천 정보 (있는 경우)
  recommendation?: {
    id: string;
    status: 'pending' | 'processing' | 'completed';
    requestedAt: Date;
    completedAt?: Date;
    preferences: {
      style?: string[];
      priceRange?: string;
      occasions?: string[];
    };
  };
  
  // 타임라인 정보
  timeline: {
    registeredAt: Date;
    lastActiveAt: Date;
    diagnosisAt?: Date;
    recommendationRequestedAt?: Date;
    recommendationCompletedAt?: Date;
  };
  
  // 관리자 액션 정보
  actions: AdminAction[];
  
  // 비즈니스 인사이트
  insights: {
    isNewUser: boolean;          // 신규 사용자 (7일 이내)
    isAtRisk: boolean;           // 이탈 위험 (진단 후 추천 요청 안함)
    hasStalled: boolean;         // 프로세스 중단됨
    daysSinceLastActivity: number;
    conversionStage: 'discovery' | 'diagnosis' | 'recommendation' | 'completed';
  };
}

// 관리자 액션 로그
export interface AdminAction {
  id: string;
  type: 'status_update' | 'recommendation_sent' | 'note_added' | 'priority_changed';
  description: string;
  performedAt: Date;
  performedBy: string; // 관리자 ID
}

// 오늘의 작업 큐
export interface TodaysWork {
  urgent: {
    newRecommendationRequests: UnifiedUserView[];    // 새로운 추천 요청
    stalledProcesses: UnifiedUserView[];             // 중단된 프로세스
    longPendingRequests: UnifiedUserView[];          // 오래 대기 중인 요청
  };
  
  opportunities: {
    diagnoseOnlyUsers: UnifiedUserView[];            // 진단만 받고 추천 안 받은 사용자들
    reactivationTargets: UnifiedUserView[];          // 재활성화 대상 사용자들
  };
  
  monitoring: {
    recentCompletions: UnifiedUserView[];            // 최근 완료된 추천들
    newSignups: UnifiedUserView[];                   // 신규 가입자들
  };
}

// 인사이트 대시보드 데이터
export interface InsightsDashboard {
  metrics: {
    // 전환율 정보
    conversionRates: {
      signupToDiagnosis: number;      // 가입 → 진단
      diagnosisToRecommendation: number;  // 진단 → 추천 요청
      recommendationToCompletion: number; // 추천 요청 → 완료
      overall: number;                    // 전체 전환율
    };
    
    // 시간 기반 지표
    averageTimeToComplete: {
      diagnosis: number;              // 가입 → 진단 완료 (시간)
      recommendation: number;         // 추천 요청 → 완료 (시간)
      total: number;                 // 전체 프로세스 (시간)
    };
    
    // 볼륨 지표
    volumes: {
      dailySignups: number;
      dailyDiagnoses: number;
      dailyRecommendations: number;
      pendingRecommendations: number;
    };
    
    // 주간 비교 데이터
    weekOverWeekChanges?: {
      conversionRate: number;  // 전환율 변화 (%)
      dailySignups: number;    // 일일 가입자 변화 (%)
      completionTime: number;  // 평균 완료 시간 변화 (%)
    };
  };
  
  trends: {
    // 퍼스널 컬러 분포
    personalColorDistribution: Record<PersonalColorSeason, number>;
    
    // 스타일 선호도 트렌드
    popularStyles: Array<{
      style: string;
      count: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    
    // 시간대별 활동
    hourlyActivity: Array<{
      hour: number;
      signups: number;
      diagnoses: number;
      recommendations: number;
    }>;
  };
  
  alerts: {
    // 주의 필요한 상황들
    highAtRiskUsers: number;        // 이탈 위험 사용자 수
    stalledProcesses: number;       // 중단된 프로세스 수
    longPendingRequests: number;    // 오래 대기 중인 요청 수
    systemIssues: string[];         // 시스템 이슈들
  };
}

// 액션 컨텍스트 - 관리자가 수행할 수 있는 의미 있는 액션들
export interface ActionContext {
  user: UnifiedUserView;
  availableActions: AdminActionType[];
  suggestedAction?: AdminActionType;
  actionReason?: string;
}

export type AdminActionType = 
  | 'send_diagnosis_reminder'      // 진단 독려 메시지
  | 'send_recommendation_offer'    // 추천 서비스 제안
  | 'start_recommendation_process' // 추천 작업 시작
  | 'complete_recommendation'      // 추천 완료 처리
  | 'send_reactivation_message'    // 재활성화 메시지
  | 'mark_as_inactive'            // 비활성 처리
  | 'escalate_priority'           // 우선순위 상향
  | 'add_note'                    // 관리자 노트 추가
  | 'schedule_followup'           // 팔로우업 스케줄링
  ;

// 배치 액션 컨텍스트
export interface BatchActionContext {
  selectedUsers: UnifiedUserView[];
  availableBatchActions: AdminActionType[];
  estimatedTime: number;
  potentialImpact: string;
}