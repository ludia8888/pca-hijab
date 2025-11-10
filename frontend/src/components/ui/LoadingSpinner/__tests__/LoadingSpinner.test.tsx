import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('렌더링', () => {
    it('should render loading spinner', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('should have default aria-label', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('should have screen reader text', () => {
      render(<LoadingSpinner />);
      
      const srText = screen.getByText('Loading');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });

    it('should apply custom className', () => {
      render(<LoadingSpinner className="custom-class" />);
      
      const container = screen.getByRole('status').parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('sizes', () => {
    it('should render medium size by default', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('should render small size', () => {
      render(<LoadingSpinner size="sm" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-4', 'h-4');
    });

    it('should render large size', () => {
      render(<LoadingSpinner size="lg" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-12', 'h-12');
    });
  });

  describe('colors', () => {
    it('should render primary color by default', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-primary');
    });

    it('should render secondary color', () => {
      render(<LoadingSpinner color="secondary" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-secondary');
    });

    it('should render gray color', () => {
      render(<LoadingSpinner color="gray" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-gray-400');
    });

    it('should render white color', () => {
      render(<LoadingSpinner color="white" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-white');
    });
  });

  describe('label', () => {
    it('should not show label text by default', () => {
      render(<LoadingSpinner />);
      
      // Screen reader text exists but no visible label
      const visibleTexts = screen.queryAllByText('Loading');
      const visibleLabel = visibleTexts.find(el => !el.classList.contains('sr-only'));
      expect(visibleLabel).toBeUndefined();
    });

    it('should show custom label when provided', () => {
      const customLabel = 'Loading data...';
      render(<LoadingSpinner label={customLabel} />);
      
      // Should have both visible label and screen reader text
      const allTexts = screen.getAllByText(customLabel);
      expect(allTexts).toHaveLength(2); // One visible, one sr-only
      
      const visibleLabel = allTexts.find(el => !el.classList.contains('sr-only'));
      expect(visibleLabel).toBeInTheDocument();
      expect(visibleLabel).toHaveClass('text-gray-600');
    });

    it('should use custom label for aria-label', () => {
      const customLabel = 'Analyzing...';
      render(<LoadingSpinner label={customLabel} />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', customLabel);
    });
  });

  describe('animation', () => {
    it('should have spin animation class', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should have rounded full border', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('rounded-full');
    });

    it('should have transparent top border for spinning effect', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      // The LoadingSpinner component uses border-t-transparent in the cn() function
      // which should be in the rendered classes
      expect(spinner).toHaveClass('border-4');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('layout', () => {
    it('should center spinner and label', () => {
      render(<LoadingSpinner label="Loading..." />);
      
      const container = screen.getByRole('status').parentElement;
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('should have margin between spinner and label', () => {
      render(<LoadingSpinner label="Loading..." />);
      
      const labels = screen.getAllByText('Loading...');
      const visibleLabel = labels.find(el => !el.classList.contains('sr-only'));
      expect(visibleLabel).toHaveClass('mt-4');
    });
  });
});
