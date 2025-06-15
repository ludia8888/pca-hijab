import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { validateInstagramId } from '@/utils/validators';
import { useAppStore } from '@/store';
import { SessionAPI } from '@/services/api/session';
import styles from './LandingPage.module.css';

const LandingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const setSessionData = useAppStore((state) => state.setSessionData);
  const [instagramId, setInstagramId] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [showInstagramInput, setShowInstagramInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navContent}>
          <h1 className={styles.logo}>PCA Hijab</h1>
          <div className={styles.navLinks}>
            <button onClick={() => scrollToSection('features')} className={styles.navLink}>
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className={styles.navLink}>
              How it Works
            </button>
            <button onClick={() => scrollToSection('benefits')} className={styles.navLink}>
              Benefits
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleMain}>Discover Your</span>
              <span className={styles.heroTitleGradient}>Perfect Hijab Colors</span>
            </h1>
            <p className={styles.heroSubtitle}>
              AI-powered personal color analysis<br />
              designed specifically for hijab wearers
            </p>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.heroImagePlaceholder}>
              <img src="/images/hero-hijab.png" alt="Beautiful hijab colors" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionTitleSmall}>Why Choose PCA Hijab?</span>
            <span className={styles.sectionTitleMain}>AI-Powered Color Analysis</span>
          </h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <div className={styles.iconGradient}>🤖</div>
              </div>
              <h3 className={styles.featureTitle}>Accurate AI Analysis</h3>
              <p className={styles.featureDescription}>
                Advanced AI technology<br />
                precisely analyzes your skin tone
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <div className={styles.iconGradient}>⚡</div>
              </div>
              <h3 className={styles.featureTitle}>Quick Results</h3>
              <p className={styles.featureDescription}>
                Get your personal color<br />
                analysis in just 30 seconds
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <div className={styles.iconGradient}>🎨</div>
              </div>
              <h3 className={styles.featureTitle}>Custom Recommendations</h3>
              <p className={styles.featureDescription}>
                Hijab colors perfectly<br />
                matched to your skin tone
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <div className={styles.iconGradient}>🔒</div>
              </div>
              <h3 className={styles.featureTitle}>100% Privacy</h3>
              <p className={styles.featureDescription}>
                Your photos are deleted<br />
                immediately after analysis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionTitleSmall}>Simple 3-Step Process</span>
            <span className={styles.sectionTitleMain}>How It Works</span>
          </h2>
          <div className={styles.stepsContainer}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Upload Photo</h3>
                <p className={styles.stepDescription}>
                  Take a photo in<br />
                  natural lighting
                </p>
              </div>
              <div className={styles.stepImage}>
                <img src="/images/step1.png" alt="Upload photo" />
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>AI Analysis</h3>
                <p className={styles.stepDescription}>
                  Our AI analyzes<br />
                  your skin tone
                </p>
              </div>
              <div className={styles.stepImage}>
                <img src="/images/step2.png" alt="AI analysis" />
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Get Results</h3>
                <p className={styles.stepDescription}>
                  Receive personalized<br />
                  colors via Instagram DM
                </p>
              </div>
              <div className={styles.stepImage}>
                <img src="/images/step3.png" alt="Get results" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className={styles.benefits}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionTitleSmall}>Exclusive Benefits</span>
            <span className={styles.sectionTitleMain}>Enhance Your Beauty</span>
          </h2>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <img src="/images/benefit1.png" alt="Personalized colors" />
              <h3 className={styles.benefitTitle}>Personal Color Palette</h3>
              <p className={styles.benefitDescription}>
                Seasonal color analysis with<br />
                hijab color recommendations
              </p>
            </div>
            <div className={styles.benefitCard}>
              <img src="/images/benefit2.png" alt="Shopping guide" />
              <h3 className={styles.benefitTitle}>Smart Shopping Guide</h3>
              <p className={styles.benefitDescription}>
                Never second-guess again<br />
                Choose colors that truly suit you
              </p>
            </div>
            <div className={styles.benefitCard}>
              <img src="/images/benefit3.png" alt="Confidence boost" />
              <h3 className={styles.benefitTitle}>Confidence Boost</h3>
              <p className={styles.benefitDescription}>
                Shine brighter with colors<br />
                that enhance your natural beauty
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={styles.statistics}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionTitleSmall}>Join the Revolution</span>
            <span className={styles.sectionTitleMain}>Transform Your Style Today</span>
          </h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>85%</div>
              <div className={styles.statLabel}>Report Better Shopping Decisions</div>
              <div className={styles.statDescription}>
                Save money by choosing colors that truly work
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>Happy Users This Month</div>
              <div className={styles.statDescription}>
                Growing community of confident hijabis
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>30s</div>
              <div className={styles.statLabel}>To Complete Analysis</div>
              <div className={styles.statDescription}>
                Faster than any salon consultation
              </div>
            </div>
          </div>
          <div className={styles.comparisonSection}>
            <h3 className={styles.comparisonTitle}>Why Guess When You Can Know?</h3>
            <div className={styles.comparisonGrid}>
              <div className={styles.comparisonCard}>
                <div className={styles.comparisonIcon}>❌</div>
                <h4 className={styles.comparisonHeading}>Without PCA Hijab</h4>
                <ul className={styles.comparisonList}>
                  <li>Waste money on wrong colors</li>
                  <li>Hijabs sitting unused in closet</li>
                  <li>Always unsure about purchases</li>
                  <li>Miss out on your best looks</li>
                </ul>
              </div>
              <div className={styles.comparisonCard}>
                <div className={styles.comparisonIcon}>✅</div>
                <h4 className={styles.comparisonHeading}>With PCA Hijab</h4>
                <ul className={styles.comparisonList}>
                  <li>Shop with 100% confidence</li>
                  <li>Every hijab enhances your beauty</li>
                  <li>Save money on perfect choices</li>
                  <li>Discover your signature style</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.finalCta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            Start Your Journey Today
          </h2>
          <p className={styles.ctaSubtitle}>
            Discover your personal colors in just 30 seconds
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            © 2025 PCA Hijab. All rights reserved.
          </p>
          <p className={styles.footerPrivacy}>
            Your photos are deleted immediately after analysis. Your privacy is our priority.
          </p>
        </div>
      </footer>

      {/* Floating CTA */}
      <div className={`${styles.floatingCta} ${showInstagramInput ? styles.floatingCtaActive : ''}`}>
        {!showInstagramInput ? (
          <button 
            onClick={() => setShowInstagramInput(true)} 
            className={styles.floatingButton}
          >
            Get Started
          </button>
        ) : (
          <form onSubmit={handleSubmit} className={styles.floatingForm}>
            <div className={styles.floatingInputWrapper}>
              <span className={styles.inputPrefix}>@</span>
              <input
                type="text"
                value={instagramId}
                onChange={(e) => handleIdChange(e.target.value)}
                placeholder="Instagram ID"
                className={styles.floatingInput}
                autoFocus
              />
              <button 
                type="submit" 
                disabled={!isValid || isLoading}
                className={styles.floatingSubmit}
              >
                {isLoading ? '...' : '→'}
              </button>
            </div>
            {error && <p className={styles.floatingError}>{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default LandingPage;