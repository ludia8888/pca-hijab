import { useEffect, useCallback, useRef } from 'react';
import { FunnelTracker, FUNNEL_STEPS } from '@/utils/funnelAnalytics';

export const useAnalysisTracking = () => {
  const progressTrackingRef = useRef<{
    startTime: number;
    milestones: Set<number>;
    userInteractions: Array<{
      action: string;
      timestamp: number;
      progressAtTime: number;
    }>;
  }>({
    startTime: Date.now(),
    milestones: new Set(),
    userInteractions: []
  });

  // 분석 시작 추적
  const trackAnalysisStart = useCallback(() => {
    progressTrackingRef.current.startTime = Date.now();
    FunnelTracker.advanceStep(FUNNEL_STEPS.ANALYSIS_PAGE_ENTER);
    FunnelTracker.advanceStep(FUNNEL_STEPS.ANALYSIS_INIT_START);
  }, []);

  // 업로드 진행률 추적
  const trackUploadProgress = useCallback((progress: number) => {
    if (progress > 0 && !progressTrackingRef.current.milestones.has(0)) {
      progressTrackingRef.current.milestones.add(0);
      FunnelTracker.advanceStep(FUNNEL_STEPS.ANALYSIS_UPLOAD_PROGRESS, {
        upload_progress: progress,
        time_to_start: Date.now() - progressTrackingRef.current.startTime
      });
    }
  }, []);

  // AI 처리 시작 추적
  const trackAIProcessingStart = useCallback(() => {
    FunnelTracker.advanceStep(FUNNEL_STEPS.ANALYSIS_AI_PROCESSING, {
      upload_complete_time: Date.now() - progressTrackingRef.current.startTime
    });
  }, []);

  // 진행률 마일스톤 추적 (25%, 50%, 75%)
  const trackProgressMilestone = useCallback((progress: number) => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - progressTrackingRef.current.startTime;

    if (progress >= 25 && !progressTrackingRef.current.milestones.has(25)) {
      progressTrackingRef.current.milestones.add(25);
      FunnelTracker.advanceStep(FUNNEL_STEPS.ANALYSIS_PROGRESS_25, {
        progress: 25,
        elapsed_time: elapsedTime,
        processing_speed: 25 / (elapsedTime / 1000) // progress per second
      });
    }

    if (progress >= 50 && !progressTrackingRef.current.milestones.has(50)) {
      progressTrackingRef.current.milestones.add(50);
      FunnelTracker.advanceStep(FUNNEL_STEPS.ANALYSIS_PROGRESS_50, {
        progress: 50,
        elapsed_time: elapsedTime,
        processing_speed: 50 / (elapsedTime / 1000)
      });
    }

    if (progress >= 75 && !progressTrackingRef.current.milestones.has(75)) {
      progressTrackingRef.current.milestones.add(75);
      FunnelTracker.advanceStep(FUNNEL_STEPS.ANALYSIS_PROGRESS_75, {
        progress: 75,
        elapsed_time: elapsedTime,
        processing_speed: 75 / (elapsedTime / 1000)
      });
    }
  }, []);

  // 사용자 상호작용 추적 (대기 중 클릭, 스크롤 등)
  const trackWaitingInteraction = useCallback((action: string, progress: number) => {
    const interaction = {
      action,
      timestamp: Date.now(),
      progressAtTime: progress
    };
    
    progressTrackingRef.current.userInteractions.push(interaction);

    FunnelTracker.trackInteraction(
      'waiting_screen',
      action,
      'analysis_waiting',
      {
        progress_at_interaction: progress,
        time_waiting: Date.now() - progressTrackingRef.current.startTime,
        interaction_count: progressTrackingRef.current.userInteractions.length
      }
    );
  }, []);

  // 분석 완료 추적
  const trackAnalysisComplete = useCallback((result: any) => {
    const totalTime = Date.now() - progressTrackingRef.current.startTime;
    
    FunnelTracker.advanceStep(FUNNEL_STEPS.ANALYSIS_COMPLETE, {
      total_analysis_time: totalTime,
      result_confidence: result?.confidence,
      personal_color: result?.personal_color_en,
      user_interactions_during_wait: progressTrackingRef.current.userInteractions.length,
      milestones_reached: Array.from(progressTrackingRef.current.milestones)
    });

    FunnelTracker.advanceStep(FUNNEL_STEPS.ANALYSIS_RESULT_READY);
  }, []);

  // 분석 실패/타임아웃 추적
  const trackAnalysisFailure = useCallback((reason: string, progress: number) => {
    const totalTime = Date.now() - progressTrackingRef.current.startTime;
    
    FunnelTracker.trackDropOff('analysis_failure', 'analysis_waiting');
    FunnelTracker.trackError('analysis_error', reason, {
      progress_at_failure: progress,
      time_to_failure: totalTime,
      interactions_before_failure: progressTrackingRef.current.userInteractions.length
    });
  }, []);

  // 페이지 이탈 감지
  useEffect(() => {
    const handleBeforeUnload = () => {
      const progress = progressTrackingRef.current.milestones.size * 25; // 대략적인 진행률
      FunnelTracker.trackDropOff('page_unload_during_analysis', 'analysis_waiting');
      
      FunnelTracker.trackEvent({
        action: 'analysis_abandoned',
        category: 'user_behavior',
        label: 'analysis_interruption',
        custom_parameters: {
          time_waited: Date.now() - progressTrackingRef.current.startTime,
          progress_reached: progress,
          interactions_count: progressTrackingRef.current.userInteractions.length
        }
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackWaitingInteraction('tab_hidden', progressTrackingRef.current.milestones.size * 25);
      } else {
        trackWaitingInteraction('tab_visible', progressTrackingRef.current.milestones.size * 25);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [trackWaitingInteraction]);

  return {
    trackAnalysisStart,
    trackUploadProgress,
    trackAIProcessingStart,
    trackProgressMilestone,
    trackWaitingInteraction,
    trackAnalysisComplete,
    trackAnalysisFailure
  };
};