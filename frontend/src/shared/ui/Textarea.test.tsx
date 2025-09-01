import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Textarea from './Textarea';

describe('Textarea 2025', () => {
  it('renders with default props', () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Textarea label="Description" />);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('renders with required indicator', () => {
    render(<Textarea label="Description" isRequired />);
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveAttribute('aria-label', 'обязательное поле');
  });

  it('renders with error state', () => {
    render(<Textarea error="This field is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders with helper text', () => {
    render(<Textarea helperText="Enter a detailed description" />);
    expect(screen.getByText('Enter a detailed description')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Textarea variant="default" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-gray-300', 'bg-white');

    rerender(<Textarea variant="filled" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-transparent', 'bg-gray-50');

    rerender(<Textarea variant="outlined" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-2', 'border-gray-300');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Textarea size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-3 py-1.5 text-sm');

    rerender(<Textarea size="md" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-3 py-2 text-sm');

    rerender(<Textarea size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-4 py-3 text-base');
  });

  it('renders with different resize options', () => {
    const { rerender } = render(<Textarea resize="none" />);
    expect(screen.getByRole('textbox')).toHaveClass('resize-none');

    rerender(<Textarea resize="vertical" />);
    expect(screen.getByRole('textbox')).toHaveClass('resize-y');

    rerender(<Textarea resize="horizontal" />);
    expect(screen.getByRole('textbox')).toHaveClass('resize-x');

    rerender(<Textarea resize="both" />);
    expect(screen.getByRole('textbox')).toHaveClass('resize');
  });

  it('shows character count when enabled', () => {
    render(<Textarea maxLength={100} showCharacterCount value="Hello" />);
    expect(screen.getByText('5 / 100 символов')).toBeInTheDocument();
  });

  it('changes character count color when approaching limit', () => {
    render(<Textarea maxLength={10} showCharacterCount value="Hello world" />);
    const counter = screen.getByText('11 / 10 символов');
    expect(counter).toHaveClass('text-red-600');
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Textarea onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New text' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('supports full width', () => {
    render(<Textarea fullWidth />);
    expect(screen.getByRole('textbox')).toHaveClass('w-full');
  });

  it('supports reduced motion', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toHaveClass('motion-reduce:transition-none');
  });

  it('has proper a11y attributes', () => {
    render(<Textarea label="Description" isRequired error="Required field" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });
});
