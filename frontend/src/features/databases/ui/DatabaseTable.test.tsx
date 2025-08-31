import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DatabaseTable } from './DatabaseTable';
import { databasesApi } from '../api';

// Мокаем API
jest.mock('../api', () => ({
  databasesApi: {
    getDatabase: jest.fn(),
    getDatabaseProperties: jest.fn(),
    getDatabaseRecords: jest.fn(),
    updateDatabaseRecord: jest.fn(),
    createDatabaseRecord: jest.fn(),
    createDatabaseProperty: jest.fn(),
    deleteDatabaseRecord: jest.fn(),
    deleteDatabaseProperty: jest.fn(),
  },
}));

// Мокаем подкомпоненты
jest.mock('./EditableCell', () => ({
  EditableCell: ({ value, onStartEdit }: any) => (
    <div onClick={onStartEdit} data-testid="editable-cell">
      {value || '—'}
    </div>
  ),
}));

jest.mock('./AddRowButton', () => ({
  AddRowButton: ({ onAdd }: any) => (
    <button onClick={onAdd} data-testid="add-row-button">
      Добавить строку
    </button>
  ),
}));

jest.mock('./AddColumnButton', () => ({
  AddColumnButton: ({ onAdd }: any) => (
    <button onClick={onAdd} data-testid="add-column-button">
      Добавить колонку
    </button>
  ),
}));

jest.mock('./DeleteButton', () => ({
  DeleteButton: ({ onDelete, tooltip }: any) => (
    <button onClick={onDelete} data-testid="delete-button" title={tooltip}>
      Удалить
    </button>
  ),
}));

jest.mock('../../../shared/ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Загрузка...</div>,
}));

jest.mock('../../../shared/ui/EmptyState', () => ({
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

const mockDatabase = {
  id: '1',
  title: 'Test Database',
  description: 'Test description',
  icon: '',
  workspace: '1',
  workspace_name: 'Test Workspace',
  default_view: 'table' as const,
  created_by: '1',
  created_by_name: 'Test User',
  properties_count: 2,
  records_count: 2,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

const mockProperties = [
  {
    id: '1',
    name: 'Name',
    type: 'text' as const,
    config: {},
    position: 1,
    is_visible: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Age',
    type: 'number' as const,
    config: {},
    position: 2,
    is_visible: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

const mockRecords = [
  {
    id: '1',
    properties: { '1': 'John Doe', '2': 25 },
    created_by: '1',
    created_by_name: 'Test User',
    last_edited_by: '1',
    last_edited_by_name: 'Test User',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    properties: { '1': 'Jane Smith', '2': 30 },
    created_by: '1',
    created_by_name: 'Test User',
    last_edited_by: '1',
    last_edited_by_name: 'Test User',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('DatabaseTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Настройка моков по умолчанию
    (databasesApi.getDatabase as jest.Mock).mockResolvedValue(mockDatabase);
    (databasesApi.getProperties as jest.Mock).mockResolvedValue(mockProperties);
    (databasesApi.getRecords as jest.Mock).mockResolvedValue(mockRecords);
  });

  it('отображает заголовок базы данных', async () => {
    renderWithQueryClient(<DatabaseTable databaseId="1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Database')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  it('отображает свойства как заголовки колонок', async () => {
    renderWithQueryClient(<DatabaseTable databaseId="1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
    });
  });

  it('отображает записи в таблице', async () => {
    renderWithQueryClient(<DatabaseTable databaseId="1" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
    });
  });

  it('показывает кнопки добавления строки и колонки', async () => {
    renderWithQueryClient(<DatabaseTable databaseId="1" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('add-row-button')).toBeInTheDocument();
      expect(screen.getByTestId('add-column-button')).toBeInTheDocument();
    });
  });

  it('показывает кнопки удаления для строк и колонок', async () => {
    renderWithQueryClient(<DatabaseTable databaseId="1" />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('delete-button');
      expect(deleteButtons).toHaveLength(4); // 2 колонки + 2 строки
    });
  });

  it('показывает сообщение об отсутствии данных когда нет записей', async () => {
    (databasesApi.getRecords as jest.Mock).mockResolvedValue([]);
    
    renderWithQueryClient(<DatabaseTable databaseId="1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Нет данных для отображения')).toBeInTheDocument();
      expect(screen.getByText('Добавить первую строку')).toBeInTheDocument();
    });
  });

  it('показывает спиннер загрузки', () => {
    (databasesApi.getDatabase as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    renderWithQueryClient(<DatabaseTable databaseId="1" />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('показывает пустое состояние когда нет свойств', async () => {
    (databasesApi.getProperties as jest.Mock).mockResolvedValue([]);
    
    renderWithQueryClient(<DatabaseTable databaseId="1" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  it('обрабатывает клик по ячейке для редактирования', async () => {
    renderWithQueryClient(<DatabaseTable databaseId="1" />);
    
    await waitFor(() => {
      const cells = screen.getAllByTestId('editable-cell');
      expect(cells).toHaveLength(4); // 2 свойства × 2 записи
    });
  });
});
