// User Journey Service - 사용자 중심 데이터 변환 및 비즈니스 로직
// 기존 분산된 데이터를 관리자 업무 중심으로 통합

import { AdminAPI } from '../api/admin';
import type { 
  UnifiedUserView, 
  UserJourneyStatus, 
  Priority, 
  TodaysWork, 
  InsightsDashboard,
  ActionContext,
  AdminActionType,
  PersonalColorSeason
} from '@/types/admin';
import type { Recommendation } from '@/types';

export class UserJourneyService {
  /**
   * 기존 분산된 데이터를 통합 사용자 뷰로 변환
   */
  static async getUnifiedUserViews(apiKey: string): Promise<UnifiedUserView[]> {
    try {
      // 병렬로 모든 데이터 로드
      const [usersResponse, recommendationsResponse, statisticsResponse] = await Promise.all([
        AdminAPI.getUsers(apiKey),
        AdminAPI.getRecommendations(apiKey, {}),
        AdminAPI.getStatistics(apiKey)
      ]);

      const users = usersResponse.data;
      const recommendations = recommendationsResponse.recommendations;

      // 사용자별로 통합 뷰 생성
      return users.map(user => this.createUnifiedUserView(user, recommendations));
    } catch (error) {
      console.error('Failed to load unified user views:', error);
      throw error;
    }
  }

  /**
   * 개별 사용자의 통합 뷰 생성
   */
  private static createUnifiedUserView(user: any, recommendations: Recommendation[]): UnifiedUserView {
    const userRecommendation = recommendations.find(rec => rec.instagramId === user.instagramId);
    
    const timeline = {
      registeredAt: new Date(user.requestedAt),
      lastActiveAt: new Date(user.completedAt || user.requestedAt),
      diagnosisAt: user.hasAnalysis ? new Date(user.completedAt || user.requestedAt) : undefined,
      recommendationRequestedAt: userRecommendation ? new Date(userRecommendation.createdAt) : undefined,
      recommendationCompletedAt: userRecommendation?.status === 'completed' 
        ? new Date(userRecommendation.updatedAt || userRecommendation.createdAt) 
        : undefined
    };

    const journeyStatus = this.determineJourneyStatus(user, userRecommendation, timeline);
    const priority = this.calculatePriority(journeyStatus, timeline);
    const insights = this.generateInsights(user, userRecommendation, timeline);

    return {
      id: user.id,
      instagramId: user.instagramId,
      journeyStatus,
      priority,
      
      personalColor: user.personalColor ? {
        season: user.personalColor as PersonalColorSeason,
        seasonKo: user.personalColorKo || user.personalColor,
        confidence: 0.85, // 임시값, 실제로는 AI 결과에서 가져와야 함
        analysisDate: timeline.diagnosisAt!
      } : undefined,
      
      recommendation: userRecommendation ? {
        id: userRecommendation.id,
        status: userRecommendation.status,
        requestedAt: new Date(userRecommendation.createdAt),
        completedAt: userRecommendation.status === 'completed' 
          ? new Date(userRecommendation.updatedAt || userRecommendation.createdAt)
          : undefined,
        preferences: {
          style: userRecommendation.userPreferences.style || userRecommendation.userPreferences.fitStyle,
          priceRange: userRecommendation.userPreferences.priceRange,
          occasions: userRecommendation.userPreferences.occasions
        }
      } : undefined,
      
      timeline,
      actions: [], // 향후 관리자 액션 로그 구현 시 추가
      insights
    };
  }

