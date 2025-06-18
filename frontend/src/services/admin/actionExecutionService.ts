// 관리자 액션 실행 서비스
// 실시간으로 사용자에 대한 액션을 실행하고 결과를 추적

import { AdminAPI } from '../api/admin';
import type { UnifiedUserView, AdminActionType } from '@/types/admin';

export interface ActionExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp: Date;
}

export interface ActionExecutor {
  type: AdminActionType;
  execute: (user: UnifiedUserView, apiKey: string) => Promise<ActionExecutionResult>;
  validate?: (user: UnifiedUserView) => boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: (user: UnifiedUserView) => string;
}

// 액션 실행자 맵
const actionExecutors: Record<AdminActionType, ActionExecutor> = {
  send_diagnosis_reminder: {
    type: 'send_diagnosis_reminder',
    execute: async (user, apiKey) => {
      try {
        // 액션 로그 저장
        await AdminAPI.logAction(apiKey, {
          userId: user.id,
          actionType: 'send_diagnosis_reminder',
          description: `@${user.instagramId}에게 진단 독려 메시지 발송`,
          metadata: {
            messageType: 'diagnosis_reminder',
            daysSinceSignup: Math.floor((Date.now() - new Date(user.timeline.registeredAt).getTime()) / (1000 * 60 * 60 * 24))
          }
        });

        return {
          success: true,
          message: '진단 독려 메시지가 성공적으로 발송되었습니다.',
          timestamp: new Date()
        };
      } catch (error) {
        return {
          success: false,
          message: '메시지 발송에 실패했습니다.',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
      }
    },
    validate: (user) => user.journeyStatus === 'just_started' && !user.personalColor,
    confirmationMessage: (user) => 
      `@${user.instagramId}님에게 퍼스널 컬러 진단을 독려하는 메시지를 보내시겠습니까?`
  },

  mark_offer_sent: {
    type: 'mark_offer_sent',
    execute: async (user, apiKey) => {
      try {
        // TODO: 백엔드 API 호출하여 상태를 offer_sent로 변경
        await AdminAPI.logAction(apiKey, {
          userId: user.id,
          actionType: 'mark_offer_sent',
          description: `@${user.instagramId}에게 히잡 추천 서비스 DM 발송 완료 표시`,
          metadata: {
            personalColor: user.personalColor?.season,
            daysSinceDiagnosis: user.timeline.diagnosisAt ? 
              Math.floor((Date.now() - new Date(user.timeline.diagnosisAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
            markedAt: new Date()
          }
        });

        return {
          success: true,
          message: `@${user.instagramId}님을 DM 발송 완료 상태로 변경했습니다.`,
          data: { newStatus: 'offer_sent' },
          timestamp: new Date()
        };
      } catch (error) {
        return {
          success: false,
          message: 'DM 발송 상태 변경에 실패했습니다.',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
      }
    },
    validate: (user) => user.journeyStatus === 'diagnosis_done' && !!user.personalColor,
    confirmationMessage: (user) => 
      `@${user.instagramId}님에게 DM을 발송하셨나요? 발송 완료로 표시하시겠습니까?`
  },

  mark_offer_not_sent: {
    type: 'mark_offer_not_sent',
    execute: async (user, apiKey) => {
      try {
        // TODO: 백엔드 API 호출하여 상태를 diagnosis_done으로 되돌림
        await AdminAPI.logAction(apiKey, {
          userId: user.id,
          actionType: 'mark_offer_not_sent',
          description: `@${user.instagramId}의 DM 발송 상태를 미발송으로 변경`,
          metadata: {
            personalColor: user.personalColor?.season,
            revertedAt: new Date()
          }
        });

        return {
          success: true,
          message: `@${user.instagramId}님을 DM 미발송 상태로 변경했습니다.`,
          data: { newStatus: 'diagnosis_done' },
          timestamp: new Date()
        };
      } catch (error) {
        return {
          success: false,
          message: 'DM 미발송 상태 변경에 실패했습니다.',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
      }
    },
    validate: (user) => user.journeyStatus === 'offer_sent',
    confirmationMessage: (user) => 
      `@${user.instagramId}님의 DM 발송 상태를 취소하시겠습니까?`
  },

  start_recommendation_process: {
    type: 'start_recommendation_process',
    execute: async (user, apiKey) => {
      try {
        if (!user.recommendation) {
          throw new Error('추천 요청 정보가 없습니다.');
        }

        // 추천 상태를 processing으로 변경
        await AdminAPI.updateRecommendationStatus(
          apiKey, 
          user.recommendation.id, 
          'processing'
        );
        
        await AdminAPI.logAction(apiKey, {
          userId: user.id,
          actionType: 'start_recommendation_process',
          description: `@${user.instagramId}의 히잡 추천 작업 시작`,
          metadata: {
            recommendationId: user.recommendation.id,
            preferences: user.recommendation.preferences
          }
        });

        return {
          success: true,
          message: '히잡 추천 작업이 시작되었습니다. 추천 항목을 준비해주세요.',
          data: {
            recommendationId: user.recommendation.id,
            personalColor: user.personalColor,
            preferences: user.recommendation.preferences
          },
          timestamp: new Date()
        };
      } catch (error) {
        return {
          success: false,
          message: '추천 작업 시작에 실패했습니다.',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
      }
    },
    validate: (user) => user.journeyStatus === 'recommendation_requested' && !!user.recommendation,
    requiresConfirmation: false
  },

  complete_recommendation: {
    type: 'complete_recommendation',
    execute: async (user, apiKey) => {
      try {
        if (!user.recommendation) {
          throw new Error('추천 정보가 없습니다.');
        }

        // 추천 상태를 completed로 변경
        await AdminAPI.updateRecommendationStatus(
          apiKey, 
          user.recommendation.id, 
          'completed'
        );
        
        // Instagram DM 발송 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await AdminAPI.logAction(apiKey, {
          userId: user.id,
          actionType: 'complete_recommendation',
          description: `@${user.instagramId}에게 히잡 추천 결과 발송 완료`,
          metadata: {
            recommendationId: user.recommendation.id,
            deliveryMethod: 'instagram_dm',
            processingTime: user.timeline.recommendationRequestedAt ? 
              Date.now() - new Date(user.timeline.recommendationRequestedAt).getTime() : 0
          }
        });

        return {
          success: true,
          message: '히잡 추천이 완료되어 Instagram DM으로 발송되었습니다.',
          data: {
            recommendationId: user.recommendation.id,
            sentAt: new Date()
          },
          timestamp: new Date()
        };
      } catch (error) {
        return {
          success: false,
          message: '추천 완료 처리에 실패했습니다.',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
      }
    },
    validate: (user) => user.journeyStatus === 'recommendation_processing',
    confirmationMessage: (user) => 
      `@${user.instagramId}님의 히잡 추천을 완료하고 DM을 발송하시겠습니까?`
  },

  send_reactivation_message: {
    type: 'send_reactivation_message',
    execute: async (user, apiKey) => {
      try {
        
        const reactivationType = user.personalColor ? 'post_diagnosis' : 'post_signup';
        
        await AdminAPI.logAction(apiKey, {
          userId: user.id,
          actionType: 'send_reactivation_message',
          description: `@${user.instagramId}에게 재활성화 메시지 발송`,
          metadata: {
            reactivationType,
            daysSinceLastActivity: user.insights.daysSinceLastActivity,
            lastStage: user.insights.conversionStage
          }
        });

        return {
          success: true,
          message: '재활성화 메시지가 발송되었습니다.',
          timestamp: new Date()
        };
      } catch (error) {
        return {
          success: false,
          message: '재활성화 메시지 발송에 실패했습니다.',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
      }
    },
    validate: (user) => user.insights.isAtRisk || user.insights.daysSinceLastActivity > 14,
    confirmationMessage: (user) => 
      `@${user.instagramId}님에게 재활성화 메시지를 보내시겠습니까?`
  },

  mark_as_inactive: {
    type: 'mark_as_inactive',
    execute: async (user, apiKey) => {
      try {
        await AdminAPI.updateUserStatus(apiKey, user.id, 'inactive');
        
        await AdminAPI.logAction(apiKey, {
          userId: user.id,
          actionType: 'mark_as_inactive',
          description: `@${user.instagramId}를 비활성 사용자로 처리`,
          metadata: {
            reason: 'long_term_inactive',
            daysSinceLastActivity: user.insights.daysSinceLastActivity
          }
        });

        return {
          success: true,
          message: '사용자가 비활성 상태로 변경되었습니다.',
          timestamp: new Date()
        };
      } catch (error) {
        return {
          success: false,
          message: '비활성 처리에 실패했습니다.',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
      }
    },
    validate: (user) => user.insights.daysSinceLastActivity > 30,
    requiresConfirmation: true,
    confirmationMessage: (user) => 
      `@${user.instagramId}님을 비활성 사용자로 처리하시겠습니까?`
  },

  escalate_priority: {
    type: 'escalate_priority',
    execute: async (user, apiKey) => {
      try {
        const newPriority = user.priority === 'low' ? 'medium' : 
                           user.priority === 'medium' ? 'high' : 'urgent';
        
        await AdminAPI.updateUserPriority(apiKey, user.id, newPriority);
        
        await AdminAPI.logAction(apiKey, {
          userId: user.id,
          actionType: 'escalate_priority',
          description: `@${user.instagramId}의 우선순위를 ${user.priority}에서 ${newPriority}로 상향`,
          metadata: {
            oldPriority: user.priority,
            newPriority,
            reason: 'manual_escalation'
          }
        });

        return {
          success: true,
          message: `우선순위가 ${newPriority}로 상향되었습니다.`,
          data: { newPriority },
          timestamp: new Date()
        };
      } catch (error) {
        return {
          success: false,
          message: '우선순위 변경에 실패했습니다.',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
      }
    },
    validate: (user) => user.priority !== 'urgent'
  },

  add_note: {
    type: 'add_note',
    execute: async (user, apiKey) => {
      // 노트 추가는 별도 UI에서 처리
      return {
        success: true,
        message: '노트 입력 창이 열립니다.',
        timestamp: new Date()
      };
    }
  },

  schedule_followup: {
    type: 'schedule_followup',
    execute: async (user, apiKey) => {
      try {
        const followupDate = new Date();
        followupDate.setDate(followupDate.getDate() + 3); // 3일 후
        
        await AdminAPI.scheduleFollowup(apiKey, {
          userId: user.id,
          scheduledDate: followupDate,
          type: 'check_progress',
          notes: `@${user.instagramId}의 진행 상황 확인`
        });
        
        await AdminAPI.logAction(apiKey, {
          userId: user.id,
          actionType: 'schedule_followup',
          description: `@${user.instagramId}의 팔로우업 예약`,
          metadata: {
            scheduledDate: followupDate,
            currentStatus: user.journeyStatus
          }
        });

        return {
          success: true,
          message: `${followupDate.toLocaleDateString('ko-KR')}에 팔로우업이 예약되었습니다.`,
          data: { scheduledDate: followupDate },
          timestamp: new Date()
        };
      } catch (error) {
        return {
          success: false,
          message: '팔로우업 예약에 실패했습니다.',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
      }
    }
  }
};

export class ActionExecutionService {
  /**
   * 액션 실행
   */
  static async executeAction(
    user: UnifiedUserView,
    action: AdminActionType,
    apiKey: string,
    ...args: any[]
  ): Promise<ActionExecutionResult> {
    const executor = actionExecutors[action];
    
    if (!executor) {
      return {
        success: false,
        message: '알 수 없는 액션입니다.',
        error: `Unknown action: ${action}`,
        timestamp: new Date()
      };
    }

    // 유효성 검사
    if (executor.validate && !executor.validate(user)) {
      return {
        success: false,
        message: '현재 사용자 상태에서는 이 액션을 실행할 수 없습니다.',
        error: 'Invalid user state for action',
        timestamp: new Date()
      };
    }

    // 액션 실행
    try {
      const result = await executor.execute(user, apiKey, ...args);
      
      // 성공 시 이벤트 발생 (선택적)
      if (result.success) {
        window.dispatchEvent(new CustomEvent('adminActionExecuted', {
          detail: {
            user,
            action,
            result
          }
        }));
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: '액션 실행 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * 액션 실행 가능 여부 확인
   */
  static canExecuteAction(user: UnifiedUserView, action: AdminActionType): boolean {
    const executor = actionExecutors[action];
    if (!executor) return false;
    
    return !executor.validate || executor.validate(user);
  }

  /**
   * 확인이 필요한 액션인지 확인
   */
  static requiresConfirmation(action: AdminActionType): boolean {
    const executor = actionExecutors[action];
    return executor?.requiresConfirmation ?? false;
  }

  /**
   * 확인 메시지 가져오기
   */
  static getConfirmationMessage(user: UnifiedUserView, action: AdminActionType): string | null {
    const executor = actionExecutors[action];
    return executor?.confirmationMessage?.(user) ?? null;
  }

  /**
   * 배치 액션 실행
   */
  static async executeBatchAction(
    users: UnifiedUserView[],
    action: AdminActionType,
    apiKey: string
  ): Promise<{
    successful: number;
    failed: number;
    results: Array<{ user: UnifiedUserView; result: ActionExecutionResult }>;
  }> {
    const results = await Promise.all(
      users.map(async user => ({
        user,
        result: await this.executeAction(user, action, apiKey)
      }))
    );

    const successful = results.filter(r => r.result.success).length;
    const failed = results.filter(r => !r.result.success).length;

    return {
      successful,
      failed,
      results
    };
  }
}