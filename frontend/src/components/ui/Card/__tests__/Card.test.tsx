import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '../Card';

// Helper function to render Card with testid
const renderCard = (props?: any, children = 'Content') => {
  const { container } = render(
    <Card data-testid="test-card" {...props}>
      {children}
    </Card>
  );
  return screen.getByTestId('test-card');
};

describe('Card', () => {
  describe('렌더링', () => {
    it('should render card with children', () => {
      render(
        <Card data-testid="test-card">
          <p>Card content</p>
        </Card>
      );
      
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Card className="custom-class" data-testid="test-card">
          Content
        </Card>
      );
      
      const card = screen.getByTestId('test-card');
      expect(card).toHaveClass('custom-class');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(
        <Card ref={ref}>
          Content
        </Card>
      );
      
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('padding', () => {
    it('should apply medium padding by default', () => {
      const card = renderCard();
      expect(card).toHaveClass('p-6');
    });

    it('should apply small padding', () => {
      const card = renderCard({ padding: 'sm' });
      expect(card).toHaveClass('p-4');
    });

    it('should apply large padding', () => {
      const card = renderCard({ padding: 'lg' });
      expect(card).toHaveClass('p-8');
    });
  });

  describe('shadow', () => {
    it('should apply medium shadow by default', () => {
      const card = renderCard();
      expect(card).toHaveClass('shadow-md');
    });

    it('should apply small shadow', () => {
      const card = renderCard({ shadow: 'sm' });
      expect(card).toHaveClass('shadow-sm');
    });

    it('should apply large shadow', () => {
      const card = renderCard({ shadow: 'lg' });
      expect(card).toHaveClass('shadow-lg');
    });
  });

  describe('hover effect', () => {
    it('should not have hover effect by default', () => {
      const card = renderCard();
      expect(card).not.toHaveClass('cursor-pointer');
      expect(card.className).not.toMatch(/hover:shadow-lg/);
    });

    it('should apply hover effect when enabled', () => {
      const card = renderCard({ hover: true });
      expect(card).toHaveClass('cursor-pointer');
      expect(card.className).toMatch(/hover:shadow-lg/);
      expect(card.className).toMatch(/hover:translate-y-\[-4px\]/);
    });
  });

  describe('interactions', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      const card = renderCard({ onClick: handleClick }, 'Click me');
      await user.click(card);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should apply cursor pointer when onClick is provided', () => {
      const handleClick = vi.fn();
      const card = renderCard({ onClick: handleClick }, 'Clickable');
      expect(card).toHaveClass('cursor-pointer');
    });
  });

  describe('styling', () => {
    it('should have base styles', () => {
      const card = renderCard();
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('border-gray-200');
    });

    it('should combine all style props correctly', () => {
      const card = renderCard({
        padding: 'lg',
        shadow: 'sm',
        hover: true,
        className: 'custom-class'
      }, 'Combined styles');
      
      expect(card).toHaveClass('p-8'); // padding
      expect(card).toHaveClass('shadow-sm'); // shadow
      expect(card).toHaveClass('cursor-pointer'); // hover
      expect(card).toHaveClass('custom-class'); // custom
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML div attributes', () => {
      const card = renderCard({
        role: 'article',
        'aria-label': 'Featured content'
      });
      
      expect(card).toHaveAttribute('role', 'article');
      expect(card).toHaveAttribute('aria-label', 'Featured content');
      expect(card).toHaveAttribute('data-testid', 'test-card');
    });
  });
});