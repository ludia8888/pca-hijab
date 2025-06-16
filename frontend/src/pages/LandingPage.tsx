import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { validateInstagramId } from '@/utils/validators';
import { useAppStore } from '@/store';
import { SessionAPI } from '@/services/api/session';
import { AnalyticsEvents } from '@/utils/analytics';
import styles from './LandingPage.module.css';

const LandingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const setSessionData = useAppStore((state) => state.setSessionData);
  const [instagramId, setInstagramId] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showApp, setShowApp] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowApp(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleIdChange = (value: string): void => {
    const cleanedValue = value.replace('@', '');
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
      navigate(ROUTES.UPLOAD);
    } catch {
      setError('Failed to create session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        setCurrentSlide((prev) => (prev + 1) % 3);
      } else {
        setCurrentSlide((prev) => (prev - 1 + 3) % 3);
      }
    }
  };

  const slides = [
    {
      emoji: '🤳',
      title: 'Take a Selfie',
      description: 'Snap a photo in natural light'
    },
    {
      emoji: '🤖',
      title: 'AI Analysis',
      description: 'Our AI analyzes your skin tone'
    },
    {
      emoji: '🎨',
      title: 'Get Your Colors',
      description: 'Receive personalized hijab colors'
    }
  ];

  return (
    <div className={`${styles.container} ${showApp ? styles.show : ''}`}>
      <div className={styles.appWrapper}>
        {/* Status Bar */}
        <div className={styles.statusBar}>
          <div className={styles.statusTime}>9:41</div>
          <div className={styles.statusIcons}>
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.logo}>PCA Hijab</h1>
          <div className={styles.headerTag}>AI Color Analysis</div>
        </header>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>
              Find Your Perfect
              <span className={styles.heroGradient}> Hijab Colors</span>
            </h2>
            <p className={styles.heroSubtitle}>
              AI-powered personal color analysis in 30 seconds
            </p>
          </div>

          {/* Slider */}
          <div 
            className={styles.slider}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className={styles.sliderTrack}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className={styles.slide}>
                  <div className={styles.slideEmoji}>{slide.emoji}</div>
                  <h3 className={styles.slideTitle}>{slide.title}</h3>
                  <p className={styles.slideDescription}>{slide.description}</p>
                </div>
              ))}
            </div>
            <div className={styles.sliderDots}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${currentSlide === index ? styles.dotActive : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className={styles.features}>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <div className={styles.featureText}>
                <h4>Fast</h4>
                <p>30 seconds</p>
              </div>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔒</div>
              <div className={styles.featureText}>
                <h4>Private</h4>
                <p>100% secure</p>
              </div>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎯</div>
              <div className={styles.featureText}>
                <h4>Accurate</h4>
                <p>AI precision</p>
              </div>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📱</div>
              <div className={styles.featureText}>
                <h4>Easy</h4>
                <p>DM delivery</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>10K+</div>
            <div className={styles.statLabel}>Happy Users</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>85%</div>
            <div className={styles.statLabel}>Better Choices</div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <span className={styles.inputPrefix}>@</span>
                <input
                  type="text"
                  value={instagramId}
                  onChange={(e) => handleIdChange(e.target.value)}
                  placeholder="your.instagram"
                  className={styles.input}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
            </div>
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className={styles.ctaButton}
            >
              {isLoading ? (
                <span className={styles.loader}></span>
              ) : (
                'Start Analysis'
              )}
            </button>
          </form>
          <p className={styles.ctaHint}>
            Free • No sign-up required • Results via DM
          </p>
        </section>

        {/* Bottom Safe Area */}
        <div className={styles.bottomSafe} />
      </div>
    </div>
  );
};

export default LandingPage;