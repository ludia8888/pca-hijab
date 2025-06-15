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

  useEffect(() => {
    window.scrollTo(0, 0);
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
    setError(valid ? '' : 'Instagram ID를 확인해주세요');
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
      setError('세션 생성에 실패했습니다. 다시 시도해주세요.');
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
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <h1 className={styles.logo}>PCA Hijab</h1>
          <div className={styles.navLinks}>
            <button onClick={() => scrollToSection('features')} className={styles.navLink}>
              특징
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className={styles.navLink}>
              진단 과정
            </button>
            <button onClick={() => scrollToSection('benefits')} className={styles.navLink}>
              혜택
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleMain}>당신에게 어울리는</span>
              <span className={styles.heroTitleGradient}>완벽한 히잡 컬러</span>
            </h1>
            <p className={styles.heroSubtitle}>
              AI가 찾아주는 나만의 퍼스널 컬러로<br />
              더욱 아름다운 당신을 발견하세요
            </p>
            <div className={styles.heroCta}>
              {!showInstagramInput ? (
                <button 
                  onClick={() => setShowInstagramInput(true)} 
                  className={styles.ctaButton}
                >
                  지금 진단하기
                </button>
              ) : (
                <form onSubmit={handleSubmit} className={styles.instagramForm}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputPrefix}>@</span>
                    <input
                      type="text"
                      value={instagramId}
                      onChange={(e) => handleIdChange(e.target.value)}
                      placeholder="Instagram ID"
                      className={styles.instagramInput}
                      autoFocus
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!isValid || isLoading}
                    className={styles.submitButton}
                  >
                    {isLoading ? '처리중...' : '시작하기'}
                  </button>
                  {error && <p className={styles.errorText}>{error}</p>}
                </form>
              )}
            </div>
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
            <span className={styles.sectionTitleSmall}>왜 PCA Hijab인가요?</span>
            <span className={styles.sectionTitleMain}>AI로 찾는 나만의 컬러</span>
          </h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <div className={styles.iconGradient}>🤖</div>
              </div>
              <h3 className={styles.featureTitle}>정확한 AI 분석</h3>
              <p className={styles.featureDescription}>
                최신 AI 기술로 당신의 피부톤을<br />
                정밀하게 분석합니다
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <div className={styles.iconGradient}>⚡</div>
              </div>
              <h3 className={styles.featureTitle}>빠른 진단</h3>
              <p className={styles.featureDescription}>
                단 30초 만에 당신의<br />
                퍼스널 컬러를 찾아드립니다
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <div className={styles.iconGradient}>🎨</div>
              </div>
              <h3 className={styles.featureTitle}>맞춤 추천</h3>
              <p className={styles.featureDescription}>
                당신에게 어울리는<br />
                히잡 컬러를 추천합니다
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <div className={styles.iconGradient}>🔒</div>
              </div>
              <h3 className={styles.featureTitle}>100% 프라이버시</h3>
              <p className={styles.featureDescription}>
                사진은 분석 후<br />
                즉시 삭제됩니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionTitleSmall}>간단한 3단계</span>
            <span className={styles.sectionTitleMain}>이렇게 진행됩니다</span>
          </h2>
          <div className={styles.stepsContainer}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>사진 업로드</h3>
                <p className={styles.stepDescription}>
                  자연광에서 촬영한<br />
                  얼굴 사진을 업로드하세요
                </p>
              </div>
              <div className={styles.stepImage}>
                <img src="/images/step1.png" alt="Upload photo" />
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>AI 분석</h3>
                <p className={styles.stepDescription}>
                  AI가 당신의 피부톤을<br />
                  정밀하게 분석합니다
                </p>
              </div>
              <div className={styles.stepImage}>
                <img src="/images/step2.png" alt="AI analysis" />
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>결과 확인</h3>
                <p className={styles.stepDescription}>
                  Instagram DM으로<br />
                  맞춤 컬러를 받아보세요
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
            <span className={styles.sectionTitleSmall}>특별한 혜택</span>
            <span className={styles.sectionTitleMain}>더 아름다운 당신을 위해</span>
          </h2>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <img src="/images/benefit1.png" alt="Personalized colors" />
              <h3 className={styles.benefitTitle}>나만의 컬러 팔레트</h3>
              <p className={styles.benefitDescription}>
                계절별 퍼스널 컬러와 함께<br />
                어울리는 히잡 컬러를 제안합니다
              </p>
            </div>
            <div className={styles.benefitCard}>
              <img src="/images/benefit2.png" alt="Shopping guide" />
              <h3 className={styles.benefitTitle}>스마트한 쇼핑 가이드</h3>
              <p className={styles.benefitDescription}>
                더 이상 고민하지 마세요<br />
                당신에게 어울리는 컬러만 선택하세요
              </p>
            </div>
            <div className={styles.benefitCard}>
              <img src="/images/benefit3.png" alt="Confidence boost" />
              <h3 className={styles.benefitTitle}>자신감 UP</h3>
              <p className={styles.benefitDescription}>
                나에게 어울리는 컬러로<br />
                더욱 빛나는 당신이 되세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonials}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionTitleSmall}>사용자 후기</span>
            <span className={styles.sectionTitleMain}>함께한 분들의 이야기</span>
          </h2>
          <div className={styles.testimonialGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialQuote}>"</div>
              <p className={styles.testimonialText}>
                항상 어떤 색이 어울릴지 고민했는데,<br />
                이제는 자신있게 선택할 수 있어요!
              </p>
              <div className={styles.testimonialAuthor}>
                <span className={styles.authorName}>@fashion_lover</span>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialQuote}>"</div>
              <p className={styles.testimonialText}>
                AI 분석이 정말 정확해요.<br />
                추천받은 색상들이 모두 잘 어울려요
              </p>
              <div className={styles.testimonialAuthor}>
                <span className={styles.authorName}>@hijab_style</span>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialQuote}>"</div>
              <p className={styles.testimonialText}>
                쇼핑할 때 정말 유용해요.<br />
                실패 없는 컬러 선택이 가능해졌어요
              </p>
              <div className={styles.testimonialAuthor}>
                <span className={styles.authorName}>@smart_shopper</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.finalCta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            지금 바로 시작하세요
          </h2>
          <p className={styles.ctaSubtitle}>
            30초 만에 당신의 퍼스널 컬러를 찾아드립니다
          </p>
          <button 
            onClick={() => {
              setShowInstagramInput(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            className={styles.ctaButtonLarge}
          >
            무료로 진단받기
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            © 2025 PCA Hijab. All rights reserved.
          </p>
          <p className={styles.footerPrivacy}>
            사진은 분석 후 즉시 삭제되며, 개인정보는 안전하게 보호됩니다.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;