  /**
   * 사용자의 여정 상태 판단
   */
  private static determineJourneyStatus(user: any, recommendation?: Recommendation, timeline?: any): UserJourneyStatus {
    const daysSinceRegistration = timeline ? 
      Math.floor((Date.now() - timeline.registeredAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // 비활성 사용자 체크 (30일 이상 활동 없음)
    if (daysSinceRegistration > 30 && !user.hasAnalysis) {
      return 'inactive';
    }

    // 추천 관련 상태
    if (recommendation) {
      switch (recommendation.status) {
        case 'completed':
          return 'recommendation_completed';
        case 'processing':
          return 'recommendation_processing';
        case 'pending':
        default:
          return 'recommendation_requested';
      }
    }

    // 진단 상태
    if (user.hasAnalysis) {
      return 'diagnosis_done';
    }

    // 업로드 상태 체크 (uploadedImageUrl이 있으면 진단 대기 중)
    if (user.uploadedImageUrl) {
      return 'diagnosis_pending';
    }

    return 'just_started';
  }

  /**
   * 우선순위 계산
   */
  private static calculatePriority(journeyStatus: UserJourneyStatus, timeline: any): Priority {
    const daysSinceLastActivity = Math.floor(
      (Date.now() - timeline.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (journeyStatus) {
      case 'recommendation_requested':
        return daysSinceLastActivity > 2 ? 'urgent' : 'high';
      
      case 'diagnosis_pending':
        return daysSinceLastActivity > 1 ? 'high' : 'medium';
      
      case 'diagnosis_done':
        return daysSinceLastActivity > 7 ? 'medium' : 'low';
      
      case 'recommendation_processing':
        return 'urgent';
      
      case 'just_started':
        return daysSinceLastActivity > 3 ? 'medium' : 'low';
      
      default:
        return 'low';
    }
  }

  /**
   * 비즈니스 인사이트 생성
   */
  private static generateInsights(user: any, recommendation: any, timeline: any) {
    const daysSinceRegistration = Math.floor(
      (Date.now() - timeline.registeredAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const daysSinceLastActivity = Math.floor(
      (Date.now() - timeline.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const isNewUser = daysSinceRegistration <= 7;
    const isAtRisk = user.hasAnalysis && !recommendation && daysSinceLastActivity > 7;
    const hasStalled = recommendation?.status === 'pending' && daysSinceLastActivity > 3;

    let conversionStage: 'discovery' | 'diagnosis' | 'recommendation' | 'completed';
    if (recommendation?.status === 'completed') {
      conversionStage = 'completed';
    } else if (recommendation) {
      conversionStage = 'recommendation';
    } else if (user.hasAnalysis) {
      conversionStage = 'diagnosis';
    } else {
      conversionStage = 'discovery';
    }

    return {
      isNewUser,
      isAtRisk,
      hasStalled,
      daysSinceLastActivity,
      conversionStage
    };
  }

  /**
   * 오늘의 작업 큐 생성
   */
  static generateTodaysWork(userViews: UnifiedUserView[]): TodaysWork {
    const urgent = {
      newRecommendationRequests: userViews.filter(u => 
        u.journeyStatus === 'recommendation_requested' && u.priority === 'urgent'
      ),
      stalledProcesses: userViews.filter(u => u.insights.hasStalled),
      longPendingRequests: userViews.filter(u => 
        u.journeyStatus === 'recommendation_requested' && u.insights.daysSinceLastActivity > 3
      )
    };

    const opportunities = {
      diagnoseOnlyUsers: userViews.filter(u => 
        u.journeyStatus === 'diagnosis_done' && u.insights.daysSinceLastActivity <= 14
      ),
      reactivationTargets: userViews.filter(u => 
        u.insights.isAtRisk && u.insights.daysSinceLastActivity <= 30
      )
    };

    const monitoring = {
      recentCompletions: userViews.filter(u => 
        u.journeyStatus === 'recommendation_completed' && u.insights.daysSinceLastActivity <= 7
      ),
      newSignups: userViews.filter(u => u.insights.isNewUser)
    };

    return { urgent, opportunities, monitoring };
  }

  /**
   * 사용자별 액션 컨텍스트 생성
   */
  static getActionContext(user: UnifiedUserView): ActionContext {
    const availableActions: AdminActionType[] = [];
    let suggestedAction: AdminActionType | undefined;
    let actionReason: string | undefined;

    switch (user.journeyStatus) {
      case 'just_started':
        availableActions.push('send_diagnosis_reminder', 'mark_as_inactive');
        if (user.insights.daysSinceLastActivity > 3) {
          suggestedAction = 'send_diagnosis_reminder';
          actionReason = '가입 후 진단을 받지 않아 독려가 필요합니다.';
        }
        break;

      case 'diagnosis_pending':
        availableActions.push('add_note', 'escalate_priority');
        if (user.insights.daysSinceLastActivity > 1) {
          suggestedAction = 'escalate_priority';
          actionReason = '진단 요청 후 오래 대기 중입니다.';
        }
        break;

      case 'diagnosis_done':
        availableActions.push('mark_offer_sent', 'add_note');
        if (user.insights.isAtRisk) {
          suggestedAction = 'mark_offer_sent';
          actionReason = '진단만 받고 추천 요청을 안 했습니다. DM을 발송하고 상태를 변경하세요.';
        }
        break;

      case 'offer_sent':
        availableActions.push('mark_offer_not_sent', 'send_reactivation_message', 'add_note');
        if (user.insights.daysSinceLastActivity > 7) {
          suggestedAction = 'send_reactivation_message';
          actionReason = '추천 제안 후 반응이 없습니다. 재활성화가 필요합니다.';
        }
        break;

      case 'recommendation_requested':
        availableActions.push('start_recommendation_process', 'escalate_priority', 'add_note');
        suggestedAction = 'start_recommendation_process';
        actionReason = '추천 요청이 들어와 처리가 필요합니다.';
        break;

      case 'recommendation_processing':
        availableActions.push('complete_recommendation', 'add_note');
        suggestedAction = 'complete_recommendation';
        actionReason = '추천 작업을 완료하고 DM을 발송하세요.';
        break;

      case 'recommendation_completed':
        availableActions.push('schedule_followup', 'add_note');
        break;

      case 'inactive':
        availableActions.push('send_reactivation_message', 'mark_as_inactive');
        break;
    }

    return {
      user,
      availableActions,
      suggestedAction,
      actionReason
    };
  }

  /**
   * 인사이트 대시보드 데이터 생성
   */
  static generateInsightsDashboard(userViews: UnifiedUserView[]): InsightsDashboard {
    const totalUsers = userViews.length;
    const diagnosisUsers = userViews.filter(u => u.personalColor).length;
    const recommendationUsers = userViews.filter(u => u.recommendation).length;
    const completedUsers = userViews.filter(u => u.recommendation?.status === 'completed').length;

    // 전환율 계산 - 단계별 전환율
    const conversionRates = {
      signupToDiagnosis: totalUsers > 0 ? diagnosisUsers / totalUsers : 0,
      diagnosisToRecommendation: diagnosisUsers > 0 ? recommendationUsers / diagnosisUsers : 0,
      recommendationToCompletion: recommendationUsers > 0 ? completedUsers / recommendationUsers : 0,
      overall: totalUsers > 0 ? completedUsers / totalUsers : 0
    };

    // 평균 완료 시간 계산 (시간 단위)
    const averageTimeToComplete = this.calculateAverageCompletionTimes(userViews);

    // 퍼스널 컬러 분포 계산
    const personalColorDistribution = userViews.reduce((acc, user) => {
      if (user.personalColor) {
        acc[user.personalColor.season] = (acc[user.personalColor.season] || 0) + 1;
      }
      return acc;
    }, {} as Record<PersonalColorSeason, number>);

    // 기본값 설정
    const seasons: PersonalColorSeason[] = ['spring', 'summer', 'autumn', 'winter'];
    seasons.forEach(season => {
      if (!personalColorDistribution[season]) {
        personalColorDistribution[season] = 0;
      }
    });

    // 인기 스타일 추출
    const popularStyles = this.extractPopularStyles(userViews);

    // 시간대별 활동 분석
    const hourlyActivity = this.analyzeHourlyActivity(userViews);

    const alerts = {
      highAtRiskUsers: userViews.filter(u => u.insights.isAtRisk).length,
      stalledProcesses: userViews.filter(u => u.insights.hasStalled).length,
      longPendingRequests: userViews.filter(u => 
        u.journeyStatus === 'recommendation_requested' && u.insights.daysSinceLastActivity > 3
      ).length,
      systemIssues: [] // 향후 시스템 모니터링 구현
    };

    // 주간 비교 데이터 계산
    const weekOverWeekChanges = this.calculateWeekOverWeekChanges(userViews);

    return {
      metrics: {
        conversionRates,
        averageTimeToComplete,
        volumes: {
          // 오늘 가입한 사용자 (가입일이 오늘)
          dailySignups: userViews.filter(u => {
            const daysSinceRegistration = Math.floor(
              (Date.now() - new Date(u.timeline.registeredAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            return daysSinceRegistration === 0;
          }).length,
          // 오늘 진단을 받은 사용자
          dailyDiagnoses: userViews.filter(u => {
            if (!u.timeline.diagnosisAt) return false;
            const daysSinceDiagnosis = Math.floor(
              (Date.now() - new Date(u.timeline.diagnosisAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            return daysSinceDiagnosis === 0;
          }).length,
          // 오늘 추천 완료된 사용자
          dailyRecommendations: userViews.filter(u => {
            if (!u.timeline.recommendationCompletedAt) return false;
            const daysSinceCompletion = Math.floor(
              (Date.now() - new Date(u.timeline.recommendationCompletedAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            return daysSinceCompletion === 0;
          }).length,
          pendingRecommendations: userViews.filter(u => 
            u.journeyStatus === 'recommendation_requested' || u.journeyStatus === 'recommendation_processing'
          ).length
        },
        weekOverWeekChanges
      },
      trends: {
        personalColorDistribution,
        popularStyles,
        hourlyActivity
      },
      alerts
    };
  }

  /**
   * 평균 완료 시간 계산
   */
  private static calculateAverageCompletionTimes(userViews: UnifiedUserView[]) {
    // 가입 → 진단 시간 계산
    const diagnosisTimes = userViews
      .filter(u => u.timeline.diagnosisAt)
      .map(u => {
        const hours = (new Date(u.timeline.diagnosisAt!).getTime() - new Date(u.timeline.registeredAt).getTime()) / (1000 * 60 * 60);
        return Math.max(0, hours); // 음수 방지
      });
    
    const avgDiagnosisTime = diagnosisTimes.length > 0 
      ? Math.round(diagnosisTimes.reduce((a, b) => a + b, 0) / diagnosisTimes.length)
      : 24; // 기본값

    // 추천 요청 → 완료 시간 계산
    const recommendationTimes = userViews
      .filter(u => u.timeline.recommendationRequestedAt && u.timeline.recommendationCompletedAt)
      .map(u => {
        const hours = (new Date(u.timeline.recommendationCompletedAt!).getTime() - new Date(u.timeline.recommendationRequestedAt!).getTime()) / (1000 * 60 * 60);
        return Math.max(0, hours); // 음수 방지
      });
    
    const avgRecommendationTime = recommendationTimes.length > 0 
      ? Math.round(recommendationTimes.reduce((a, b) => a + b, 0) / recommendationTimes.length)
      : 48; // 기본값

    // 전체 프로세스 시간 (가입 → 추천 완료)
    const totalTimes = userViews
      .filter(u => u.timeline.recommendationCompletedAt)
      .map(u => {
        const hours = (new Date(u.timeline.recommendationCompletedAt!).getTime() - new Date(u.timeline.registeredAt).getTime()) / (1000 * 60 * 60);
        return Math.max(0, hours); // 음수 방지
      });
    
    const avgTotalTime = totalTimes.length > 0 
      ? Math.round(totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length)
      : avgDiagnosisTime + avgRecommendationTime; // 기본값

    return {
      diagnosis: avgDiagnosisTime,
      recommendation: avgRecommendationTime,
      total: avgTotalTime
    };
  }

  /**
   * 인기 스타일 추출 및 트렌드 분석
   */
  private static extractPopularStyles(userViews: UnifiedUserView[]) {
    // 스타일 카운트 집계
    const styleCount: Record<string, number> = {};
    const lastWeekStyleCount: Record<string, number> = {};
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    userViews.forEach(user => {
      if (user.recommendation?.preferences.style) {
        user.recommendation.preferences.style.forEach(style => {
          // 전체 카운트
          styleCount[style] = (styleCount[style] || 0) + 1;
          
          // 지난주 카운트 (지난주에 요청된 추천만)
          if (user.timeline.recommendationRequestedAt && new Date(user.timeline.recommendationRequestedAt) < oneWeekAgo) {
            lastWeekStyleCount[style] = (lastWeekStyleCount[style] || 0) + 1;
          }
        });
      }
    });

    // 상위 10개 스타일 추출 및 트렌드 계산
    const popularStyles = Object.entries(styleCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([style, count]) => {
        const lastWeekCount = lastWeekStyleCount[style] || 0;
        let trend: 'up' | 'down' | 'stable' = 'stable';
        
        if (count > lastWeekCount * 1.1) {
          trend = 'up';
        } else if (count < lastWeekCount * 0.9) {
          trend = 'down';
        }

        return {
          style,
          count,
          trend
        };
      });

    return popularStyles;
  }

  /**
   * 시간대별 활동 분석
   */
  private static analyzeHourlyActivity(userViews: UnifiedUserView[]) {
    // 24시간 배열 초기화
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      signups: 0,
      diagnoses: 0,
      recommendations: 0
    }));

    userViews.forEach(user => {
      // 가입 시간
      const registrationHour = new Date(user.timeline.registeredAt).getHours();
      hourlyData[registrationHour].signups++;

      // 진단 시간
      if (user.timeline.diagnosisAt) {
        const diagnosisHour = new Date(user.timeline.diagnosisAt).getHours();
        hourlyData[diagnosisHour].diagnoses++;
      }

      // 추천 요청 시간
      if (user.timeline.recommendationRequestedAt) {
        const recommendationHour = new Date(user.timeline.recommendationRequestedAt).getHours();
        hourlyData[recommendationHour].recommendations++;
      }
    });

    return hourlyData;
  }

  /**
   * 주간 비교 데이터 계산
   */
  private static calculateWeekOverWeekChanges(userViews: UnifiedUserView[]) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 이번 주 데이터 (지난 7일)
    const thisWeekViews = userViews.filter(u => {
      const registeredAt = new Date(u.timeline.registeredAt);
      return registeredAt >= oneWeekAgo && registeredAt <= now;
    });

    // 지난 주 데이터 (7-14일 전)
    const lastWeekViews = userViews.filter(u => {
      const registeredAt = new Date(u.timeline.registeredAt);
      return registeredAt >= twoWeeksAgo && registeredAt < oneWeekAgo;
    });

    // 전환율 변화 계산
    const thisWeekConversionRate = thisWeekViews.length > 0 
      ? thisWeekViews.filter(u => u.recommendation?.status === 'completed').length / thisWeekViews.length 
      : 0;
    
    const lastWeekConversionRate = lastWeekViews.length > 0 
      ? lastWeekViews.filter(u => u.recommendation?.status === 'completed').length / lastWeekViews.length 
      : 0;

    const conversionRateChange = lastWeekConversionRate > 0 
      ? Math.round(((thisWeekConversionRate - lastWeekConversionRate) / lastWeekConversionRate) * 100)
      : 0;

    // 일일 가입자 변화 계산
    const thisWeekDailySignups = thisWeekViews.length / 7;
    const lastWeekDailySignups = lastWeekViews.length / 7;
    
    const signupsChange = lastWeekDailySignups > 0 
      ? Math.round(((thisWeekDailySignups - lastWeekDailySignups) / lastWeekDailySignups) * 100)
      : 0;

    // 평균 완료 시간 변화 계산
    const thisWeekCompletionTimes = thisWeekViews
      .filter(u => u.timeline.recommendationCompletedAt)
      .map(u => (new Date(u.timeline.recommendationCompletedAt!).getTime() - new Date(u.timeline.registeredAt).getTime()) / (1000 * 60 * 60));
    
    const lastWeekCompletionTimes = lastWeekViews
      .filter(u => u.timeline.recommendationCompletedAt)
      .map(u => (new Date(u.timeline.recommendationCompletedAt!).getTime() - new Date(u.timeline.registeredAt).getTime()) / (1000 * 60 * 60));

    const thisWeekAvgTime = thisWeekCompletionTimes.length > 0 
      ? thisWeekCompletionTimes.reduce((a, b) => a + b, 0) / thisWeekCompletionTimes.length 
      : 0;
    
    const lastWeekAvgTime = lastWeekCompletionTimes.length > 0 
      ? lastWeekCompletionTimes.reduce((a, b) => a + b, 0) / lastWeekCompletionTimes.length 
      : 0;

    const completionTimeChange = lastWeekAvgTime > 0 
      ? Math.round(((thisWeekAvgTime - lastWeekAvgTime) / lastWeekAvgTime) * 100)
      : 0;

    return {
      conversionRate: conversionRateChange,
      dailySignups: signupsChange,
      completionTime: completionTimeChange
    };
  }
}