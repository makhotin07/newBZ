import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '../../../widgets/Layout/Layout';
import { AuthProvider } from '../../../app/providers/AuthProvider';
import { ThemeProvider } from '../../../app/providers/ThemeProvider';

// Mock the child components
jest.mock('../../../widgets/Layout/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../../../widgets/Layout/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

const mockUser = {
  id: '1',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  full_name: 'Test User'
};

// Mock the auth context
jest.mock('../../../app/providers/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: mockUser,
    token: 'mock-token',
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn()
  })
}));

// Mock the theme context
jest.mock('../../../app/providers/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    isDark: false
  })
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            {component}
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Layout Component', () => {
  test('renders header and sidebar', () => {
    renderWithProviders(<Layout />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  test('has correct layout structure', () => {
    const { container } = renderWithProviders(<Layout />);
    
    // Check for main layout structure
    const layoutDiv = container.querySelector('.flex.min-h-screen');
    expect(layoutDiv).toBeInTheDocument();
  });

  test('includes outlet for nested routes', () => {
    const { container } = renderWithProviders(<Layout />);
    
    // The Outlet component should be rendered
    // We can't directly test for Outlet, but we can check the structure
    expect(container.querySelector('.flex-1')).toBeInTheDocument();
  });
});
