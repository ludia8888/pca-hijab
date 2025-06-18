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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  // Track scroll progress for depth effects
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrolled / maxScroll, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track mouse for subtle parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
      <nav className={styles.nav}>
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
        <div 
          className={styles.depthLayer1}
          style={{
            transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
          }}
        />
        <div 
          className={styles.depthLayer2}
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
          }}
        />
        <div 
          className={styles.depthLayer3}
          style={{
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
          }}
        />

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

          {/* Interactive CTA Card */}
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

      {/* Process Section - Visual hierarchy */}
      <section className={styles.process}>
        <h2 className={styles.processTitle}>Simple Process</h2>
        
        <div className={styles.processSteps}>
          <div className={styles.processStep}>
            <div className={styles.stepNumber}>01</div>
            <div className={styles.stepContent}>
              <h4 className={styles.stepTitle}>Upload</h4>
              <p className={styles.stepText}>Clear photo with natural lighting</p>
            </div>
          </div>

          <div className={styles.processConnector} />

          <div className={styles.processStep}>
            <div className={styles.stepNumber}>02</div>
            <div className={styles.stepContent}>
              <h4 className={styles.stepTitle}>Analyze</h4>
              <p className={styles.stepText}>AI processes your unique features</p>
            </div>
          </div>

          <div className={styles.processConnector} />

          <div className={styles.processStep}>
            <div className={styles.stepNumber}>03</div>
            <div className={styles.stepContent}>
              <h4 className={styles.stepTitle}>Receive</h4>
              <p className={styles.stepText}>Get your personalized color guide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal presence */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © 2025 Noor.AI · Privacy-first color analysis
        </p>
      </footer>

      {/* Progress Indicator */}
      <div 
        className={styles.progressIndicator}
        style={{ transform: `scaleY(${scrollProgress})` }}
      />
    </div>
  );
};

export default HIGLandingPage;