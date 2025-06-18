import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { validateInstagramId } from '@/utils/validators';
import { useAppStore } from '@/store';
import { SessionAPI } from '@/services/api/session';
import { trackSessionStart } from '@/utils/analytics';
import styles from './ModernLandingPage.module.css';

const ModernLandingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const setSessionData = useAppStore((state) => state.setSessionData);
  const [instagramId, setInstagramId] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
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
      {/* Navigation */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🌸</span>
            <span className={styles.logoText}>Noor.AI</span>
          </div>
          <button 
            onClick={() => {
              const ctaSection = document.getElementById('cta-section');
              ctaSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={styles.navButton}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.gradientOrb1} />
          <div className={styles.gradientOrb2} />
          <div className={styles.gradientOrb3} />
        </div>
        
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>✨</span>
            <span>AI-Powered Color Analysis</span>
          </div>
          
          <h1 className={styles.heroTitle}>
            Find Your Perfect
            <br />
            <span className={styles.heroTitleGradient}>Hijab Colors</span>
          </h1>
          
          <p className={styles.heroSubtitle}>
            Discover which hijab colors complement your skin tone with our advanced AI technology.
            Get personalized recommendations in seconds.
          </p>
          
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>Happy Users</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statNumber}>99%</div>
              <div className={styles.statLabel}>Accuracy</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statNumber}>30s</div>
              <div className={styles.statLabel}>Analysis Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Why Choose Noor.AI?</h2>
          <p className={styles.sectionSubtitle}>
            Experience the future of personalized hijab styling
          </p>
          
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <span>🤖</span>
              </div>
              <h3 className={styles.featureTitle}>Advanced AI Analysis</h3>
              <p className={styles.featureDescription}>
                Our cutting-edge AI analyzes your facial features and skin tone to determine your perfect color palette
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <span>🔒</span>
              </div>
              <h3 className={styles.featureTitle}>100% Private & Secure</h3>
              <p className={styles.featureDescription}>
                Your photos are processed instantly and deleted immediately. We never store your personal data
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <span>🎨</span>
              </div>
              <h3 className={styles.featureTitle}>Personalized Palette</h3>
              <p className={styles.featureDescription}>
                Get a custom color palette designed specifically for you, with hijab recommendations that enhance your natural beauty
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <span>📱</span>
              </div>
              <h3 className={styles.featureTitle}>Instagram Delivery</h3>
              <p className={styles.featureDescription}>
                Receive your personalized results directly to your Instagram DM for easy saving and sharing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>
            Get your personalized hijab colors in 3 simple steps
          </p>
          
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Enter Instagram ID</h3>
                <p className={styles.stepDescription}>
                  Simply provide your Instagram username to receive your results
                </p>
              </div>
            </div>
            
            <div className={styles.stepConnector} />
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Upload Your Photo</h3>
                <p className={styles.stepDescription}>
                  Take or upload a clear photo with good lighting for accurate analysis
                </p>
              </div>
            </div>
            
            <div className={styles.stepConnector} />
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Get Your Colors</h3>
                <p className={styles.stepDescription}>
                  Receive your personalized hijab color recommendations via Instagram DM
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta-section" className={styles.cta}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaBackground}>
            <div className={styles.ctaGradient1} />
            <div className={styles.ctaGradient2} />
          </div>
          
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Ready to Discover Your Colors?
            </h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of women who've found their perfect hijab shades
            </p>
            
            <form onSubmit={handleSubmit} className={styles.ctaForm}>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>@</span>
                <input
                  type="text"
                  value={instagramId}
                  onChange={(e) => handleIdChange(e.target.value)}
                  placeholder="your_instagram_id"
                  className={styles.input}
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <p className={styles.error}>{error}</p>
              )}
              
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className={styles.ctaButton}
              >
                {isLoading ? (
                  <span className={styles.loadingText}>Starting...</span>
                ) : (
                  <>
                    Start Analysis
                    <svg 
                      className={styles.buttonIcon} 
                      width="20" 
                      height="20" 
                      viewBox="0 0 20 20" 
                      fill="none"
                    >
                      <path 
                        d="M7.5 5L12.5 10L7.5 15" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>
            
            <p className={styles.ctaNote}>
              <span className={styles.noteIcon}>🔒</span>
              Your privacy is our priority. Photos are deleted immediately after analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <span className={styles.logoIcon}>🌸</span>
            <span className={styles.logoText}>Noor.AI</span>
          </div>
          <p className={styles.footerText}>
            © 2025 Noor.AI. Empowering women with AI-driven beauty solutions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ModernLandingPage;