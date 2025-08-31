import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PagesList from './PagesList';

// Мокаем PageDrawer для изоляции тестов
jest.mock('./PageDrawer', () => {
  return function MockPageDrawer({ isOpen, onClose, page }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="page-drawer">
        <button onClick={onClose}>Close Drawer</button>
        <div>Page: {page?.title}</div>
      </div>
    );
  };
});

describe('PagesList', () => {
  const mockPages = [
    {
      id: '1',
      title: 'First Page',
      content: 'Content of first page',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    },
    {
      id: '2',
      title: 'Second Page',
      content: 'Content of second page',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-04T00:00:00Z'
    }
  ];

  const mockOnCreatePage = jest.fn();

  const defaultProps = {
    pages: mockPages,
    onCreatePage: mockOnCreatePage
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('отображает список страниц', () => {
    render(<PagesList {...defaultProps} />);
    expect(screen.getByText('First Page')).toBeInTheDocument();
    expect(screen.getByText('Second Page')).toBeInTheDocument();
  });

  it('отображает заголовок "Страницы"', () => {
    render(<PagesList {...defaultProps} />);
    expect(screen.getByText('Страницы')).toBeInTheDocument();
  });

  it('отображает кнопку создания страницы когда onCreatePage передан', () => {
    render(<PagesList {...defaultProps} />);
    const createButton = screen.getByTitle('Создать страницу');
    expect(createButton).toBeInTheDocument();
  });

  it('не отображает кнопку создания страницы когда onCreatePage не передан', () => {
    render(<PagesList pages={mockPages} />);
    expect(screen.queryByTitle('Создать страницу')).not.toBeInTheDocument();
  });

  it('вызывает onCreatePage при клике на кнопку создания', () => {
    render(<PagesList {...defaultProps} />);
    const createButton = screen.getByTitle('Создать страницу');
    fireEvent.click(createButton);
    expect(mockOnCreatePage).toHaveBeenCalledTimes(1);
  });

  it('открывает PageDrawer при клике на страницу', () => {
    render(<PagesList {...defaultProps} />);
    const firstPage = screen.getByText('First Page');
    fireEvent.click(firstPage);
    
    expect(screen.getByTestId('page-drawer')).toBeInTheDocument();
    expect(screen.getByText('Page: First Page')).toBeInTheDocument();
  });

  it('отображает сообщение когда нет страниц', () => {
    render(<PagesList pages={[]} onCreatePage={mockOnCreatePage} />);
    expect(screen.getByText('Нет страниц')).toBeInTheDocument();
    expect(screen.getByText('Создать первую страницу')).toBeInTheDocument();
  });

  it('отображает дату обновления для каждой страницы', () => {
    render(<PagesList {...defaultProps} />);
    expect(screen.getByText('01.01.2024')).toBeInTheDocument();
    expect(screen.getByText('01.04.2024')).toBeInTheDocument();
  });

  it('отображает превью контента страницы', () => {
    render(<PagesList {...defaultProps} />);
    expect(screen.getByText('Content of first page')).toBeInTheDocument();
    expect(screen.getByText('Content of second page')).toBeInTheDocument();
  });
});
