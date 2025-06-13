import { useEffect, useRef, ReactNode } from 'react';
import { FunnelTracker } from '@/utils/funnelAnalytics';

interface TrackingWrapperProps {
  children: ReactNode;
  elementName: string;
  pageSection: string;
  trackClicks?: boolean;
  trackHovers?: boolean;
  trackScrollIntoView?: boolean;
  metadata?: Record<string, any>;
}

export const TrackingWrapper = ({
  children,
  elementName,
  pageSection,
  trackClicks = true,
  trackHovers = false,
  trackScrollIntoView = false,
  metadata = {}
}: TrackingWrapperProps): JSX.Element => {
  const elementRef = useRef<HTMLDivElement>(null);
  const hasScrolledIntoView = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 클릭 추적
    const handleClick = (event: MouseEvent) => {
      if (trackClicks) {
        const target = event.target as HTMLElement;
        const clickedElement = target.closest('button, a, input, [role="button"]') || target;
        
        FunnelTracker.trackInteraction(
          elementName,
          'click',
          pageSection,
          {
            clicked_element: clickedElement.tagName.toLowerCase(),
            element_text: clickedElement.textContent?.slice(0, 50) || '',
            element_classes: clickedElement.className,
            ...metadata
          }
        );
      }
    };

    // 호버 추적
    const handleMouseEnter = () => {
      if (trackHovers) {
        FunnelTracker.trackInteraction(elementName, 'hover', pageSection, metadata);
      }
    };

    // 스크롤 진입 추적
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasScrolledIntoView.current && trackScrollIntoView) {
          hasScrolledIntoView.current = true;
          FunnelTracker.trackInteraction(
            elementName,
            'scroll_into_view',
            pageSection,
            {
              viewport_percentage: Math.round(entry.intersectionRatio * 100),
              ...metadata
            }
          );
        }
      });
    };

    // 이벤트 리스너 등록
    if (trackClicks) element.addEventListener('click', handleClick);
    if (trackHovers) element.addEventListener('mouseenter', handleMouseEnter);

    // Intersection Observer 설정
    let observer: IntersectionObserver | null = null;
    if (trackScrollIntoView) {
      observer = new IntersectionObserver(observerCallback, {
        threshold: [0.1, 0.5, 0.9]
      });
      observer.observe(element);
    }

    return () => {
      if (trackClicks) element.removeEventListener('click', handleClick);
      if (trackHovers) element.removeEventListener('mouseenter', handleMouseEnter);
      if (observer) observer.disconnect();
    };
  }, [elementName, pageSection, trackClicks, trackHovers, trackScrollIntoView, metadata]);

  return (
    <div ref={elementRef} style={{ display: 'contents' }}>
      {children}
    </div>
  );
};

// 버튼 전용 추적 컴포넌트
interface TrackedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  buttonName: string;
  pageSection: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  metadata?: Record<string, any>;
}

export const TrackedButton = ({
  children,
  buttonName,
  pageSection,
  variant = 'primary',
  metadata = {},
  onClick,
  ...props
}: TrackedButtonProps): JSX.Element => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    FunnelTracker.trackInteraction(
      buttonName,
      'click',
      pageSection,
      {
        button_variant: variant,
        button_text: typeof children === 'string' ? children : 'complex_content',
        ...metadata
      }
    );

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
};