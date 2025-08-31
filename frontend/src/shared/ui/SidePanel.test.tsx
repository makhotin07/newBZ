import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidePanel from './SidePanel';

describe('SidePanel', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    children: <div>Test content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('рендерит панель когда открыта', () => {
    render(<SidePanel {...defaultProps} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('не рендерит панель когда закрыта', () => {
    render(<SidePanel {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test content')).not.toBeInTheDocument();
  });

  it('отображает заголовок когда передан', () => {
    render(<SidePanel {...defaultProps} title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('вызывает onClose при клике на кнопку закрытия', () => {
    render(<SidePanel {...defaultProps} title="Test Title" />);
    const closeButton = screen.getByTitle('Закрыть');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('вызывает onClose при клике на overlay', () => {
    render(<SidePanel {...defaultProps} />);
    const overlay = screen.getByRole('presentation');
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('применяет кастомную ширину', () => {
    render(<SidePanel {...defaultProps} width={50} />);
    const panel = screen.getByRole('presentation').nextElementSibling;
    expect(panel).toHaveStyle({ width: '50%' });
  });

  it('применяет кастомные CSS классы', () => {
    render(<SidePanel {...defaultProps} className="custom-class" />);
    const panel = screen.getByRole('presentation').nextElementSibling;
    expect(panel).toHaveClass('custom-class');
  });
});
