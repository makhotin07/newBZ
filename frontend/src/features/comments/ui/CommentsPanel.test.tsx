import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CommentsPanel from './CommentsPanel';
import * as commentsApi from '../api';

// Mock API hooks
jest.mock('../api', () => ({
  usePageComments: jest.fn(),
  useCreateComment: jest.fn(),
  useUpdateComment: jest.fn(),
  useDeleteComment: jest.fn(),
  useResolveComment: jest.fn(),
}));

const mockComments = [
  {
    id: 1,
    content: 'Тестовый комментарий',
    author: 1,
    author_name: 'Иван Иванов',
    author_avatar: '/avatar.jpg',
    parent: null,
    block: null,
    is_resolved: false,
    replies: [],
    created_at: '2023-12-19T10:00:00Z',
    updated_at: '2023-12-19T10:00:00Z',
  },
  {
    id: 2,
    content: 'Решённый комментарий',
    author: 2,
    author_name: 'Петр Петров',
    author_avatar: '/avatar2.jpg',
    parent: null,
    block: null,
    is_resolved: true,
    replies: [],
    created_at: '2023-12-19T09:00:00Z',
    updated_at: '2023-12-19T09:30:00Z',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CommentsPanel', () => {
  const mockMutations = {
    mutateAsync: jest.fn(),
    isPending: false,
  };

  beforeEach(() => {
    (commentsApi.usePageComments as jest.Mock).mockReturnValue({
      data: { data: mockComments },
      isLoading: false,
      error: null,
    });
    
    (commentsApi.useCreateComment as jest.Mock).mockReturnValue(mockMutations);
    (commentsApi.useUpdateComment as jest.Mock).mockReturnValue(mockMutations);
    (commentsApi.useDeleteComment as jest.Mock).mockReturnValue(mockMutations);
    (commentsApi.useResolveComment as jest.Mock).mockReturnValue(mockMutations);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('отображается когда открыта', () => {
    render(
      <CommentsPanel
        pageId="test-page"
        isOpen={true}
        onClose={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Комментарии (2)')).toBeInTheDocument();
  });

  test('не отображается когда закрыта', () => {
    render(
      <CommentsPanel
        pageId="test-page"
        isOpen={false}
        onClose={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText('Комментарии')).not.toBeInTheDocument();
  });

  test('отображает все комментарии по умолчанию', () => {
    render(
      <CommentsPanel
        pageId="test-page"
        isOpen={true}
        onClose={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Тестовый комментарий')).toBeInTheDocument();
    expect(screen.getByText('Решённый комментарий')).toBeInTheDocument();
    expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    expect(screen.getByText('Петр Петров')).toBeInTheDocument();
  });

  test('фильтрует комментарии по статусу', () => {
    render(
      <CommentsPanel
        pageId="test-page"
        isOpen={true}
        onClose={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    // Переключаемся на фильтр "Открытые"
    fireEvent.click(screen.getByText('Открытые'));

    expect(screen.getByText('Тестовый комментарий')).toBeInTheDocument();
    expect(screen.queryByText('Решённый комментарий')).not.toBeInTheDocument();

    // Переключаемся на фильтр "Решённые"
    fireEvent.click(screen.getByText('Решённые'));

    expect(screen.queryByText('Тестовый комментарий')).not.toBeInTheDocument();
    expect(screen.getByText('Решённый комментарий')).toBeInTheDocument();
  });

  test('создаёт новый комментарий', async () => {
    render(
      <CommentsPanel
        pageId="test-page"
        isOpen={true}
        onClose={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByPlaceholderText(/Написать комментарий/);
    const sendButton = screen.getByText('Отправить');

    fireEvent.change(textarea, { target: { value: 'Новый комментарий' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockMutations.mutateAsync).toHaveBeenCalledWith({
        pageId: 'test-page',
        data: { content: 'Новый комментарий' },
      });
    });
  });

  test('создаёт комментарий через Ctrl+Enter', async () => {
    render(
      <CommentsPanel
        pageId="test-page"
        isOpen={true}
        onClose={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByPlaceholderText(/Написать комментарий/);

    fireEvent.change(textarea, { target: { value: 'Комментарий через hotkey' } });
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    await waitFor(() => {
      expect(mockMutations.mutateAsync).toHaveBeenCalledWith({
        pageId: 'test-page',
        data: { content: 'Комментарий через hotkey' },
      });
    });
  });

  test('закрывается при клике на кнопку закрытия', () => {
    const onClose = jest.fn();
    
    render(
      <CommentsPanel
        pageId="test-page"
        isOpen={true}
        onClose={onClose}
      />,
      { wrapper: createWrapper() }
    );

    const closeButton = screen.getByLabelText('Закрыть панель комментариев');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  test('отображает состояние загрузки', () => {
    (commentsApi.usePageComments as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(
      <CommentsPanel
        pageId="test-page"
        isOpen={true}
        onClose={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Загрузка комментариев...')).toBeInTheDocument();
  });

  test('отображает ошибку загрузки', () => {
    (commentsApi.usePageComments as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Ошибка сети'),
    });

    render(
      <CommentsPanel
        pageId="test-page"
        isOpen={true}
        onClose={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Ошибка загрузки комментариев')).toBeInTheDocument();
  });

  test('отображает пустое состояние', () => {
    (commentsApi.usePageComments as jest.Mock).mockReturnValue({
      data: { data: [] },
      isLoading: false,
      error: null,
    });

    render(
      <CommentsPanel
        pageId="test-page"
        isOpen={true}
        onClose={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Нет комментариев')).toBeInTheDocument();
  });

  test('отображает статус "Решено"', () => {
    render(
      <CommentsPanel
        pageId="test-page"
        isOpen={true}
        onClose={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    // Проверяем, что решённый комментарий имеет соответствующий статус
    const resolvedComments = screen.getAllByText('Решено');
    expect(resolvedComments).toHaveLength(1);
  });

  test('имеет правильную accessibility структуру', () => {
    render(
      <CommentsPanel
        pageId="test-page"
        isOpen={true}
        onClose={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    // Проверяем ARIA атрибуты
    const closeButton = screen.getByLabelText('Закрыть панель комментариев');
    expect(closeButton).toBeInTheDocument();

    // Проверяем, что textarea имеет правильные атрибуты
    const textarea = screen.getByPlaceholderText(/Написать комментарий/);
    expect(textarea).toBeInTheDocument();
  });
});
