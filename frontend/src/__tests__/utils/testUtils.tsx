import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { ThemeProvider } from '../../app/providers/ThemeProvider';

// Mock user for tests
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  full_name: 'Test User'
};

// Mock auth context
export const mockAuthContext = {
  user: mockUser,
  token: 'mock-token',
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn()
};

// Mock theme context  
export const mockThemeContext = {
  theme: 'light' as const,
  setTheme: jest.fn(),
  isDark: false
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  user?: any;
  theme?: string;
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const AllTheProviders: React.FC<{
  children: React.ReactNode;
  initialEntries?: string[];
}> = ({ children, initialEntries = ['/'] }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  { initialEntries, ...options }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTheProviders initialEntries={initialEntries}>
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock workspace data
export const mockWorkspace = {
  id: '1',
  name: 'Test Workspace',
  description: 'A test workspace',
  created_by: mockUser.id,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  is_active: true
};

// Mock note data
export const mockNote = {
  id: '1',
  title: 'Test Note',
  content: 'This is a test note content',
  workspace: mockWorkspace.id,
  created_by: mockUser.id,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  is_template: false,
  tags: [],
  category: null
};

// Mock task data
export const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'This is a test task',
  board: '1',
  status: '1',
  created_by: mockUser.id,
  assigned_to: null,
  priority: 'medium' as const,
  due_date: null,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  order: 0,
  labels: [],
  attachments: []
};

// Mock API responses
export const mockApiResponse = <T,>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {}
});

export const mockPaginatedResponse = <T,>(data: T[]) => ({
  results: data,
  count: data.length,
  next: null,
  previous: null
});
