import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  describe('렌더링', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button</Button>);
      
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('variants', () => {
    it('should render primary variant by default', () => {
      render(<Button>Primary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
      expect(button.className).toMatch(/bg-primary/);
      expect(button.className).toMatch(/shadow-primary/);
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('border-primary');
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('border-gray-300');
    });
  });

  describe('sizes', () => {
    it('should render medium size by default', () => {
      render(<Button>Medium</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-body');
    });

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-body-sm');
    });

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-8', 'py-4', 'text-body-lg');
    });
  });

  describe('states', () => {
    it('should handle disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should handle loading state', () => {
      render(<Button loading>Loading</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      // Check for loading spinner
      const spinner = button.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should be disabled when loading', () => {
      render(<Button loading>Loading</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('width', () => {
    it('should render with auto width by default', () => {
      render(<Button>Auto width</Button>);
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });

    it('should render full width when specified', () => {
      render(<Button fullWidth>Full width</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('icons', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;

    it('should render icon on the left by default', () => {
      render(<Button icon={<TestIcon />}>With Icon</Button>);
      
      const icon = screen.getByTestId('test-icon');
      const button = screen.getByRole('button');
      
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveClass('mr-2');
      
      // Icon should come before text
      const buttonText = screen.getByText('With Icon');
      expect(button.firstElementChild).toContainElement(icon);
      expect(button.lastElementChild).toContainElement(buttonText);
    });

    it('should render icon on the right when specified', () => {
      render(<Button icon={<TestIcon />} iconPosition="right">With Icon</Button>);
      
      const icon = screen.getByTestId('test-icon');
      expect(icon.parentElement).toHaveClass('order-2', 'ml-2');
    });

    it('should not show icon when loading', () => {
      render(<Button icon={<TestIcon />} loading>Loading</Button>);
      
      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not trigger click when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick} loading>Loading</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML button attributes', () => {
      render(
        <Button 
          type="submit" 
          name="test-button"
          form="test-form"
          aria-label="Custom label"
        >
          Submit
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'test-button');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });
  });
});