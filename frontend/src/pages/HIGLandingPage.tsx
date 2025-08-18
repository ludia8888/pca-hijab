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

  // Base dimensions for scaling
  const BASE_WIDTH = 402;
  const BASE_HEIGHT = 874;
  
  // Calculate scale factor based on viewport
  const getScaleFactor = () => {
    if (typeof window === 'undefined') return 1;
    const scaleX = window.innerWidth / BASE_WIDTH;
    const scaleY = window.innerHeight / BASE_HEIGHT;
    return Math.min(scaleX, scaleY);
  };

  const [scaleFactor, setScaleFactor] = useState(1);
  const [backgroundPosition, setBackgroundPosition] = useState({ left: -131.6, top: -1.83 });
  const [backgroundScale, setBackgroundScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const scale = getScaleFactor();
      setScaleFactor(scale);
      
      // Calculate viewport coverage requirements
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scaledContainerWidth = BASE_WIDTH * scale;
      const scaledContainerHeight = BASE_HEIGHT * scale;
      
      // Background dimensions at scale 1
      const bgWidth = 1017.984; // pixels
      const bgOriginalLeft = -529; // pixels
      const bgRightEdge = bgWidth + bgOriginalLeft; // 488.984px
      
      // Check if current background can cover the viewport
      const currentCoverage = bgRightEdge * scale;
      
      // Keep original position as anchor, only adjust scale if needed
      setBackgroundPosition({ left: -131.6, top: -1.83 }); // Fixed anchor position
      
      // Calculate if we need extra scale to prevent white edges
      const viewportAspect = window.innerWidth / window.innerHeight;
      
      // For very wide screens, slightly increase background scale
      if (viewportAspect > 1.2) {
        setBackgroundScale(1.2); // 20% larger for ultra-wide screens
      } else if (viewportAspect > 0.8) {
        setBackgroundScale(1.1); // 10% larger for wide screens
      } else {
        setBackgroundScale(1); // Original scale for normal screens
      }
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div 
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Remove white background - let the image show through
        background: 'transparent',
        overflow: 'hidden', // Keep for scrollbar prevention only
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
      <div
        style={{
          width: `${BASE_WIDTH}px`,
          height: `${BASE_HEIGHT}px`,
          position: 'relative',
          overflow: 'visible', // Allow background to extend beyond container
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'center',
          flexShrink: 0
        }}
      >
      {/* Background Image Container - scales with viewport for zoom effect */}
      <div 
        style={{
          position: 'absolute',
          width: `${(1017.984 / 402) * 100}%`, // 253.2% of container
          height: `${(1210 / 874) * 100}%`, // 138.4% of container  
          left: `${backgroundPosition.left}%`,
          top: `${backgroundPosition.top}%`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${backgroundScale * (1 + (scaleFactor - 1) * 0.2)})`, // Apply both scales
          transformOrigin: 'center',
          transition: 'transform 0.3s ease, left 0.3s ease'
        }}
      >
        {/* Rotated Background Image */}
        <div
          style={{
            width: '118.9%', // 1210px / 1017.984px
            height: '84.1%', // 1018px / 1210px
            transform: 'rotate(90deg)',
            flexShrink: 0,
            background: `url(${landingBgOriginal}) lightgray 50% / cover no-repeat`,
            filter: 'saturate(1.3) contrast(1.1) brightness(0.95)',
            opacity: 1
          }}
        />
      </div>

      {/* Group 176 - Illustration (behind text) */}
      <div
        style={{
          position: 'absolute',
          width: `${(547 / 402) * 100}%`, // 136.1% of container
          height: 'auto',
          aspectRatio: '547 / 531',
          left: `${(-70 / 402) * 100}%`, // -17.4% offset
          top: `${(201 / 874) * 100}%`, // 23% from top
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
          width: '100%', // Full width of container (402px)
          height: 'auto',
          aspectRatio: '402 / 177', // Maintain aspect ratio
          top: `${(66 / 874) * 100}%`, // 7.55% from top
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
          fontSize: '20px', // Will scale with container
          fontStyle: 'normal',
          fontWeight: 800,
          lineHeight: '140%',
          top: `${(270 / 874) * 100}%`, // 30.89% from top
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          zIndex: 2,
          width: '100%'
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
          width: `${(370 / 402) * 100}%`, // 92% of container (402 - 16*2 = 370)
          height: '57px', // Fixed height as per spec
          padding: '10px 16px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          alignSelf: 'stretch',
          borderRadius: '10px',
          background: '#FFF3A1',
          border: 'none',
          color: '#3B1389',
          textAlign: 'center',
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '20px', // Will scale with container
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '140%',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: `${(90 / 874) * 100}%`, // 10.3% from bottom
          boxSizing: 'border-box',
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
    </div>
  );
};

export default HIGLandingPage;