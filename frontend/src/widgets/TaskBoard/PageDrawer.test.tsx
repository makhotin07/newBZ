import React from 'react';
import { render, screen } from '@testing-library/react';
import PageDrawer from './PageDrawer';

// Мокаем SidePanel для изоляции тестов
jest.mock('../../shared/ui/SidePanel', () => {
  return function MockSidePanel({ children, isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="side-panel">
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    );
  };
});

describe('PageDrawer', () => {
  const mockPage = {
    id: '1',
    title: 'Test Page',
    content: 'Test content',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  };

  const mockOnClose = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    page: mockPage
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('отображает данные страницы', () => {
    render(<PageDrawer {...defaultProps} />);
    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('не рендерится без страницы', () => {
    render(<PageDrawer {...defaultProps} page={null} />);
    expect(screen.queryByTestId('side-panel')).not.toBeInTheDocument();
  });

  it('отображает дату обновления', () => {
    render(<PageDrawer {...defaultProps} />);
    expect(screen.getByText(/Обновлено:/)).toBeInTheDocument();
  });

  it('отображает заголовок страницы', () => {
    render(<PageDrawer {...defaultProps} />);
    const title = screen.getByText('Test Page');
    expect(title).toHaveClass('text-3xl', 'font-bold');
  });
});
