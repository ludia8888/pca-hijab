// 사용자 상태 관리 서비스
// 액션 기반에서 상태 변경 기반으로 전환

import { AdminAPI } from '../api/admin';
import type { UnifiedUserView, UserJourneyStatus, Priority } from '@/types/admin';

export interface StateChangeResult {
  success: boolean;
  message: string;
  data?: any;
  timestamp: Date;
}

export type MessageType = 'diagnosis_reminder' | 'reactivation' | 'followup';

export class UserStateService {
  /**
   * 사용자 여정 상태 변경
   */
  static async updateJourneyStatus(
    apiKey: string,
    user: UnifiedUserView,
    newStatus: UserJourneyStatus
  ): Promise<StateChangeResult> {
    try {
      // TODO: 백엔드 API 호출
      // await AdminAPI.updateUserStatus(apiKey, user.id, newStatus);
      
      // 로그 기록
      await AdminAPI.logAction(apiKey, {
        userId: user.id,
        actionType: 'status_update',
        description: `@${user.instagramId}의 상태를 ${user.journeyStatus}에서 ${newStatus}로 변경`,
        metadata: {
          oldStatus: user.journeyStatus,
          newStatus,
          changedAt: new Date()
        }
      });

      const statusMessages = {
        'just_started': '가입 상태로 변경',
        'diagnosis_pending': '진단 대기 상태로 변경',
        'diagnosis_done': '진단 완료 상태로 변경', 
        'offer_sent': 'DM 발송 완료 상태로 변경',
        'recommendation_requested': '추천 요청 상태로 변경',
        'recommendation_processing': '추천 작업 중 상태로 변경',
        'recommendation_completed': '추천 완료 상태로 변경',
        'inactive': '비활성 상태로 변경'
      };

      return {
        success: true,
        message: `@${user.instagramId}님을 ${statusMessages[newStatus]}했습니다.`,
        data: { oldStatus: user.journeyStatus, newStatus },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: '상태 변경에 실패했습니다.',
        timestamp: new Date()
      };
    }
  }

  /**
   * 우선순위 변경
   */
  static async updatePriority(
    apiKey: string,
    user: UnifiedUserView,
    newPriority: Priority
  ): Promise<StateChangeResult> {
    try {
      // TODO: 백엔드 API 호출
      // await AdminAPI.updateUserPriority(apiKey, user.id, newPriority);
      
      await AdminAPI.logAction(apiKey, {
        userId: user.id,
        actionType: 'priority_changed',
        description: `@${user.instagramId}의 우선순위를 ${user.priority}에서 ${newPriority}로 변경`,
        metadata: {
          oldPriority: user.priority,
          newPriority,
          changedAt: new Date()
        }
      });

      const priorityLabels = {
        urgent: '긴급',
        high: '높음', 
        medium: '보통',
        low: '낮음'
      };

      return {
        success: true,
        message: `@${user.instagramId}님의 우선순위를 ${priorityLabels[newPriority]}으로 변경했습니다.`,
        data: { oldPriority: user.priority, newPriority },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: '우선순위 변경에 실패했습니다.',
        timestamp: new Date()
      };
    }
  }

  /**
   * 메시지 발송 상태 토글
   */
  static async toggleMessageSent(
    apiKey: string,
    user: UnifiedUserView,
    messageType: MessageType,
    sent: boolean
  ): Promise<StateChangeResult> {
    try {
      // TODO: 백엔드 API 호출
      // await AdminAPI.updateMessageStatus(apiKey, user.id, messageType, sent);
      
      const messageTypeLabels = {
        diagnosis_reminder: '진단 독려 메시지',
        reactivation: '재활성화 메시지',
        followup: '팔로우업 메시지'
      };

      await AdminAPI.logAction(apiKey, {
        userId: user.id,
        actionType: 'message_status_update',
        description: `@${user.instagramId}에게 ${messageTypeLabels[messageType]} ${sent ? '발송 완료' : '미발송'} 표시`,
        metadata: {
          messageType,
          sent,
          markedAt: new Date()
        }
      });

      return {
        success: true,
        message: `@${user.instagramId}님의 ${messageTypeLabels[messageType]}를 ${sent ? '발송 완료' : '미발송'}로 표시했습니다.`,
        data: { messageType, sent },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: '메시지 상태 변경에 실패했습니다.',
        timestamp: new Date()
      };
    }
  }

  /**
   * 우선순위 한 단계 올리기
   */
  static async escalatePriority(
    apiKey: string,
    user: UnifiedUserView
  ): Promise<StateChangeResult> {
    const priorityOrder: Priority[] = ['low', 'medium', 'high', 'urgent'];
    const currentIndex = priorityOrder.indexOf(user.priority);
    const newPriority = currentIndex < priorityOrder.length - 1 
      ? priorityOrder[currentIndex + 1] 
      : user.priority;

    if (newPriority === user.priority) {
      return {
        success: false,
        message: '이미 최고 우선순위입니다.',
        timestamp: new Date()
      };
    }

    return this.updatePriority(apiKey, user, newPriority);
  }

  /**
   * 일괄 상태 변경
   */
  static async batchUpdateJourneyStatus(
    apiKey: string,
    users: UnifiedUserView[],
    newStatus: UserJourneyStatus
  ): Promise<{ successful: number; failed: number; results: StateChangeResult[] }> {
    const results = await Promise.all(
      users.map(user => this.updateJourneyStatus(apiKey, user, newStatus))
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      successful,
      failed,
      results
    };
  }

  /**
   * 일괄 우선순위 변경
   */
  static async batchUpdatePriority(
    apiKey: string,
    users: UnifiedUserView[],
    newPriority: Priority
  ): Promise<{ successful: number; failed: number; results: StateChangeResult[] }> {
    const results = await Promise.all(
      users.map(user => this.updatePriority(apiKey, user, newPriority))
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      successful,
      failed,
      results
    };
  }

  /**
   * 일괄 메시지 상태 변경
   */
  static async batchToggleMessageSent(
    apiKey: string,
    users: UnifiedUserView[],
    messageType: MessageType,
    sent: boolean
  ): Promise<{ successful: number; failed: number; results: StateChangeResult[] }> {
    const results = await Promise.all(
      users.map(user => this.toggleMessageSent(apiKey, user, messageType, sent))
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      successful,
      failed,
      results
    };
  }
}