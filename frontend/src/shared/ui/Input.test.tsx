import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Email" placeholder="Enter email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<Input label="Email" isRequired placeholder="Enter email" />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders with helper text', () => {
    render(
      <Input 
        label="Email" 
        helperText="We'll never share your email" 
        placeholder="Enter email" 
      />
    );
    expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(
      <Input 
        label="Email" 
        error="Email is required" 
        placeholder="Enter email" 
      />
    );
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders with left icon', () => {
    const leftIcon = <span data-testid="left-icon">🔍</span>;
    render(<Input leftIcon={leftIcon} placeholder="Search" />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    const rightIcon = <span data-testid="right-icon">✓</span>;
    render(<Input rightIcon={rightIcon} placeholder="Enter text" />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('test');
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toHaveClass('custom-input');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="Enter text" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('generates unique id when not provided', () => {
    render(<Input label="Email" placeholder="Enter email" />);
    const input = screen.getByPlaceholderText('Enter email');
    const label = screen.getByText('Email');
    
    expect(input.id).toBeTruthy();
    expect(label.getAttribute('for')).toBe(input.id);
  });

  it('uses provided id', () => {
    render(<Input id="custom-id" label="Email" placeholder="Enter email" />);
    const input = screen.getByPlaceholderText('Enter email');
    const label = screen.getByText('Email');
    
    expect(input.id).toBe('custom-id');
    expect(label.getAttribute('for')).toBe('custom-id');
  });
});
