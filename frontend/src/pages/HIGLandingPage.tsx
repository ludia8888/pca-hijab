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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const animationFrame = useRef<number>();
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll progress for depth effects
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrolled / maxScroll, 1);
      setScrollProgress(progress);
      setIsScrolled(scrolled > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track mouse for parallax and physics-based tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      
      // Calculate velocity for momentum effects
      const vx = e.clientX - lastMousePos.current.x;
      const vy = e.clientY - lastMousePos.current.y;
      setVelocity({ x: vx, y: vy });
      
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      setMousePosition({ x, y });
      
      // Physics-based tilt for cards
      if (ctaRef.current) {
        const rect = ctaRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const tiltX = ((e.clientY - centerY) / window.innerHeight) * 15;
        const tiltY = ((e.clientX - centerX) / window.innerWidth) * -15;
        setTilt({ x: tiltX, y: tiltY });
      }
    };
    
    const handleMouseLeave = () => {
      // Spring back animation
      setTilt({ x: 0, y: 0 });
      setVelocity({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
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
        <div 
          className={styles.depthLayer1}
          style={{
            transform: `
              translate3d(
                ${mousePosition.x * 15 + velocity.x * 0.5}px, 
                ${mousePosition.y * 15 + velocity.y * 0.5}px,
                -100px
              ) 
              scale(${1 + Math.abs(velocity.x) * 0.001})
            `,
            '--depth': '-100px',
            '--blur': '60px',
          } as React.CSSProperties}
        />
        <div 
          className={styles.depthLayer2}
          style={{
            transform: `
              translate3d(
                ${mousePosition.x * 25 + velocity.x * 0.3}px, 
                ${mousePosition.y * 25 + velocity.y * 0.3}px,
                -50px
              )
              scale(${1 + Math.abs(velocity.y) * 0.001})
            `,
            '--depth': '-50px',
            '--blur': '80px',
          } as React.CSSProperties}
        />
        <div 
          className={styles.depthLayer3}
          style={{
            transform: `
              translate3d(
                ${mousePosition.x * 35 + velocity.x * 0.2}px, 
                ${mousePosition.y * 35 + velocity.y * 0.2}px,
                0px
              )
              scale(${1 + Math.abs(velocity.x + velocity.y) * 0.0005})
            `,
            '--depth': '0px',
            '--blur': '100px',
          } as React.CSSProperties}
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

          {/* Interactive CTA Card with physics */}
          <div 
            ref={ctaRef}
            className={styles.ctaCard}
            style={{
              transform: `
                perspective(1000px)
                rotateX(${tilt.x}deg)
                rotateY(${tilt.y}deg)
                translateZ(20px)
                scale(${1 + Math.abs(velocity.x + velocity.y) * 0.0001})
              `,
              transition: tilt.x === 0 && tilt.y === 0 
                ? 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                : 'none',
            }}
          >
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
          <div 
            className={styles.processStep}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
              e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty('--mouse-x', '50%');
              e.currentTarget.style.setProperty('--mouse-y', '50%');
            }}
          >
            <div className={styles.stepNumber}>01</div>
            <div className={styles.stepContent}>
              <h4 className={styles.stepTitle}>Upload</h4>
              <p className={styles.stepText}>Clear photo with natural lighting</p>
            </div>
          </div>

          <div className={styles.processConnector} />

          <div 
            className={styles.processStep}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
              e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty('--mouse-x', '50%');
              e.currentTarget.style.setProperty('--mouse-y', '50%');
            }}
          >
            <div className={styles.stepNumber}>02</div>
            <div className={styles.stepContent}>
              <h4 className={styles.stepTitle}>Analyze</h4>
              <p className={styles.stepText}>AI processes your unique features</p>
            </div>
          </div>

          <div className={styles.processConnector} />

          <div 
            className={styles.processStep}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
              e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty('--mouse-x', '50%');
              e.currentTarget.style.setProperty('--mouse-y', '50%');
            }}
          >
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