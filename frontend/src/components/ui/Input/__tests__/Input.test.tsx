import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input', () => {
  describe('렌더링', () => {
    it('should render input element', () => {
      render(<Input placeholder="Enter text" />);
      
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Input className="custom-class" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('label', () => {
    it('should render label when provided', () => {
      render(<Input label="Username" />);
      
      const label = screen.getByText('Username');
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
    });

    it('should associate label with input', () => {
      render(<Input label="Email" />);
      
      const label = screen.getByText('Email');
      const input = screen.getByRole('textbox');
      
      expect(label).toHaveAttribute('for');
      expect(input).toHaveAttribute('id');
      expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
    });

    it('should show required indicator when required', () => {
      render(<Input label="Password" required />);
      
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveClass('text-error');
    });
  });

  describe('sizes', () => {
    it('should render medium size by default', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('py-3', 'text-body');
    });

    it('should render small size', () => {
      render(<Input size="sm" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('py-2', 'text-body-sm');
    });

    it('should render large size', () => {
      render(<Input size="lg" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('py-4', 'text-body-lg');
    });
  });

  describe('states', () => {
    it('should handle disabled state', () => {
      render(<Input disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:bg-gray-100', 'disabled:cursor-not-allowed');
    });

    it('should handle error state', () => {
      const errorMessage = 'This field is required';
      render(<Input error={errorMessage} />);
      
      const input = screen.getByRole('textbox');
      const error = screen.getByText(errorMessage);
      
      expect(input).toHaveClass('border-error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
      expect(error).toBeInTheDocument();
      expect(error).toHaveClass('text-error');
    });

    it('should show helper text when provided', () => {
      const helperText = 'Enter your full name';
      render(<Input helperText={helperText} />);
      
      const helper = screen.getByText(helperText);
      const input = screen.getByRole('textbox');
      
      expect(helper).toBeInTheDocument();
      expect(helper).toHaveClass('text-gray-500');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('should show error instead of helper text when both provided', () => {
      render(
        <Input 
          error="Error message" 
          helperText="Helper message" 
        />
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper message')).not.toBeInTheDocument();
    });
  });

  describe('width', () => {
    it('should not be full width by default', () => {
      const { container } = render(<Input />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).not.toHaveClass('w-full');
    });

    it('should be full width when specified', () => {
      const { container } = render(<Input fullWidth />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('w-full');
    });
  });

  describe('prefix and suffix', () => {
    it('should render prefix when provided', () => {
      render(<Input prefix="$" />);
      
      const prefix = screen.getByText('$');
      expect(prefix).toBeInTheDocument();
      expect(prefix).toHaveClass('absolute', 'left-4');
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-10');
    });

    it('should render suffix when provided', () => {
      render(<Input suffix="@gmail.com" />);
      
      const suffix = screen.getByText('@gmail.com');
      expect(suffix).toBeInTheDocument();
      expect(suffix).toHaveClass('absolute', 'right-4');
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pr-10');
    });

    it('should render both prefix and suffix', () => {
      render(<Input prefix="$" suffix="USD" />);
      
      expect(screen.getByText('$')).toBeInTheDocument();
      expect(screen.getByText('USD')).toBeInTheDocument();
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-10', 'pr-10');
    });
  });

  describe('interactions', () => {
    it('should handle value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello');
      
      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('Hello');
    });

    it('should handle focus events', async () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
      
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should not allow input when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} disabled />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello');
      
      expect(handleChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('');
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML input attributes', () => {
      render(
        <Input 
          type="email"
          name="email"
          autoComplete="email"
          maxLength={50}
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('name', 'email');
      expect(input).toHaveAttribute('autocomplete', 'email');
      expect(input).toHaveAttribute('maxlength', '50');
      expect(input).toHaveAttribute('pattern');
    });

    it('should handle required attribute', () => {
      render(<Input required />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });
});