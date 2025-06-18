import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { validateInstagramId } from '@/utils/validators';
import { useAppStore } from '@/store';
import { SessionAPI } from '@/services/api/session';
import { trackSessionStart } from '@/utils/analytics';
import styles from './HIGLandingPage.module.css';

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
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  // Track scroll progress for depth effects and sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrolled / maxScroll, 1);
      setScrollProgress(progress);
      setIsScrolled(scrolled > 20);
      
      // Show sticky CTA when user scrolls past hero section
      const heroHeight = heroRef.current?.offsetHeight || 0;
      setShowStickyCTA(scrolled > heroHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleIdChange = (value: string): void => {
    const cleanedValue = value.replace('@', '').toLowerCase();
    setInstagramId(cleanedValue);
    
    if (cleanedValue.length === 0) {
      setError('');
      setIsValid(false);
      return;
    }

    const valid = validateInstagramId(cleanedValue);
    setIsValid(valid);
    setError(valid ? '' : 'Please enter a valid Instagram ID');
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    try {
      const response = await SessionAPI.createSession(instagramId);
      setSessionData(response.data.sessionId, response.data.instagramId);
      trackSessionStart(instagramId);
      navigate(ROUTES.UPLOAD);
    } catch {
      setError('Failed to create session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Liquid Glass Overlay */}
      <div className={styles.liquidGlassOverlay} />
      
      {/* Minimal Navigation - Deference principle */}
      <nav className={`${styles.nav} ${isScrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>◐</span>
            <span className={styles.logoType}>Noor</span>
          </div>
        </div>
      </nav>

      {/* Hero Section - Content First */}
      <section ref={heroRef} className={styles.hero}>
        {/* Depth Layers */}
        <div className={styles.depthLayer1} />
        <div className={styles.depthLayer2} />
        <div className={styles.depthLayer3} />

        <div className={styles.heroContent}>
          {/* Clarity - Clear hierarchy */}
          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine1}>Personal Color</span>
            <span className={styles.titleLine2}>Analysis</span>
            <span className={styles.titleAccent}>for Hijab</span>
          </h1>
          
          <p className={styles.heroDescription}>
            Discover your unique color palette through advanced AI technology.
          </p>

          {/* CTA Card */}
          <div className={styles.ctaCard}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={instagramId}
                  onChange={(e) => handleIdChange(e.target.value)}
                  placeholder="Instagram ID"
                  className={styles.input}
                  disabled={isLoading}
                />
                <div className={styles.inputLine} />
              </div>
              
              {error && (
                <p className={styles.error}>{error}</p>
              )}
              
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className={styles.submitButton}
              >
                <span className={styles.buttonText}>
                  {isLoading ? 'Starting...' : 'Begin Analysis'}
                </span>
                <div className={styles.buttonGlow} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Feature Section - Depth through spacing */}
      <section className={styles.features}>
        <div className={styles.featureGrid}>
          {/* AI Technology */}
          <div className={styles.featureCard}>
            <div className={styles.featureGlass}>
              <div className={styles.featureIcon}>
                <span className={styles.iconSymbol}>◎</span>
              </div>
              <h3 className={styles.featureTitle}>Advanced AI</h3>
              <p className={styles.featureText}>
                Neural networks analyze your unique features
              </p>
            </div>
          </div>

          {/* Privacy First */}
          <div className={styles.featureCard}>
            <div className={styles.featureGlass}>
              <div className={styles.featureIcon}>
                <span className={styles.iconSymbol}>◉</span>
              </div>
              <h3 className={styles.featureTitle}>Private & Secure</h3>
              <p className={styles.featureText}>
                Your data is processed and immediately deleted
              </p>
            </div>
          </div>

          {/* Instant Results */}
          <div className={styles.featureCard}>
            <div className={styles.featureGlass}>
              <div className={styles.featureIcon}>
                <span className={styles.iconSymbol}>◐</span>
              </div>
              <h3 className={styles.featureTitle}>Instant Results</h3>
              <p className={styles.featureText}>
                Receive personalized recommendations in seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section - Liquid Glass Experience */}
      <section className={styles.process}>
        {/* Floating glass title */}
        <div className={styles.processTitleContainer}>
          <h2 className={styles.processTitle}>
            <span className={styles.titleGlass}>Simple</span>
            <span className={styles.titleRefraction}>Process</span>
          </h2>
          <p className={styles.processSubtitle}>Three steps to discover your colors</p>
        </div>
        
        {/* 3D Glass Cards Container */}
        <div className={styles.processContainer}>
          {/* Ambient light orbs */}
          <div className={styles.lightOrb1} />
          <div className={styles.lightOrb2} />
          <div className={styles.lightOrb3} />
          
          {/* Glass cards with unique layouts */}
          <div className={styles.processGrid}>
            {/* Upload Card - Floating left */}
            <div className={`${styles.processCard} ${styles.cardUpload}`}>
              {/* Glass layers */}
              <div className={styles.glassLayer1} />
              <div className={styles.glassLayer2} />
              <div className={styles.glassContent}>
                <div className={styles.iconContainer}>
                  <div className={styles.iconGlass}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M7 10L12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 5V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <div className={styles.cardText}>
                  <h3 className={styles.cardTitle}>Upload</h3>
                  <p className={styles.cardDescription}>Clear photo with natural lighting</p>
                </div>
                <div className={styles.stepBadge}>01</div>
              </div>
            </div>

            {/* Analyze Card - Center elevated */}
            <div className={`${styles.processCard} ${styles.cardAnalyze}`}>
              <div className={styles.glassLayer1} />
              <div className={styles.glassLayer2} />
              <div className={styles.glassContent}>
                <div className={styles.iconContainer}>
                  <div className={styles.iconGlass}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 1V5M12 19V23M4.22 4.22L7.05 7.05M16.95 16.95L19.78 19.78M1 12H5M19 12H23M4.22 19.78L7.05 16.95M16.95 7.05L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <div className={styles.cardText}>
                  <h3 className={styles.cardTitle}>Analyze</h3>
                  <p className={styles.cardDescription}>AI processes your unique features</p>
                </div>
                <div className={styles.stepBadge}>02</div>
                {/* Animated pulse ring */}
                <div className={styles.pulseRing} />
              </div>
              <div className={styles.refractionLayer} />
            </div>

            {/* Receive Card - Floating right */}
            <div className={`${styles.processCard} ${styles.cardReceive}`}>
              <div className={styles.glassLayer1} />
              <div className={styles.glassLayer2} />
              <div className={styles.glassContent}>
                <div className={styles.iconContainer}>
                  <div className={styles.iconGlass}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <div className={styles.cardText}>
                  <h3 className={styles.cardTitle}>Receive</h3>
                  <p className={styles.cardDescription}>Get your personalized color guide</p>
                </div>
                <div className={styles.stepBadge}>03</div>
              </div>
              <div className={styles.refractionLayer} />
            </div>
          </div>

          {/* Liquid flow connectors */}
          <svg className={styles.flowConnectors} viewBox="0 0 800 400" fill="none">
            <path 
              className={styles.flowPath1}
              d="M 150 200 Q 250 150 350 200"
              stroke="url(#flowGradient1)"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <path 
              className={styles.flowPath2}
              d="M 450 200 Q 550 150 650 200"
              stroke="url(#flowGradient2)"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <defs>
              <linearGradient id="flowGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(236, 72, 153, 0.3)" />
                <stop offset="100%" stopColor="rgba(147, 51, 234, 0.3)" />
              </linearGradient>
              <linearGradient id="flowGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(147, 51, 234, 0.3)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* Sticky CTA - Appears when scrolling past hero */}
      {showStickyCTA && (
        <div className={styles.stickyCTA}>
          <div className={styles.stickyContent}>
            <div className={styles.stickyText}>
              <h3>Ready to discover your colors?</h3>
              <p>Start your personal color analysis now</p>
            </div>
            <form onSubmit={handleSubmit} className={styles.stickyForm}>
              <div className={styles.stickyInputGroup}>
                <input
                  type="text"
                  value={instagramId}
                  onChange={(e) => handleIdChange(e.target.value)}
                  placeholder="Instagram ID"
                  className={styles.stickyInput}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className={styles.stickyButton}
                >
                  {isLoading ? 'Starting...' : 'Begin Analysis'}
                </button>
              </div>
              {error && (
                <p className={styles.stickyError}>{error}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Footer - Minimal presence */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © 2025 Noor.AI · Privacy-first color analysis
        </p>
      </footer>

      {/* Progress Indicator with spring physics */}
      <div 
        className={styles.progressIndicator}
        style={{ 
          transform: `scaleY(${scrollProgress})`,
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </div>
  );
};

export default HIGLandingPage;