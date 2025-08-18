import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { validateInstagramId } from '@/utils/validators';
import { useAppStore } from '@/store';
import { SessionAPI } from '@/services/api/session';
import { trackSessionStart, trackEvent, trackEngagement, trackError, trackDropOff } from '@/utils/analytics';
import styles from './HIGLandingPage.module.css';
import landingBgOriginal from '@/assets/landing-bg-original.jpg';
import frame175 from '@/assets/frame-175.svg';
import group176 from '@/assets/group-176.svg';

const HIGLandingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const setSessionData = useAppStore((state) => state.setSessionData);
  const [instagramId, setInstagramId] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  // Track landing page entry
  useEffect(() => {
    trackEvent('page_enter', {
      page: 'landing',
      user_flow_step: 'landing_page_entered',
      entry_type: 'initial_visit'
    });
  }, []);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrolled / maxScroll, 1);
      setScrollProgress(progress);
      setIsScrolled(scrolled > 20);
      
      // Show floating CTA when scrolled past hero section
      if (heroRef.current) {
        const heroBottom = heroRef.current.offsetTop + heroRef.current.offsetHeight;
        setShowFloatingCTA(scrolled > heroBottom);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleIdChange = (value: string): void => {
    const cleanedValue = value.replace('@', '').toLowerCase();
    setInstagramId(cleanedValue);
    
    // Track form interaction
    if (cleanedValue.length === 1) {
      // First character typed
      trackEngagement('form_start', 'instagram_id_input');
      trackEvent('form_interaction', {
        field_name: 'instagram_id',
        interaction_type: 'input_start',
        user_flow_step: 'form_started'
      });
    }
    
    if (cleanedValue.length === 0) {
      setError('');
      setIsValid(false);
      return;
    }

    const valid = validateInstagramId(cleanedValue);
    setIsValid(valid);
    setError(valid ? '' : 'Please enter a valid Instagram ID');

    // Track validation result
    if (cleanedValue.length >= 3) { // Only track after meaningful input
      trackEvent('form_validation', {
        field_name: 'instagram_id',
        is_valid: valid,
        input_length: cleanedValue.length,
        user_flow_step: 'form_validation'
      });
    }
  };

  const handleScrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Track CTA click
    trackEvent('floating_cta_click', {
      action: 'scroll_to_top',
      scroll_position: window.scrollY
    });
  };

  const handleStartAnalysis = async (): Promise<void> => {
    if (isLoading) return;

    console.log('[HIGLandingPage] Starting analysis...');
    setIsLoading(true);
    
    // Track CTA click
    trackEvent('cta_click', {
      button_name: 'find_my_personal_color',
      user_flow_step: 'session_creation_started',
      page: 'landing'
    });

    try {
      console.log('[HIGLandingPage] Creating session...');
      const response = await SessionAPI.createSession();
      console.log('[HIGLandingPage] Session created:', response.data);
      
      setSessionData(response.data.sessionId);
      console.log('[HIGLandingPage] Session data set in store, sessionId:', response.data.sessionId);
      
      // Debug: Check store state
      const currentState = useAppStore.getState();
      console.log('[HIGLandingPage] Current store state:', {
        sessionId: currentState.sessionId,
        instagramId: currentState.instagramId
      });
      
      // Track successful session creation
      trackSessionStart();
      trackEvent('session_create_success', {
        session_id: response.data.sessionId,
        user_flow_step: 'session_created_successfully'
      });
      
      console.log('[HIGLandingPage] Navigating to diagnosis page...');
      navigate(ROUTES.DIAGNOSIS);
    } catch (error) {
      console.error('[HIGLandingPage] Error creating session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError('Failed to start analysis. Please try again.');
      
      // Track session creation failure
      trackError('session_create_failed', errorMessage, 'landing_page');
      trackDropOff('landing_page', 'session_creation_error');
      
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    
    // Track form submission attempt
    trackEvent('form_submit', {
      form_name: 'instagram_id_form',
      instagram_id_length: instagramId.length,
      user_flow_step: 'session_creation_started',
      submit_type: 'form_submit'
    });

    try {
      const response = await SessionAPI.createSession(instagramId);
      setSessionData(response.data.sessionId, response.data.instagramId);
      
      // Track successful session creation with enhanced data
      trackSessionStart(instagramId);
      trackEvent('session_create_success', {
        session_id: response.data.sessionId,
        instagram_id: instagramId,
        user_flow_step: 'session_created_successfully'
      });

      navigate(ROUTES.DIAGNOSIS);
    } catch (error) {
      setError('Failed to create session. Please try again.');
      
      // Track session creation failure
      trackError('session_creation_failed', error instanceof Error ? error.message : 'Unknown session error', 'landing_page');
      trackEvent('form_submit_failed', {
        form_name: 'instagram_id_form',
        error_type: 'session_creation_failed',
        user_flow_step: 'session_creation_failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      style={{
        width: '402px',
        height: '874px',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        margin: '0 auto',
        background: '#ffffff'
      }}
    >
      {/* Background Image Container */}
      <div 
        style={{
          position: 'absolute',
          width: '1017.984px',
          height: '1210px',
          left: '-529px',
          top: '-16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Rotated Background Image */}
        <div
          style={{
            width: '1210px',
            height: '1018px',
            transform: 'rotate(90deg)',
            flexShrink: 0,
            background: `url(${landingBgOriginal}) lightgray 50% / cover no-repeat`
          }}
        />
      </div>

      {/* Group 176 - Illustration (behind text) */}
      <div
        style={{
          position: 'absolute',
          width: '547px',
          height: '531px',
          left: '-70px',
          top: '201px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1
        }}
      >
        <img 
          src={group176}
          alt="Hijab illustration"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Frame 175 - Logo with stars */}
      <img 
        src={frame175}
        alt="myNoor logo"
        style={{
          position: 'absolute',
          width: '402px',
          height: '177px',
          flexShrink: 0,
          top: '66px',
          left: '0',
          zIndex: 2
        }}
      />

      {/* Tagline Text */}
      <p
        style={{
          position: 'absolute',
          color: '#3B1389',
          textAlign: 'center',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: '20px',
          fontStyle: 'normal',
          fontWeight: 800,
          lineHeight: '140%',
          top: '270px',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          zIndex: 2
        }}
      >
        Find Your Color. Glow in Hijab.
      </p>

      {/* Start Analysis Button */}
      <button
        onClick={handleStartAnalysis}
        disabled={isLoading}
        style={{
          position: 'absolute',
          display: 'flex',
          width: '338px',
          height: '37px',
          padding: '10px 16px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          borderRadius: '10px',
          background: '#FFF3A1',
          border: 'none',
          color: '#3B1389',
          textAlign: 'center',
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '20px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '140%',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: '90px',
          boxSizing: 'content-box',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          transition: 'all 0.2s ease',
          zIndex: 3
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 19, 137, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(-50%) translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {isLoading ? 'Starting...' : 'Start Analysis'}
      </button>

    </div>
  );
};

export default HIGLandingPage;